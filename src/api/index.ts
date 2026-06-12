export { http, request } from "./http";
export type { ApiError } from "./http";

export { authStorage } from "./storage";

export { authApi } from "./auth";
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
} from "./auth";

export { userApi } from "./user";
export type {
  UpdateUserRequest,
  UpdateUserResponse,
  UpdatedUser,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "./user";

export { billsApi, MONTHS } from "./bills";
export type {
  Bill,
  BillType,
  PagedResponse,
  ListBillsParams,
  PayBillParams,
  DeleteBillParams,
  CreateBillRequest,
  Month,
  MonthBill,
  MonthlyBillsParams,
  UpcomingBill,
  UpcomingBillsResponse,
  UpcomingBillsParams,
  TrendMonths,
  TrendPoint,
  TrendResponse,
  TrendParams,
} from "./bills";

export { metricsApi } from "./metrics";
export type {
  MetricsResponse,
  MetricsSummary,
  MetricsByCategory,
  GetMetricsParams,
} from "./metrics";

export { filesApi } from "./files";
export type {
  FileUpload,
  FileType,
  UploadFileParams,
} from "./files";
