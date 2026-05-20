import { request } from "./http";

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  wage?: number;
}

export interface UpdatedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  wage: number;
}

export interface UpdateUserResponse {
  data: UpdatedUser;
  token: string;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export const userApi = {
  update(userId: string | number, data: UpdateUserRequest): Promise<UpdateUserResponse> {
    return request<UpdateUserResponse>({
      method: "PUT",
      url: `/user/${userId}`,
      data,
    });
  },
  changePassword(
    userId: string | number,
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return request<ChangePasswordResponse>({
      method: "PATCH",
      url: `/user/${userId}/password`,
      data,
    });
  },
};
