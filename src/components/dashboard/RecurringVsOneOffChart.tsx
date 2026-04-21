"use client";

import { useState } from "react";
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

const allData = [
  { month: "Abr/25", Recorrentes: 1320, Avulsos: 860 },
  { month: "Mai/25", Recorrentes: 1320, Avulsos: 1020 },
  { month: "Jun/25", Recorrentes: 1350, Avulsos: 1160 },
  { month: "Jul/25", Recorrentes: 1350, Avulsos: 1270 },
  { month: "Ago/25", Recorrentes: 1380, Avulsos: 1030 },
  { month: "Set/25", Recorrentes: 1380, Avulsos: 925 },
  { month: "Out/25", Recorrentes: 1380, Avulsos: 1070 },
  { month: "Nov/25", Recorrentes: 1420, Avulsos: 1360 },
  { month: "Dez/25", Recorrentes: 1450, Avulsos: 1670 },
  { month: "Jan/26", Recorrentes: 1450, Avulsos: 1200 },
  { month: "Fev/26", Recorrentes: 1450, Avulsos: 1440 },
  { month: "Mar/26", Recorrentes: 1450, Avulsos: 1795 },
];

const formatAxisValue = (v: number) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);

export function RecurringVsOneOffChart() {
  const [range, setRange] = useState<RangeValue>("6M");
  const data = allData.slice(-RANGE_MONTHS[range]);

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
      </div>
    </div>
  );
}
