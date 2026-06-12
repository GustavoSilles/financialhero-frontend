"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  CalendarClock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import {
  billsApi,
  MONTHS,
  type ApiError,
  type Bill,
  type BillType,
  type CreateBillRequest,
  type MonthBill,
} from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  BILL_CATEGORY_STYLES,
  getCategoryStyle,
} from "@/components/dashboard/billCategories";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatLocalDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

function effectiveDueDate(
  bill: Bill,
  ctxYear: number,
  ctxMonth: number
): Date {
  if (!bill.isRecurring) {
    return startOfDay(new Date(bill.expirationDate));
  }
  const anchorDay = new Date(bill.expirationDate).getDate();
  const lastDay = new Date(ctxYear, ctxMonth + 1, 0).getDate();
  return new Date(ctxYear, ctxMonth, Math.min(anchorDay, lastDay));
}

const BILL_TYPE_OPTIONS = Object.entries(BILL_CATEGORY_STYLES).map(
  ([value, style]) => ({ value: value as BillType, label: style.label })
);

interface NewBillForm {
  name: string;
  billType: BillType;
  amount: string;
  expirationDate: Date | undefined;
  isRecurring: boolean;
}

const emptyForm: NewBillForm = {
  name: "",
  billType: BILL_TYPE_OPTIONS[0].value,
  amount: "",
  expirationDate: undefined,
  isRecurring: true,
};

function toAmount(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

export default function GastosPage() {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const initialLoadDoneRef = useRef(false);

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<NewBillForm>(emptyForm);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayDate = useMemo(() => startOfDay(new Date()), []);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
  );
  const [monthBills, setMonthBills] = useState<MonthBill[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIdx = calendarMonth.getMonth();

  const loadBills = useCallback(
    async (userId: string | number, year: number, monthIdx: number) => {
      try {
        setError(null);
        const response = await billsApi.list({
          userId,
          page: 0,
          size: 100,
          sort: "expiration_date,asc",
          year,
          month: monthIdx + 1,
        });
        setBills(response.content);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message ?? "Não foi possível carregar as contas");
      }
    },
    []
  );

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    if (!initialLoadDoneRef.current) {
      setLoading(true);
    }
    loadBills(user.id, calendarYear, calendarMonthIdx).finally(() => {
      if (cancelled) return;
      setLoading(false);
      initialLoadDoneRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user, calendarYear, calendarMonthIdx, loadBills]);

  const loadMonthBills = useCallback(
    async (userId: string | number, year: number, monthIdx: number) => {
      const monthKey = MONTHS[monthIdx];
      try {
        const response = await billsApi.monthly({
          userId,
          months: [monthKey],
          year,
        });
        setMonthBills(response[monthKey] ?? []);
      } catch (err) {
        const apiError = err as ApiError;
        showToast(
          "error",
          apiError.message ?? "Não foi possível carregar o calendário"
        );
        setMonthBills([]);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let cancelled = false;
    loadMonthBills(user.id, calendarYear, calendarMonthIdx).then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    user,
    calendarYear,
    calendarMonthIdx,
    loadMonthBills,
  ]);

  const monthRelevantBills = useMemo(
    () =>
      bills.filter((b) => {
        if (b.isRecurring) {
          const firstDue = new Date(b.expirationDate);
          if (isNaN(firstDue.getTime())) return true;
          const firstDueYear = firstDue.getUTCFullYear();
          const firstDueMonth = firstDue.getUTCMonth();
          if (calendarYear < firstDueYear) return false;
          if (
            calendarYear === firstDueYear &&
            calendarMonthIdx < firstDueMonth
          ) {
            return false;
          }
          return true;
        }
        const d = new Date(b.expirationDate);
        return (
          d.getFullYear() === calendarYear &&
          d.getMonth() === calendarMonthIdx
        );
      }),
    [bills, calendarYear, calendarMonthIdx]
  );

  const totalMensal = monthRelevantBills.reduce(
    (sum, b) => sum + toAmount(b.amount),
    0
  );
  const totalPago = monthRelevantBills
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + toAmount(b.amount), 0);
  const totalPendente = totalMensal - totalPago;

  const sortedBills = useMemo(
    () =>
      [...monthRelevantBills].sort((a, b) => {
        const aDate = effectiveDueDate(a, calendarYear, calendarMonthIdx).getTime();
        const bDate = effectiveDueDate(b, calendarYear, calendarMonthIdx).getTime();
        return aDate - bDate;
      }),
    [monthRelevantBills, calendarYear, calendarMonthIdx]
  );

  const daysInMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
  const firstWeekday = new Date(calendarYear, calendarMonthIdx, 1).getDay();
  const isCurrentMonth =
    calendarYear === todayDate.getFullYear() &&
    calendarMonthIdx === todayDate.getMonth();

  const daysWithBills = useMemo(() => {
    const lastDay = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();
    const set = new Set<number>();
    for (const mb of monthBills) {
      const anchorDay = new Date(mb.expirationDate).getDate();
      set.add(Math.min(anchorDay, lastDay));
    }
    return set;
  }, [monthBills, calendarYear, calendarMonthIdx]);

  const displayedBills = useMemo(() => {
    if (selectedDay === null) return sortedBills;
    return sortedBills.filter((b) => {
      const due = effectiveDueDate(b, calendarYear, calendarMonthIdx);
      return due.getDate() === selectedDay;
    });
  }, [selectedDay, sortedBills, calendarYear, calendarMonthIdx]);

  const goToPreviousMonth = () => {
    setSelectedDay(null);
    setCalendarMonth(new Date(calendarYear, calendarMonthIdx - 1, 1));
  };
  const goToNextMonth = () => {
    setSelectedDay(null);
    setCalendarMonth(new Date(calendarYear, calendarMonthIdx + 1, 1));
  };
  const goToCurrentMonth = () => {
    setSelectedDay(null);
    setCalendarMonth(
      new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
    );
  };

  const toggleDaySelection = (day: number) => {
    setSelectedDay((current) => (current === day ? null : day));
  };

  const togglePaid = async (bill: Bill) => {
    if (!user || updatingId === bill.id) return;

    const targetState = !bill.isPaid;
    setUpdatingId(bill.id);
    setBills((current) =>
      current.map((b) => (b.id === bill.id ? { ...b, isPaid: targetState } : b))
    );

    try {
      await billsApi.pay({
        userId: user.id,
        billId: bill.id,
        isPaid: targetState,
        year: calendarYear,
        month: calendarMonthIdx + 1,
      });
      await loadMonthBills(user.id, calendarYear, calendarMonthIdx);
    } catch (err) {
      setBills((current) =>
        current.map((b) =>
          b.id === bill.id ? { ...b, isPaid: !targetState } : b
        )
      );
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível atualizar a conta");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!user || !billToDelete || deleting) return;

    setDeleting(true);
    try {
      await billsApi.remove({ userId: user.id, billId: billToDelete.id });
      setBills((current) => current.filter((b) => b.id !== billToDelete.id));
      await loadMonthBills(user.id, calendarYear, calendarMonthIdx);
      showToast("success", "Conta excluída com sucesso!");
      setBillToDelete(null);
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível excluir a conta.");
    } finally {
      setDeleting(false);
    }
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setShowDatePicker(false);
    setShowModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowDatePicker(false);
    setShowModal(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const name = form.name.trim();
    if (!name) {
      showToast("error", "Informe o nome da conta.");
      return;
    }
    const amount = parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      showToast("error", "Informe um valor válido.");
      return;
    }
    if (!form.expirationDate) {
      showToast("error", "Informe a data de vencimento.");
      return;
    }
    if (startOfDay(form.expirationDate) < todayDate) {
      showToast("error", "A data de vencimento não pode ser anterior a hoje.");
      return;
    }

    const payload: CreateBillRequest = {
      billType: form.billType,
      name,
      amount,
      expirationDate: form.expirationDate.toISOString(),
      isRecurring: form.isRecurring,
    };
    setCreating(true);
    try {
      await billsApi.create(user.id, payload);
      showToast("success", "Conta criada com sucesso!");
      setShowModal(false);
      await Promise.all([
        loadBills(user.id, calendarYear, calendarMonthIdx),
        loadMonthBills(user.id, calendarYear, calendarMonthIdx),
      ]);
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível criar a conta.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary">Gastos</h1>
          <p className="text-muted mt-1 text-sm sm:text-base">Controle suas contas e gastos</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-hero text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Gasto
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-hero-danger/10 text-hero-danger text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-muted">Carregando contas...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            <div className="card">
              <p className="text-sm text-muted font-medium">Total Mensal</p>
              <p className="text-2xl font-bold text-primary mt-1">
                R$ {totalMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-subtle mt-1">{monthRelevantBills.length} contas no mês</p>
            </div>
            <div className="card">
              <p className="text-sm text-muted font-medium">Pago</p>
              <p className="text-2xl font-bold text-hero-success mt-1">
                R$ {totalPago.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-subtle mt-1">
                {monthRelevantBills.filter((b) => b.isPaid).length} contas pagas
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-muted font-medium">Pendente</p>
              <p className="text-2xl font-bold text-hero-danger mt-1">
                R$ {totalPendente.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-subtle mt-1">
                {monthRelevantBills.filter((b) => !b.isPaid).length} contas pendentes
              </p>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-primary">Calendário de Vencimentos</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  aria-label="Mês anterior"
                  className="p-2 rounded-lg text-muted hover:text-hero-orange transition-colors"
                  style={{ backgroundColor: "var(--bg-hover)" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[150px] text-center text-sm font-semibold text-primary capitalize">
                  {MONTH_NAMES[calendarMonthIdx]} {calendarYear}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  aria-label="Próximo mês"
                  className="p-2 rounded-lg text-muted hover:text-hero-orange transition-colors"
                  style={{ backgroundColor: "var(--bg-hover)" }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToCurrentMonth}
                  aria-hidden={isCurrentMonth}
                  tabIndex={isCurrentMonth ? -1 : 0}
                  className={`text-xs font-semibold text-hero-orange hover:underline px-2 ${
                    isCurrentMonth ? "invisible pointer-events-none" : ""
                  }`}
                >
                  Hoje
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 overflow-x-auto min-w-0">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-subtle py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstWeekday }, (_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const hasExpense = daysWithBills.has(day);
                const isToday =
                  isCurrentMonth && day === todayDate.getDate();
                const isSelected = selectedDay === day;

                let cellClass =
                  "relative p-2 rounded-xl text-center text-sm transition-all min-h-[40px] flex items-center justify-center cursor-pointer select-none";
                if (isSelected) {
                  cellClass +=
                    " bg-hero-orange text-white font-bold";
                } else if (hasExpense) {
                  cellClass +=
                    " text-primary font-medium hover:bg-hero-orange/10";
                  cellClass += ' bg-[var(--bg-hover)]';
                } else {
                  cellClass += " text-subtle hover:bg-[var(--bg-hover)]";
                }
                if (isToday && !isSelected) {
                  cellClass += " ring-2 ring-hero-orange/40";
                }

                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDaySelection(day)}
                    className={cellClass}
                    aria-pressed={isSelected}
                  >
                    {day}
                    {hasExpense && !isSelected && (
                      <span
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-hero-orange"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter banner */}
          {selectedDay !== null && (
            <div
              className="flex items-center justify-between p-3 rounded-xl"
              style={{
                backgroundColor: "var(--bg-hover)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-sm text-muted">
                Mostrando contas que vencem em{" "}
                <span className="font-semibold text-primary">
                  {String(selectedDay).padStart(2, "0")}/
                  {String(calendarMonthIdx + 1).padStart(2, "0")}/
                  {calendarYear}
                </span>
                {" — "}
                {displayedBills.length}{" "}
                {displayedBills.length === 1 ? "conta" : "contas"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-xs font-semibold text-hero-orange hover:underline"
              >
                Limpar filtro
              </button>
            </div>
          )}

          {/* Bills List */}
          {sortedBills.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted font-medium">Nenhuma conta cadastrada ainda.</p>
            </div>
          ) : displayedBills.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-muted font-medium">
                Nenhuma conta vence nesse dia.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBills.map((bill) => {
                const dueDate = effectiveDueDate(bill, calendarYear, calendarMonthIdx);
                const dueDay = dueDate.getDate();
                const msPerDay = 1000 * 60 * 60 * 24;
                const daysUntilDue = Math.round(
                  (dueDate.getTime() - todayDate.getTime()) / msPerDay
                );
                const isOverdue = daysUntilDue < 0 && !bill.isPaid;
                const isDueSoon =
                  daysUntilDue >= 0 && daysUntilDue <= 3 && !bill.isPaid;
                const style = getCategoryStyle(bill.type);
                const isUpdating = updatingId === bill.id;

                return (
                  <div
                    key={bill.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => togglePaid(bill)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        togglePaid(bill);
                      }
                    }}
                    aria-pressed={bill.isPaid}
                    aria-label={
                      bill.isPaid
                        ? `Desmarcar ${bill.name} como pago`
                        : `Marcar ${bill.name} como pago`
                    }
                    className={`card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer select-none transition-all hover:border-hero-orange/40 ${
                      isUpdating ? "opacity-50 pointer-events-none" : ""
                    } ${bill.isPaid ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        aria-hidden="true"
                        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-all ${
                          bill.isPaid
                            ? "bg-hero-success border-2 border-hero-success text-white"
                            : isOverdue
                              ? "border-2 border-hero-danger/60"
                              : "border-2 border-[var(--border)]"
                        }`}
                      >
                        {bill.isPaid && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            bill.isPaid ? "text-subtle line-through" : "text-primary"
                          }`}
                        >
                          {bill.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-lg font-medium"
                            style={{ backgroundColor: style.bg, color: style.color }}
                          >
                            {style.label}
                          </span>
                          <span className="text-xs text-subtle flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />
                            {String(dueDay).padStart(2, "0")}/
                            {String(dueDate.getMonth() + 1).padStart(2, "0")}/
                            {dueDate.getFullYear()}
                          </span>
                          {isOverdue && (
                            <span className="text-xs text-hero-danger font-semibold">
                              Atrasado
                            </span>
                          )}
                          {isDueSoon && (
                            <span className="text-xs text-hero-warning font-semibold">
                              Vence em breve
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <p className="font-bold text-primary text-lg">
                        R$ {toAmount(bill.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillToDelete(bill);
                        }}
                        aria-label={`Excluir ${bill.name}`}
                        title="Excluir conta"
                        className="p-2 rounded-lg text-subtle hover:text-hero-danger hover:bg-hero-danger/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="rounded-2xl w-full max-w-lg p-6 my-auto"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">Novo Gasto</h2>
              <button
                onClick={closeCreateModal}
                className="p-2 rounded-lg text-subtle"
                style={{ backgroundColor: "var(--bg-hover)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Nome da conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conta de Luz, Condomínio..."
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Categoria</label>
                  <select
                    className="input-field"
                    value={form.billType}
                    onChange={(e) =>
                      setForm({ ...form, billType: e.target.value as BillType })
                    }
                  >
                    {BILL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="input-field"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Data de vencimento</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker((v) => !v)}
                    className="input-field text-left flex items-center justify-between"
                  >
                    <span
                      className={
                        form.expirationDate ? "text-primary" : "text-subtle"
                      }
                    >
                      {form.expirationDate
                        ? formatLocalDate(form.expirationDate)
                        : "Selecione uma data"}
                    </span>
                    <CalendarClock className="w-4 h-4 text-muted" />
                  </button>
                  {showDatePicker && (
                    <div
                      className="absolute z-20 mt-2 rounded-xl p-3 shadow-lg"
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <DayPicker
                        mode="single"
                        locale={ptBR}
                        selected={form.expirationDate}
                        onSelect={(date) => {
                          setForm({ ...form, expirationDate: date });
                          if (date) setShowDatePicker(false);
                        }}
                        disabled={{ before: todayDate }}
                        defaultMonth={form.expirationDate ?? todayDate}
                        showOutsideDays
                        weekStartsOn={0}
                      />
                    </div>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[var(--hero-orange,#ff7a00)]"
                  checked={form.isRecurring}
                  onChange={(e) =>
                    setForm({ ...form, isRecurring: e.target.checked })
                  }
                />
                Conta recorrente (todo mês)
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creating}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-muted transition-colors disabled:opacity-50"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-hover)" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 btn-hero disabled:opacity-50"
                >
                  {creating ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {billToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-md p-6"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-hero-danger/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-hero-danger" />
              </div>
              <h2 className="text-lg font-bold text-primary">Excluir conta</h2>
            </div>
            <p className="text-sm text-muted">
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-primary">{billToDelete.name}</span>?
              {billToDelete.isRecurring && (
                <> Por ser uma conta recorrente, ela deixará de aparecer em todos os meses.</>
              )}{" "}
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl font-medium text-muted transition-colors disabled:opacity-50"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--bg-hover)" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-hero-danger transition-colors disabled:opacity-50 hover:opacity-90"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
