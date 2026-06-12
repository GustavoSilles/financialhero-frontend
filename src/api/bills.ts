import { request } from "./http";

export type BillType =
  | "MORADIA"
  | "ALIMENTACAO"
  | "SERVICOS"
  | "SAUDE"
  | "TRANSPORTE"
  | "OUTROS";

export interface Bill {
  id: number;
  type: BillType;
  description: string;
  amount: number | string;
  name: string;
  expirationDate: string;
  isRecurring: boolean;
  isPaid: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SortField {
  property?: string;
  direction?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalItems: number;
  itemCount: number;
  sort: SortField[];
}

export interface ListBillsParams {
  userId: string | number;
  page?: number;
  size?: number;
  sort?: string;
  year?: number;
  month?: number;
}

export interface PayBillParams {
  userId: string | number;
  billId: string | number;
  isPaid: boolean;
  year?: number;
  month?: number;
}

export interface DeleteBillParams {
  userId: string | number;
  billId: string | number;
}

export interface CreateBillRequest {
  billType: BillType;
  name: string;
  amount: number;
  expirationDate: string;
  isRecurring?: boolean;
  description?: string;
}

export const MONTHS = [
  "JANEIRO",
  "FEVEREIRO",
  "MARCO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO",
] as const;

export type Month = (typeof MONTHS)[number];

export interface MonthBill {
  id: number;
  type: BillType;
  description: string;
  amount: number | string;
  name: string;
  expirationDate: string;
  isPaid: boolean;
  month: Month;
  year: number | string;
}

export interface MonthlyBillsParams {
  userId: string | number;
  months: Month[];
  year: number | string;
}

export interface UpcomingBill {
  id: number;
  name: string;
  amount: number;
  expirationDate: string;
  daysUntilDue: number;
  isRecurring: boolean;
  type: BillType;
}

export interface UpcomingBillsResponse {
  bills: UpcomingBill[];
}

export interface UpcomingBillsParams {
  userId: string | number;
  days?: number;
}

export type TrendMonths = 3 | 6 | 12;

export interface TrendPoint {
  month: number;
  year: number;
  total: number;
  recurring: number;
  oneOff: number;
}

export interface TrendResponse {
  series: TrendPoint[];
}

export interface TrendParams {
  userId: string | number;
  months: TrendMonths;
}

export const billsApi = {
  list({ userId, page = 0, size = 10, sort = "created_at,desc", year, month }: ListBillsParams): Promise<PagedResponse<Bill>> {
    const params: Record<string, unknown> = { page, size, sort };
    if (year !== undefined) params.year = year;
    if (month !== undefined) params.month = month;
    return request<PagedResponse<Bill>>({
      method: "GET",
      url: `/bill/${userId}/list`,
      params,
    });
  },

  monthly({ userId, months, year }: MonthlyBillsParams): Promise<Partial<Record<Month, MonthBill[]>>> {
    return request<Partial<Record<Month, MonthBill[]>>>({
      method: "GET",
      url: `/bill/${userId}/monthly`,
      params: { months, year: String(year) },
    });
  },

  pay({ userId, billId, isPaid, year, month }: PayBillParams): Promise<{ message: string }> {
    const data: Record<string, unknown> = { isPaid };
    if (year !== undefined) data.year = year;
    if (month !== undefined) data.month = month;
    return request<{ message: string }>({
      method: "PUT",
      url: `/bill/${userId}/bill/${billId}/pay`,
      data,
    });
  },

  create(userId: string | number, data: CreateBillRequest): Promise<Bill> {
    return request<Bill>({
      method: "POST",
      url: `/bill/${userId}/create`,
      data,
    });
  },

  remove({ userId, billId }: DeleteBillParams): Promise<{ message: string }> {
    return request<{ message: string }>({
      method: "DELETE",
      url: `/bill/${userId}/bill/${billId}`,
    });
  },

  getUpcoming({ userId, days }: UpcomingBillsParams): Promise<UpcomingBillsResponse> {
    const params: Record<string, unknown> = {};
    if (days !== undefined) params.days = days;
    return request<UpcomingBillsResponse>({
      method: "GET",
      url: `/bill/${userId}/upcoming`,
      params,
    });
  },

  getTrend({ userId, months }: TrendParams): Promise<TrendResponse> {
    return request<TrendResponse>({
      method: "GET",
      url: `/bill/${userId}/trend`,
      params: { months },
    });
  },
};
