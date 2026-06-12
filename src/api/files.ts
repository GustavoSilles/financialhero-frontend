import { http, request } from "./http";
import { authStorage } from "./storage";

export type FileType = "COBRANCA" | "COMPROVANTE";

export interface FileUpload {
  id: number;
  billId: number;
  name: string;
  hash: string;
  type: FileType;
  path: string;
  year: number | null;
  month: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadFileParams {
  billId: string | number;
  file: File;
  type: FileType;
  year?: number;
  month?: number;
}

export interface ListFilesParams {
  type?: FileType;
  billId?: string | number;
  search?: string;
}

export const filesApi = {
  async upload({ billId, file, type, year, month }: UploadFileParams): Promise<FileUpload> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const qs = new URLSearchParams({ type });
    if (year !== undefined) qs.set("year", String(year));
    if (month !== undefined) qs.set("month", String(month));

    const response = await http.post<FileUpload>(
      `/file-upload/${billId}/upload?${qs.toString()}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  list({ type, billId, search }: ListFilesParams = {}): Promise<FileUpload[]> {
    return request<FileUpload[]>({
      method: "GET",
      url: `/file-upload`,
      params: {
        ...(type !== undefined ? { type } : {}),
        ...(billId !== undefined ? { billId } : {}),
        ...(search ? { search } : {}),
      },
    });
  },

  async download(fileId: string | number): Promise<Blob> {
    return request<Blob>({
      method: "GET",
      url: `/file-upload/${fileId}`,
      responseType: "blob",
    });
  },

  remove(fileId: string | number): Promise<{ message: string }> {
    return request<{ message: string }>({
      method: "DELETE",
      url: `/file-upload/${fileId}`,
    });
  },

  downloadUrl(fileId: string | number): string {
    const token = authStorage.getToken();
    const base = http.defaults.baseURL ?? "";
    const url = new URL(`${base}/file-upload/${fileId}`);
    if (token) url.searchParams.set("token", token);
    return url.toString();
  },
};
