"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { RangePicker, RANGE_MONTHS, type RangeValue } from "./RangePicker";
import { billsApi, type TrendMonths, type TrendPoint } from "@/api";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatPoint(point: TrendPoint) {
  const monthLabel = MONTH_LABELS[point.month - 1] ?? "";
  const yearLabel = String(point.year).slice(-2);
  return {
    month: `${monthLabel}/${yearLabel}`,
    Recorrentes: point.recurring,
    Avulsos: point.oneOff,
  };
}

const formatAxisValue = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);

export function RecurringVsOneOffChart({ userId }: { userId: string | null }) {
  const [range, setRange] = useState<RangeValue>("6M");
  const [data, setData] = useState<
    { month: string; Recorrentes: number; Avulsos: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setData([]);
      return;
    }

    const months = RANGE_MONTHS[range] as TrendMonths;
    let cancelled = false;
    setLoading(true);
    setError(null);

    billsApi
      .getTrend({ userId, months })
      .then((res) => {
        if (cancelled) return;
        setData(res.series.map(formatPoint));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Não foi possível carregar a comparação.");
        setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, range]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary">Recorrentes vs. Avulsos</h3>
          <p className="text-sm text-subtle">
            {range === "3M" ? "Últimos 3 meses" : range === "6M" ? "Últimos 6 meses" : "Último ano"}
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </div>
      <div className="h-64 w-full">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-subtle">Carregando...</p>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-hero-danger">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm text-subtle">Sem dados no período.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="var(--text-subtle)"
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--text-subtle)"
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatAxisValue}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--bg-hover)", opacity: 0.5 }} />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(v) => <span style={{ color: "var(--text-muted)" }}>{v}</span>}
              />
              <Bar dataKey="Recorrentes" stackId="a" fill="#7803d4" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Avulsos" stackId="a" fill="#ff7a00" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
