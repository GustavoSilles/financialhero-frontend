"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
} from "lucide-react";
import { ExpenseTrendChart } from "@/components/dashboard/ExpenseTrendChart";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { RecurringVsOneOffChart } from "@/components/dashboard/RecurringVsOneOffChart";
import {
  HoursPerCategoryChart,
  type HoursEntry,
} from "@/components/dashboard/HoursPerCategoryChart";
import { getCategoryStyle } from "@/components/dashboard/billCategories";
import { useAuth } from "@/contexts/AuthContext";
import {
  billsApi,
  metricsApi,
  type ApiError,
  type Bill,
  type MetricsResponse,
  type UpcomingBill,
} from "@/api";

function toAmount(value: number | string): number {
  return typeof value === "string" ? parseFloat(value) : value;
}

function formatRelativeDate(dateStr: string) {
  // Parse the date and normalise both dates to midnight local time
  // so timezone offsets don't produce off-by-one results.
  const parsed = new Date(dateStr);
  const date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const absDays = Math.abs(diffDays);

  if (absDays === 0) return "Hoje";
  if (absDays === 1) return "Ontem";
  if (absDays < 7) return `há ${absDays} dias`;
  return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      metricsApi.get({ userId: user.id, month, year }),
      billsApi
        .list({ userId: user.id, page: 0, size: 5, sort: "created_at,desc" })
        .catch(() => null),
      billsApi.getUpcoming({ userId: user.id, days: 15 }).catch(() => null),
    ])
      .then(([current, recent, upcoming]) => {
        if (cancelled) return;
        setMetrics(current);
        setRecentBills(recent?.content ?? []);
        setUpcomingBills(upcoming?.bills ?? []);
      })
      .catch((err: ApiError) => {
        if (cancelled) return;
        setError(err.message ?? "Não foi possível carregar o dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const totalGastos = metrics?.summary.totalAmount ?? 0;
  const horasTrabalho = metrics?.summary.totalHours ?? 0;
  const receiptsCount = metrics?.summary.receiptsCount ?? 0;
  const previousMonthTotal = metrics?.summary.previousMonthTotal ?? 0;
  const percentChange =
    previousMonthTotal > 0 ? metrics?.summary.percentChange ?? null : null;

  const dayOfMonth = new Date().getDate();
  const avgPerDay = totalGastos / dayOfMonth;

  const donutEntries = useMemo(
    () =>
      (metrics?.byCategory ?? []).map((item) => {
        const style = getCategoryStyle(item.category);
        return { name: style.label, value: item.totalAmount, color: style.color };
      }),
    [metrics]
  );

  const hoursEntries = useMemo<HoursEntry[]>(
    () =>
      (metrics?.byCategory ?? []).map((item) => {
        const style = getCategoryStyle(item.category);
        return { name: style.label, color: style.color, hours: item.hoursNeeded };
      }),
    [metrics]
  );

  const nextBills = useMemo(() => upcomingBills.slice(0, 3), [upcomingBills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted">Carregando seu painel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-hero-danger font-medium">{error}</p>
        <p className="text-subtle text-sm mt-2">Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted mt-1">Visão geral das suas finanças</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Gastos este mês"
          value={`R$ ${totalGastos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={percentChange ?? undefined}
          color="orange"
        />
        <MetricCard
          icon={<Receipt className="w-6 h-6" />}
          label="Comprovantes"
          value={receiptsCount.toString()}
          subtitle="documentos salvos"
          color="purple"
        />
        <MetricCard
          icon={<Activity className="w-6 h-6" />}
          label="Gasto médio diário"
          value={`R$ ${avgPerDay.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="por dia este mês"
          color="orange"
        />
        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          label="Horas de Trabalho"
          value={`${horasTrabalho.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h`}
          subtitle="equivalente aos gastos"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryDonutChart entries={donutEntries} />
        <HoursPerCategoryChart entries={hoursEntries} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart userId={user?.id ?? null} />
        </div>
        <div className="lg:col-span-1">
          <RecurringVsOneOffChart userId={user?.id ?? null} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Adicionados Recentes</h3>
            <Link href="/dashboard/gastos" className="text-sm text-hero-orange font-semibold hover:underline">
              Ver todos
            </Link>
          </div>
          {recentBills.length === 0 ? (
            <p className="text-sm text-subtle">Nenhum gasto registrado ainda.</p>
          ) : (
            (() => {
              const recorrentes = recentBills.filter((b) => b.isRecurring);
              const avulsos = recentBills.filter((b) => !b.isRecurring);
              return (
                <div className="space-y-6">
                  <BillGroup title="Recorrentes" bills={recorrentes} />
                  <BillGroup title="Avulsos" bills={avulsos} />
                </div>
              );
            })()
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Próximos Vencimentos</h3>
          </div>
          {nextBills.length === 0 ? (
            <p className="text-sm text-subtle">Sem contas a vencer no momento.</p>
          ) : (
            <div className="space-y-4">
              {nextBills.map((bill) => {
                const dueDate = new Date(bill.expirationDate);
                const isUrgent = bill.daysUntilDue <= 3;

                return (
                  <div
                    key={bill.id}
                    className="p-4 rounded-xl border transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-item)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-primary">{bill.name}</p>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${isUrgent
                            ? "bg-hero-danger/10 text-hero-danger"
                            : "bg-hero-success/10 text-hero-success"
                          }`}
                      >
                        {bill.daysUntilDue > 0
                          ? `${bill.daysUntilDue} ${bill.daysUntilDue === 1 ? 'dia' : 'dias'}`
                          : "Hoje!"}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-primary">
                      R$ {bill.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-subtle mt-1">
                      Vence em {dueDate.toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Motivational badge */}
          <div className="mt-6 p-4 rounded-xl bg-linear-to-br from-hero-orange/5 to-hero-purple/5" style={{ border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-hero-orange" />
              <div>
                <p className="font-semibold text-primary text-sm">Herói Financeiro</p>
                <p className="text-xs text-subtle">Suas contas estão em dia!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change?: number;
  subtitle?: string;
  color: "orange" | "purple";
}) {
  const bgColor = color === "orange" ? "bg-hero-orange/10" : "bg-hero-purple/10";
  const textColor = color === "orange" ? "text-hero-orange" : "text-hero-purple";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${textColor}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-sm font-semibold ${change > 0 ? "text-hero-danger" : "text-hero-success"
              }`}
          >
            {change > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-primary mt-1">{value}</p>
      {subtitle && <p className="text-xs text-subtle mt-1">{subtitle}</p>}
    </div>
  );
}

function BillGroup({ title, bills }: { title: string; bills: Bill[] }) {
  if (bills.length === 0) return null;

  const total = bills.reduce((sum, b) => sum + toAmount(b.amount), 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm font-bold text-primary uppercase tracking-wide">
            {title}
          </h4>
          <span className="text-xs text-subtle">({bills.length})</span>
        </div>
        <span className="text-xs text-muted font-semibold">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="space-y-2">
        {bills.map((bill) => {
          const style = getCategoryStyle(bill.type);
          const dateRef = bill.createdAt ?? bill.expirationDate;
          return (
            <div key={bill.id} className="expense-row">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="font-semibold text-primary truncate">{bill.name}</p>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {style.label}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-primary text-sm sm:text-base">
                  R$ {toAmount(bill.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-subtle">{formatRelativeDate(dateRef)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
