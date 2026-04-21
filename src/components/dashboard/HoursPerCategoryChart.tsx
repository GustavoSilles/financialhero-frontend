"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock } from "lucide-react";
import { ChartTooltip } from "./ChartTooltip";
import { MonthPicker, type MonthOption } from "./MonthPicker";

const HOURLY_RATE = 37.53;

type CategoryRow = { name: string; value: number; color: string };

const monthOptions: MonthOption[] = [
  { value: "2026-03", label: "Março 2026" },
  { value: "2026-02", label: "Fevereiro 2026" },
  { value: "2026-01", label: "Janeiro 2026" },
  { value: "2025-12", label: "Dezembro 2025" },
  { value: "2025-11", label: "Novembro 2025" },
  { value: "2025-10", label: "Outubro 2025" },
];

const dataByMonth: Record<string, CategoryRow[]> = {
  "2026-03": [
    { name: "Moradia", value: 1200.0, color: "#ff7a00" },
    { name: "Alimentação", value: 687.45, color: "#7803d4" },
    { name: "Serviços", value: 419.9, color: "#a855f7" },
    { name: "Transporte", value: 345.0, color: "#ffaa00" },
    { name: "Outros", value: 326.15, color: "#ffd6a5" },
    { name: "Saúde", value: 267.3, color: "#4caf50" },
  ],
  "2026-02": [
    { name: "Moradia", value: 1200.0, color: "#ff7a00" },
    { name: "Alimentação", value: 612.3, color: "#7803d4" },
    { name: "Serviços", value: 419.9, color: "#a855f7" },
    { name: "Transporte", value: 298.0, color: "#ffaa00" },
    { name: "Outros", value: 214.0, color: "#ffd6a5" },
    { name: "Saúde", value: 146.3, color: "#4caf50" },
  ],
  "2026-01": [
    { name: "Moradia", value: 1150.0, color: "#ff7a00" },
    { name: "Alimentação", value: 525.0, color: "#7803d4" },
    { name: "Serviços", value: 395.0, color: "#a855f7" },
    { name: "Transporte", value: 260.1, color: "#ffaa00" },
    { name: "Outros", value: 180.0, color: "#ffd6a5" },
    { name: "Saúde", value: 140.0, color: "#4caf50" },
  ],
  "2025-12": [
    { name: "Moradia", value: 1150.0, color: "#ff7a00" },
    { name: "Alimentação", value: 790.2, color: "#7803d4" },
    { name: "Serviços", value: 395.0, color: "#a855f7" },
    { name: "Transporte", value: 410.0, color: "#ffaa00" },
    { name: "Outros", value: 265.2, color: "#ffd6a5" },
    { name: "Saúde", value: 110.0, color: "#4caf50" },
  ],
  "2025-11": [
    { name: "Moradia", value: 1150.0, color: "#ff7a00" },
    { name: "Alimentação", value: 640.0, color: "#7803d4" },
    { name: "Serviços", value: 395.0, color: "#a855f7" },
    { name: "Transporte", value: 305.0, color: "#ffaa00" },
    { name: "Outros", value: 200.9, color: "#ffd6a5" },
    { name: "Saúde", value: 90.0, color: "#4caf50" },
  ],
  "2025-10": [
    { name: "Moradia", value: 1100.0, color: "#ff7a00" },
    { name: "Alimentação", value: 560.0, color: "#7803d4" },
    { name: "Serviços", value: 370.0, color: "#a855f7" },
    { name: "Transporte", value: 240.0, color: "#ffaa00" },
    { name: "Outros", value: 125.2, color: "#ffd6a5" },
    { name: "Saúde", value: 55.0, color: "#4caf50" },
  ],
};

export function HoursPerCategoryChart() {
  const [month, setMonth] = useState(monthOptions[0].value);

  const data = dataByMonth[month]
    .map((d) => ({ ...d, hours: +(d.value / HOURLY_RATE).toFixed(1) }))
    .sort((a, b) => b.hours - a.hours);

  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-1 gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary">Horas Trabalhadas por Categoria</h3>
          <p className="text-sm text-subtle">Quanto do seu tempo cada gasto consumiu</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <MonthPicker value={month} options={monthOptions} onChange={setMonth} />
          <div className="flex items-center gap-1.5 text-sm text-hero-orange font-semibold">
            <Clock className="w-4 h-4" />
            {totalHours.toFixed(1)}h
          </div>
        </div>
      </div>

      <div style={{ height: data.length * 44 + 24 }} className="w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-subtle)"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip
              cursor={{ fill: "var(--bg-hover)", opacity: 0.4 }}
              content={<ChartTooltip valueFormatter={(v) => `${v}h`} />}
            />
            <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={22}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList
                dataKey="hours"
                position="right"
                formatter={(v) => (v == null ? "" : `${v}h`)}
                style={{
                  fill: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
