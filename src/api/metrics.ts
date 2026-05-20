import { request } from "./http";

export interface MetricsByCategory {
  category: string;
  totalAmount: number;
  hoursNeeded: number;
}

export interface MetricsSummary {
  totalAmount: number;
  totalHours: number;
  previousMonthTotal: number;
  percentChange: number;
  receiptsCount: number;
  recurring: number;
  oneOff: number;
}

export interface MetricsResponse {
  period: {
    month: number;
    year: number;
  };
  summary: MetricsSummary;
  byCategory: MetricsByCategory[];
}

export interface GetMetricsParams {
  userId: string | number;
  month: number;
  year: number;
}

export const metricsApi = {
  get({ userId, month, year }: GetMetricsParams): Promise<MetricsResponse> {
    return request<MetricsResponse>({
      method: "GET",
      url: `/metrics/${userId}`,
      params: { month, year },
    });
  },
};
