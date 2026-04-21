"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import { MonthPicker, type MonthOption } from "./MonthPicker";

type CategorySlice = { name: string; value: number; color: string };

const monthOptions: MonthOption[] = [
  { value: "2026-03", label: "Março 2026" },
  { value: "2026-02", label: "Fevereiro 2026" },
  { value: "2026-01", label: "Janeiro 2026" },
  { value: "2025-12", label: "Dezembro 2025" },
  { value: "2025-11", label: "Novembro 2025" },
  { value: "2025-10", label: "Outubro 2025" },
];

const dataByMonth: Record<string, CategorySlice[]> = {
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

export function CategoryDonutChart() {
  const [month, setMonth] = useState(monthOptions[0].value);
  const data = dataByMonth[month];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary">Gastos por Categoria</h3>
          <p className="text-sm text-subtle">Distribuição do mês</p>
        </div>
        <MonthPicker value={month} options={monthOptions} onChange={setMonth} />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                stroke="var(--bg-surface)"
                strokeWidth={3}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-subtle">Total</p>
            <p className="text-lg font-bold text-primary">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          {data.map((item) => {
            const pct = (item.value / total) * 100;
            return (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted truncate">{item.name}</span>
                </div>
                <span className="font-semibold text-primary shrink-0">
                  {pct.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
