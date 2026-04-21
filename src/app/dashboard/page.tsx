"use client";

import {
  Receipt,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
  Star,
} from "lucide-react";
import { ExpenseTrendChart } from "@/components/dashboard/ExpenseTrendChart";
import { CategoryDonutChart } from "@/components/dashboard/CategoryDonutChart";
import { RecurringVsOneOffChart } from "@/components/dashboard/RecurringVsOneOffChart";
import { HoursPerCategoryChart } from "@/components/dashboard/HoursPerCategoryChart";

const mockMetrics = {
  totalGastos: 3245.8,
  gastosMesAnterior: 2890.5,
  totalComprovantes: 24,
  horasTrabalho: 86.5,
};

const categoryStyles: Record<string, { fg: string; bg: string }> = {
  Moradia: { fg: "#ff7a00", bg: "rgba(255, 122, 0, 0.12)" },
  Alimentação: { fg: "#7803d4", bg: "rgba(120, 3, 212, 0.12)" },
  Serviços: { fg: "#a855f7", bg: "rgba(168, 85, 247, 0.14)" },
  Saúde: { fg: "#4caf50", bg: "rgba(76, 175, 80, 0.14)" },
  Transporte: { fg: "#ffaa00", bg: "rgba(255, 170, 0, 0.14)" },
  Outros: { fg: "#6b7280", bg: "rgba(107, 114, 128, 0.14)" },
};

const mockRecentExpenses = [
  { id: 1, name: "Aluguel", category: "Moradia", value: 1200.0, date: "2025-03-01", type: "recorrente" },
  { id: 2, name: "Supermercado Extra", category: "Alimentação", value: 387.45, date: "2025-03-05", type: "comprovante" },
  { id: 3, name: "Internet", category: "Serviços", value: 119.9, date: "2025-03-10", type: "recorrente" },
  { id: 4, name: "Farmácia", category: "Saúde", value: 67.3, date: "2025-03-12", type: "comprovante" },
  { id: 5, name: "Uber", category: "Transporte", value: 45.0, date: "2025-03-14", type: "comprovante" },
];

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.floor(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

const mockUpcomingBills = [
  { id: 1, name: "Energia Elétrica", value: 180.0, dueDate: "2025-03-20" },
  { id: 2, name: "Água", value: 95.0, dueDate: "2025-03-22" },
  { id: 3, name: "Cartão de Crédito", value: 890.0, dueDate: "2025-03-25" },
];

export default function DashboardPage() {
  const percentChange =
    ((mockMetrics.totalGastos - mockMetrics.gastosMesAnterior) /
      mockMetrics.gastosMesAnterior) *
    100;

  const dayOfMonth = new Date().getDate();
  const avgPerDay = mockMetrics.totalGastos / dayOfMonth;

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
          value={`R$ ${mockMetrics.totalGastos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          change={percentChange}
          color="orange"
        />
        <MetricCard
          icon={<Receipt className="w-6 h-6" />}
          label="Comprovantes"
          value={mockMetrics.totalComprovantes.toString()}
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
          value={`${mockMetrics.horasTrabalho}h`}
          subtitle="equivalente aos gastos"
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ExpenseTrendChart />
        </div>
        <div className="lg:col-span-1">
          <RecurringVsOneOffChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CategoryDonutChart />
        <HoursPerCategoryChart />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Gastos Recentes</h3>
            <span className="text-sm text-hero-orange font-semibold cursor-pointer hover:underline">
              Ver todos
            </span>
          </div>
          {(() => {
            const recorrentes = mockRecentExpenses.filter((e) => e.type === "recorrente");
            const avulsos = mockRecentExpenses.filter((e) => e.type !== "recorrente");

            return (
              <div className="space-y-6">
                <ExpenseGroup title="Recorrentes" expenses={recorrentes} />
                <ExpenseGroup title="Avulsos" expenses={avulsos} />
              </div>
            );
          })()}
        </div>

        {/* Upcoming Bills */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-primary">Próximos Vencimentos</h3>
          </div>
          <div className="space-y-4">
            {mockUpcomingBills.map((bill) => {
              const dueDate = new Date(bill.dueDate);
              const today = new Date();
              const daysUntil = Math.ceil(
                (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isUrgent = daysUntil <= 3;

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
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        isUrgent
                          ? "bg-hero-danger/10 text-hero-danger"
                          : "bg-hero-success/10 text-hero-success"
                      }`}
                    >
                      {daysUntil > 0 ? `${daysUntil} dias` : "Hoje!"}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    R$ {bill.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-subtle mt-1">
                    Vence em {dueDate.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>

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
            className={`flex items-center gap-1 text-sm font-semibold ${
              change > 0 ? "text-hero-danger" : "text-hero-success"
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

type Expense = {
  id: number;
  name: string;
  category: string;
  value: number;
  date: string;
  type: string;
};

function ExpenseGroup({ title, expenses }: { title: string; expenses: Expense[] }) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, e) => sum + e.value, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 px-1">
        <div className="flex items-baseline gap-2">
          <h4 className="text-sm font-bold text-primary uppercase tracking-wide">
            {title}
          </h4>
          <span className="text-xs text-subtle">({expenses.length})</span>
        </div>
        <span className="text-xs text-muted font-semibold">
          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="space-y-2">
        {expenses.map((expense) => {
          const cat = categoryStyles[expense.category] ?? categoryStyles.Outros;
          return (
            <div key={expense.id} className="expense-row">
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="font-semibold text-primary truncate">
                  {expense.name}
                </p>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.bg, color: cat.fg }}
                >
                  {expense.category}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-primary text-sm sm:text-base">
                  R$ {expense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-subtle">
                  {formatRelativeDate(expense.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
