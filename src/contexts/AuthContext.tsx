"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import {
  authApi,
  authStorage,
  type LoginRequest,
  type RegisterRequest,
} from "@/api";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  wage: number;
}

interface JwtPayload extends AuthUser {
  exp?: number;
  iat?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): AuthUser | null {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return {
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      wage: Number(payload.wage ?? 0),
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = authStorage.getToken();
    if (stored) {
      const decoded = decodeToken(stored);
      if (decoded) {
        setToken(stored);
        setUser(decoded);
      } else {
        authStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const applyToken = useCallback((newToken: string) => {
    const decoded = decodeToken(newToken);
    if (!decoded) {
      throw new Error("Token recebido é inválido");
    }
    authStorage.setToken(newToken);
    setToken(newToken);
    setUser(decoded);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const { token: newToken } = await authApi.login(data);
      applyToken(newToken);
    },
    [applyToken]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const { token: newToken } = await authApi.register(data);
      applyToken(newToken);
    },
    [applyToken]
  );

  const logout = useCallback(() => {
    authStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  }
  return ctx;
}
