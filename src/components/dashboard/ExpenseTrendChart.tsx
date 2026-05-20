"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
    total: point.total,
  };
}

const formatAxisValue = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);

export function ExpenseTrendChart({ userId }: { userId: string | null }) {
  const [range, setRange] = useState<RangeValue>("6M");
  const [data, setData] = useState<{ month: string; total: number }[]>([]);
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
        setError("Não foi possível carregar a evolução de gastos.");
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
          <h3 className="text-lg font-bold text-primary">Evolução dos Gastos</h3>
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
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7a00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff7a00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
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
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#ff7a00", strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Area
                type="monotone"
                dataKey="total"
                name="Gastos"
                stroke="#ff7a00"
                strokeWidth={2.5}
                fill="url(#trendFill)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
