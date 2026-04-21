import { request } from "./http";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  wage?: number;
}

export interface AuthResponse {
  token: string;
}

export const authApi = {
  login(data: LoginRequest): Promise<AuthResponse> {
    return request<AuthResponse>({
      method: "POST",
      url: "/user/login",
      data,
    });
  },
  register(data: RegisterRequest): Promise<AuthResponse> {
    return request<AuthResponse>({
      method: "POST",
      url: "/user/register",
      data,
    });
  },
};
