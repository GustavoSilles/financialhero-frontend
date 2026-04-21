import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";
import { authStorage } from "./storage";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

let isRedirectingOnUnauthorized = false;

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; details?: unknown }>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 && typeof window !== "undefined") {
      authStorage.clear();
      const onAuthRoute =
        window.location.pathname.startsWith("/login") ||
        window.location.pathname.startsWith("/register");
      if (!onAuthRoute && !isRedirectingOnUnauthorized) {
        isRedirectingOnUnauthorized = true;
        window.location.assign("/login");
      }
    }

    const apiError: ApiError = {
      message:
        data?.message ||
        (error.code === "ECONNABORTED"
          ? "Tempo de resposta esgotado"
          : error.message === "Network Error"
          ? "Erro de conexão com o servidor"
          : "Erro inesperado"),
      status,
      code: data?.code,
      details: data?.details,
    };

    return Promise.reject(apiError);
  }
);

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<T>(config);
  return response.data;
}
