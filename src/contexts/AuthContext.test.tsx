import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";

// Mock só do authApi: login/register são controlados por teste.
// authStorage e decodeToken continuam REAIS — queremos exercitar a
// integração de verdade (localStorage + parsing de JWT).
// vi.hoisted: garante que os mocks existem antes da factory do vi.mock rodar.
const { mockAuthLogin, mockAuthRegister } = vi.hoisted(() => ({
  mockAuthLogin: vi.fn(),
  mockAuthRegister: vi.fn(),
}));
vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  return {
    ...actual,
    authApi: { ...actual.authApi, login: mockAuthLogin, register: mockAuthRegister },
  };
});

import { AuthProvider, useAuth } from "./AuthContext";
import { authStorage } from "@/api";

function base64url(v: string) {
  return Buffer.from(v, "utf-8")
    .toString("base64")
    .replace(/=+$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function makeJwt(payload: Record<string, unknown>) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  return `${header}.${base64url(JSON.stringify(payload))}.signature`;
}

const baseUser = {
  id: "user-1",
  email: "gustavo@example.com",
  firstName: "Gustavo",
  lastName: "Silles",
  wage: 5000,
};
const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const validToken = () => makeJwt({ ...baseUser, exp: futureExp() });

describe("AuthContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockAuthLogin.mockReset();
    mockAuthRegister.mockReset();
  });
  afterEach(() => cleanup());

  // Bootstrap: token válido no storage → sessão é restaurada ao montar o app
  it("restores an authenticated session from a valid stored token", async () => {
    const token = validToken();
    authStorage.setToken(token);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe(token);
    expect(result.current.user?.email).toBe(baseUser.email);
  });

  // Proteção: token vencido no storage é descartado — não restaura sessão
  it("discards an expired stored token on bootstrap", async () => {
    authStorage.setToken(makeJwt({ ...baseUser, exp: Math.floor(Date.now() / 1000) - 60 }));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(authStorage.getToken()).toBeNull();
  });

  // Sem token salvo → app inicia deslogado, mas termina de carregar
  it("starts unauthenticated when there is no stored token", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  // login(): chama a API, persiste o token e expõe o usuário decodificado
  it("logs in, persisting the token and exposing the decoded user", async () => {
    const token = validToken();
    mockAuthLogin.mockResolvedValueOnce({ token });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: "gustavo@example.com", password: "123456" });
    });

    expect(mockAuthLogin).toHaveBeenCalledWith({
      email: "gustavo@example.com",
      password: "123456",
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe(baseUser.email);
    expect(authStorage.getToken()).toBe(token);
  });

  // register(): mesmo contrato do login — persiste token e autentica
  it("registers, persisting the token and authenticating the user", async () => {
    const token = validToken();
    mockAuthRegister.mockResolvedValueOnce({ token });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.register({
        email: "gustavo@example.com",
        password: "12345678",
        firstName: "Gustavo",
        lastName: "Silles",
      });
    });

    expect(mockAuthRegister).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
    expect(authStorage.getToken()).toBe(token);
  });

  // logout(): zera token, usuário e storage
  it("logs out, clearing token, user and storage", async () => {
    authStorage.setToken(validToken());

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(authStorage.getToken()).toBeNull();
  });

  // Segurança: se a API devolver um token impossível de decodificar,
  // o login falha e NADA é persistido (não deixa o app num estado meio-logado)
  it("rejects login when the API returns an undecodable token", async () => {
    mockAuthLogin.mockResolvedValueOnce({ token: "not-a-real-jwt" });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(
        result.current.login({ email: "x@y.com", password: "z" })
      ).rejects.toThrow(/inválido/i);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(authStorage.getToken()).toBeNull();
  });

  // Contrato do hook: usar useAuth fora do provider é erro de programação
  it("throws when useAuth is used outside <AuthProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
    spy.mockRestore();
  });
});
