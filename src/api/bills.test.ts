import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock do request: o foco aqui é a MONTAGEM da config HTTP (url, método,
// params, data) — não o transporte. request() real já é coberto em http.test.ts.
const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));
vi.mock("./http", () => ({ request: mockRequest }));

import { billsApi } from "./bills";

/** Devolve a config passada ao request na n-ésima chamada. */
function configOf(call = 0) {
  return mockRequest.mock.calls[call][0];
}

describe("billsApi", () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({});
  });

  // list: sem paginação explícita, aplica os defaults (page 0, size 10, sort)
  it("list() applies default pagination and sort", async () => {
    await billsApi.list({ userId: 7 });

    const config = configOf();
    expect(config.method).toBe("GET");
    expect(config.url).toBe("/bill/7/list");
    expect(config.params).toEqual({ page: 0, size: 10, sort: "created_at,desc" });
  });

  // list: year/month só entram nos params quando informados — caso contrário,
  // a chave NÃO pode existir (senão o backend filtraria por undefined)
  it("list() omits year/month when not provided", async () => {
    await billsApi.list({ userId: 7 });

    expect(configOf().params).not.toHaveProperty("year");
    expect(configOf().params).not.toHaveProperty("month");
  });

  it("list() includes year/month and custom paging when provided", async () => {
    await billsApi.list({ userId: 7, page: 2, size: 25, year: 2026, month: 5 });

    expect(configOf().params).toEqual({
      page: 2,
      size: 25,
      sort: "created_at,desc",
      year: 2026,
      month: 5,
    });
  });

  // monthly: o ano é serializado como string (contrato do endpoint)
  it("monthly() stringifies the year and forwards the months list", async () => {
    await billsApi.monthly({ userId: 7, months: ["JANEIRO", "FEVEREIRO"], year: 2026 });

    const config = configOf();
    expect(config.url).toBe("/bill/7/monthly");
    expect(config.params).toEqual({ months: ["JANEIRO", "FEVEREIRO"], year: "2026" });
  });

  // pay: monta a URL aninhada e envia apenas isPaid quando não há período
  it("pay() builds the nested URL and sends only isPaid by default", async () => {
    await billsApi.pay({ userId: 7, billId: 99, isPaid: true });

    const config = configOf();
    expect(config.method).toBe("PUT");
    expect(config.url).toBe("/bill/7/bill/99/pay");
    expect(config.data).toEqual({ isPaid: true });
    expect(config.data).not.toHaveProperty("year");
  });

  it("pay() includes year/month in the body when provided", async () => {
    await billsApi.pay({ userId: 7, billId: 99, isPaid: false, year: 2026, month: 3 });

    expect(configOf().data).toEqual({ isPaid: false, year: 2026, month: 3 });
  });

  // create: POST com o payload repassado intacto
  it("create() posts the bill payload to the create endpoint", async () => {
    const payload = {
      billType: "MORADIA" as const,
      name: "Aluguel",
      amount: 1500,
      expirationDate: "2026-06-10",
    };
    await billsApi.create(7, payload);

    const config = configOf();
    expect(config.method).toBe("POST");
    expect(config.url).toBe("/bill/7/create");
    expect(config.data).toEqual(payload);
  });

  // getUpcoming: sem "days", params fica vazio (backend usa seu próprio default)
  it("getUpcoming() sends empty params when days is omitted", async () => {
    await billsApi.getUpcoming({ userId: 7 });

    expect(configOf().url).toBe("/bill/7/upcoming");
    expect(configOf().params).toEqual({});
  });

  it("getUpcoming() forwards the days window when provided", async () => {
    await billsApi.getUpcoming({ userId: 7, days: 15 });

    expect(configOf().params).toEqual({ days: 15 });
  });

  // getTrend: o número de meses vai como param
  it("getTrend() forwards the months window", async () => {
    await billsApi.getTrend({ userId: 7, months: 6 });

    const config = configOf();
    expect(config.url).toBe("/bill/7/trend");
    expect(config.params).toEqual({ months: 6 });
  });
});
