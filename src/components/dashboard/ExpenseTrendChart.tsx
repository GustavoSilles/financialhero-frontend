"use client";

import { useState } from "react";
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

const allData = [
  { month: "Abr/25", total: 2180.5 },
  { month: "Mai/25", total: 2340.9 },
  { month: "Jun/25", total: 2510.7 },
  { month: "Jul/25", total: 2620.3 },
  { month: "Ago/25", total: 2410.1 },
  { month: "Set/25", total: 2305.6 },
  { month: "Out/25", total: 2450.2 },
  { month: "Nov/25", total: 2780.9 },
  { month: "Dez/25", total: 3120.4 },
  { month: "Jan/26", total: 2650.1 },
  { month: "Fev/26", total: 2890.5 },
  { month: "Mar/26", total: 3245.8 },
];

const formatAxisValue = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);

export function ExpenseTrendChart() {
  const [range, setRange] = useState<RangeValue>("6M");
  const data = allData.slice(-RANGE_MONTHS[range]);

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
      </div>
    </div>
  );
}
