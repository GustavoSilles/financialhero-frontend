"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Upload,
  FileCheck,
  FileText,
  X,
  Download,
  Search,
  Paperclip,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  billsApi,
  filesApi,
  type ApiError,
  type Bill,
  type FileType,
  type FileUpload,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getCategoryStyle } from "@/components/dashboard/billCategories";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ACCEPT_ATTR = ACCEPTED_MIME_TYPES.join(",");

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

type TabKey = "RECORRENTES" | "AVULSOS";

interface MonthSlot {
  year: number;
  month: number; // 1-12
  label: string;
}

interface UploadTarget {
  bill: Bill;
  year?: number;
  month?: number;
  slotLabel?: string;
}

function toAmount(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

function formatDueDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR");
}

function buildMonthSlots(bill: Bill): MonthSlot[] {
  const firstDue = new Date(bill.expirationDate);
  const start = isNaN(firstDue.getTime()) ? new Date() : firstDue;
  const today = new Date();

  const startY = start.getUTCFullYear();
  const startM = start.getUTCMonth();
  const todayY = today.getFullYear();
  const todayM = today.getMonth();

  // Include at least the first due month, even if it's in the future
  const endY = startY > todayY || (startY === todayY && startM > todayM) ? startY : todayY;
  const endM = startY > todayY || (startY === todayY && startM > todayM) ? startM : todayM;

  const slots: MonthSlot[] = [];
  let y = startY;
  let m = startM;
  let guard = 0;
  while ((y < endY || (y === endY && m <= endM)) && guard < 120) {
    slots.push({
      year: y,
      month: m + 1,
      label: `${MONTH_NAMES[m]} ${y}`,
    });
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
    guard += 1;
  }
  return slots; // ordem cronológica: mais antigo primeiro
}

export default function ComprovantesPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("RECORRENTES");
  const [expandedBillIds, setExpandedBillIds] = useState<Set<number>>(new Set());

  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>("COMPROVANTE");
  const [uploading, setUploading] = useState(false);

  const loadBills = useCallback(async (userId: string | number) => {
    try {
      setError(null);
      const response = await billsApi.list({
        userId,
        page: 0,
        size: 100,
        sort: "expiration_date,desc",
      });
      setBills(response.content);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Não foi possível carregar as contas");
    }
  }, []);

  const loadUploads = useCallback(async () => {
    try {
      const files = await filesApi.list();
      setUploads(files);
    } catch (err) {
      const apiError = err as ApiError;
      showToast(
        "error",
        apiError.message ?? "Não foi possível carregar os comprovantes."
      );
    }
  }, [showToast]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoadingBills(false);
      return;
    }
    let cancelled = false;
    setLoadingBills(true);
    Promise.all([loadBills(user.id), loadUploads()]).finally(() => {
      if (!cancelled) setLoadingBills(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, loadBills, loadUploads]);

  const uploadsByBillId = useMemo(() => {
    const map = new Map<number, FileUpload[]>();
    uploads.forEach((u) => {
      const list = map.get(u.billId) ?? [];
      list.push(u);
      map.set(u.billId, list);
    });
    return map;
  }, [uploads]);

  const filteredBills = useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = term
      ? bills.filter((b) => b.name.toLowerCase().includes(term))
      : bills;
    return base.filter((b) =>
      activeTab === "RECORRENTES" ? b.isRecurring : !b.isRecurring
    );
  }, [bills, search, activeTab]);

  const toggleExpanded = (billId: number) => {
    setExpandedBillIds((current) => {
      const next = new Set(current);
      if (next.has(billId)) next.delete(billId);
      else next.add(billId);
      return next;
    });
  };

  const openUploadModal = (target: UploadTarget) => {
    setUploadTarget(target);
    setSelectedFile(null);
    setFileType("COMPROVANTE");
  };

  const closeUploadModal = () => {
    if (uploading) return;
    setUploadTarget(null);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      showToast("error", "Apenas arquivos PDF, PNG ou JPG são aceitos.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast("error", "Arquivo maior que 5 MB.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTarget || !selectedFile) return;

    setUploading(true);
    try {
      const params: Parameters<typeof filesApi.upload>[0] = {
        billId: uploadTarget.bill.id,
        file: selectedFile,
        type: fileType,
      };
      if (uploadTarget.year !== undefined) params.year = uploadTarget.year;
      if (uploadTarget.month !== undefined) params.month = uploadTarget.month;

      const result = await filesApi.upload(params);
      setUploads((prev) => [result, ...prev]);
      showToast(
        "success",
        fileType === "COMPROVANTE"
          ? "Comprovante enviado com sucesso!"
          : "Cobrança enviada com sucesso!"
      );
      closeUploadModal();
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível enviar o arquivo.");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await filesApi.download(fileId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível baixar o arquivo.");
    }
  };

  const renderFileRow = (file: FileUpload) => (
    <div
      key={file.id}
      className="flex items-center justify-between p-3 rounded-xl"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--bg-item)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <FileCheck className="w-5 h-5 text-hero-orange shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary truncate">
            {file.name}
          </p>
          <p className="text-xs text-subtle truncate">
            {file.type === "COMPROVANTE"
              ? "Comprovante de pagamento"
              : "Cobrança / fatura"}
          </p>
        </div>
      </div>
      <button
        onClick={() => handleDownload(file.id, file.name)}
        className="p-2 rounded-lg text-subtle hover:text-hero-orange hover:bg-hero-orange/10 transition-all"
        aria-label="Baixar arquivo"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );

  const renderRecurringBill = (bill: Bill) => {
    const style = getCategoryStyle(bill.type);
    const billFiles = uploadsByBillId.get(bill.id) ?? [];
    const slots = buildMonthSlots(bill);
    const isExpanded = expandedBillIds.has(bill.id);

    const filesBySlot = new Map<string, FileUpload[]>();
    for (const f of billFiles) {
      if (f.year == null || f.month == null) continue;
      const key = `${f.year}-${f.month}`;
      const list = filesBySlot.get(key) ?? [];
      list.push(f);
      filesBySlot.set(key, list);
    }

    return (
      <div key={bill.id} className="card space-y-3">
        <button
          type="button"
          onClick={() => toggleExpanded(bill.id)}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-subtle shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-subtle shrink-0" />
            )}
            <div>
              <p className="font-semibold text-primary">{bill.name}</p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded-lg font-medium"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {style.label}
                </span>
                <span className="text-xs text-subtle">
                  {slots.length} {slots.length === 1 ? "mês" : "meses"} •{" "}
                  {billFiles.length}{" "}
                  {billFiles.length === 1 ? "comprovante" : "comprovantes"}
                </span>
              </div>
            </div>
          </div>
          <p className="font-bold text-primary text-lg shrink-0">
            R${" "}
            {toAmount(bill.amount).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        </button>

        {isExpanded && (
          <div className="space-y-3 pt-2">
            {slots.map((slot) => {
              const key = `${slot.year}-${slot.month}`;
              const slotFiles = filesBySlot.get(key) ?? [];
              return (
                <div
                  key={key}
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-hover)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">
                      {slot.label}
                    </p>
                    <button
                      onClick={() =>
                        openUploadModal({
                          bill,
                          year: slot.year,
                          month: slot.month,
                          slotLabel: slot.label,
                        })
                      }
                      className="btn-hero text-xs px-3 py-1.5"
                      aria-label={`Anexar comprovante para ${slot.label}`}
                    >
                      <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                      Anexar
                    </button>
                  </div>
                  {slotFiles.length > 0 ? (
                    <div className="space-y-2">
                      {slotFiles.map(renderFileRow)}
                    </div>
                  ) : (
                    <p className="text-xs text-subtle italic">
                      Nenhum comprovante neste mês.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderOneOffBill = (bill: Bill) => {
    const style = getCategoryStyle(bill.type);
    const billFiles = uploadsByBillId.get(bill.id) ?? [];
    const dueDate = formatDueDate(bill.expirationDate);
    return (
      <div key={bill.id} className="card space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-primary">{bill.name}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span
                className="text-xs px-2 py-0.5 rounded-lg font-medium"
                style={{ backgroundColor: style.bg, color: style.color }}
              >
                {style.label}
              </span>
              {dueDate && (
                <span className="text-xs text-subtle">Vence em {dueDate}</span>
              )}
              <span className="text-xs text-subtle">
                {billFiles.length}{" "}
                {billFiles.length === 1 ? "comprovante" : "comprovantes"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
            <p className="font-bold text-primary text-lg">
              R${" "}
              {toAmount(bill.amount).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
            <button
              onClick={() => openUploadModal({ bill })}
              className="btn-hero p-2.5"
              aria-label="Anexar arquivo"
              title="Anexar arquivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        {billFiles.length > 0 && (
          <div className="space-y-2 pt-1">{billFiles.map(renderFileRow)}</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Comprovantes</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">
            Anexe PDFs ou imagens às suas contas para manter o histórico de pagamentos.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-hero-danger/10 text-hero-danger text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        {(["RECORRENTES", "AVULSOS"] as TabKey[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-hero-orange text-white"
                  : "text-muted hover:text-primary"
              }`}
              style={
                isActive
                  ? undefined
                  : { backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }
              }
            >
              {tab === "RECORRENTES" ? "Recorrentes" : "Avulsos"}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
        <input
          type="text"
          placeholder="Buscar conta..."
          className="input-field pl-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loadingBills ? (
        <div className="card text-center py-12">
          <p className="text-muted">Carregando contas...</p>
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-subtle mx-auto mb-4" />
          <p className="text-muted font-medium">
            {bills.length === 0
              ? "Você ainda não tem contas cadastradas."
              : activeTab === "RECORRENTES"
                ? "Nenhuma conta recorrente encontrada."
                : "Nenhuma conta avulsa encontrada."}
          </p>
          {bills.length === 0 && (
            <p className="text-subtle text-sm mt-1">
              Cadastre uma conta na aba Gastos antes de anexar comprovantes.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBills.map((bill) =>
            activeTab === "RECORRENTES"
              ? renderRecurringBill(bill)
              : renderOneOffBill(bill)
          )}
        </div>
      )}

      {uploadTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-lg p-6"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary">Anexar arquivo</h2>
                <p className="text-sm text-subtle mt-1">
                  {uploadTarget.bill.name}
                  {uploadTarget.slotLabel ? ` — ${uploadTarget.slotLabel}` : ""}
                </p>
              </div>
              <button
                onClick={closeUploadModal}
                className="p-2 rounded-lg text-subtle"
                style={{ backgroundColor: "var(--bg-hover)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Tipo de arquivo
                </label>
                <select
                  className="input-field"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as FileType)}
                >
                  <option value="COMPROVANTE">Comprovante de pagamento</option>
                  <option value="COBRANCA">Cobrança / fatura</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Arquivo (PDF, PNG ou JPG, máx. 5 MB)
                </label>
                <label
                  className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-hero-orange/40 transition-colors block"
                  style={{ borderColor: "var(--border)" }}
                >
                  <input
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="w-8 h-8 text-subtle mx-auto mb-2" />
                  {selectedFile ? (
                    <>
                      <p className="text-sm font-medium text-primary">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-subtle mt-1">
                        {(selectedFile.size / 1024).toFixed(0)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted">
                        Clique para selecionar o arquivo
                      </p>
                      <p className="text-xs text-subtle mt-1">
                        PDF, PNG ou JPG até 5 MB
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-muted transition-colors disabled:opacity-50"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg-hover)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex-1 btn-hero disabled:opacity-50"
                >
                  {uploading ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
