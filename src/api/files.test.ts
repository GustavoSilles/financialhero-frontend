import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock do módulo http: precisamos de http.post (upload), request (list/download)
// e http.defaults.baseURL (downloadUrl). authStorage continua REAL.
const { mockRequest, mockPost } = vi.hoisted(() => ({
  mockRequest: vi.fn(),
  mockPost: vi.fn(),
}));
vi.mock("./http", () => ({
  request: mockRequest,
  http: { post: mockPost, defaults: { baseURL: "http://localhost:8080" } },
}));

import { filesApi } from "./files";
import { authStorage } from "./storage";

describe("filesApi", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({});
    mockPost.mockReset();
    mockPost.mockResolvedValue({ data: {} });
  });
  afterEach(() => window.localStorage.clear());

  // downloadUrl: sem token, devolve a URL pública crua do arquivo
  it("downloadUrl() builds the file URL without a token when logged out", () => {
    expect(filesApi.downloadUrl(42)).toBe("http://localhost:8080/file-upload/42");
  });

  // downloadUrl: com token, anexa ?token= para o navegador baixar autenticado
  // (download direto via <a>/href não passa pelo header Authorization)
  it("downloadUrl() appends the auth token as a query param when present", () => {
    authStorage.setToken("jwt-123");

    const url = new URL(filesApi.downloadUrl(42));
    expect(url.pathname).toBe("/file-upload/42");
    expect(url.searchParams.get("token")).toBe("jwt-123");
  });

  // list: sem filtros, não envia params espúrios
  it("list() sends no params when called without filters", async () => {
    await filesApi.list();

    const config = mockRequest.mock.calls[0][0];
    expect(config.url).toBe("/file-upload");
    expect(config.params).toEqual({});
  });

  it("list() forwards type, billId and search filters", async () => {
    await filesApi.list({ type: "COMPROVANTE", billId: 3, search: "nota fiscal" });

    expect(mockRequest.mock.calls[0][0].params).toEqual({
      type: "COMPROVANTE",
      billId: 3,
      search: "nota fiscal",
    });
  });

  // Sutileza: busca vazia ("") não deve virar um filtro — seria ruído na query
  it("list() drops an empty search string", async () => {
    await filesApi.list({ search: "" });

    expect(mockRequest.mock.calls[0][0].params).not.toHaveProperty("search");
  });

  // download: pede o blob do arquivo (responseType correto)
  it("download() requests the file as a blob", async () => {
    await filesApi.download(42);

    expect(mockRequest.mock.calls[0][0]).toMatchObject({
      method: "GET",
      url: "/file-upload/42",
      responseType: "blob",
    });
  });

  // remove: DELETE no arquivo pelo id
  it("remove() sends a DELETE to the file endpoint", async () => {
    await filesApi.remove(42);

    expect(mockRequest.mock.calls[0][0]).toMatchObject({
      method: "DELETE",
      url: "/file-upload/42",
    });
  });

  // upload: monta FormData (file + type) e a query string com type/year/month
  it("upload() posts multipart FormData with the period in the query string", async () => {
    const file = new File(["conteudo"], "comprovante.pdf", { type: "application/pdf" });
    mockPost.mockResolvedValueOnce({ data: { id: 1, name: "comprovante.pdf" } });

    const result = await filesApi.upload({
      billId: 5,
      file,
      type: "COMPROVANTE",
      year: 2026,
      month: 4,
    });

    const [url, body, options] = mockPost.mock.calls[0];
    expect(url).toBe("/file-upload/5/upload?type=COMPROVANTE&year=2026&month=4");
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("file")).toBe(file);
    expect((body as FormData).get("type")).toBe("COMPROVANTE");
    expect(options.headers["Content-Type"]).toBe("multipart/form-data");
    expect(result).toEqual({ id: 1, name: "comprovante.pdf" });
  });

  // upload: sem year/month, a query string leva só o type
  it("upload() omits year/month from the query string when not provided", async () => {
    const file = new File(["x"], "cobranca.png", { type: "image/png" });

    await filesApi.upload({ billId: 8, file, type: "COBRANCA" });

    expect(mockPost.mock.calls[0][0]).toBe("/file-upload/8/upload?type=COBRANCA");
  });
});
