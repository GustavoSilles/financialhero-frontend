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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
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
  forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    return request<MessageResponse>({
      method: "POST",
      url: "/user/forgot-password",
      data,
    });
  },
  resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    return request<MessageResponse>({
      method: "PATCH",
      url: "/user/reset-password",
      data,
    });
  },
};
