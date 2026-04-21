"use client";

import type { TooltipContentProps } from "recharts";

type Payload = {
  name?: string;
  value?: number | string;
  color?: string;
};

type ChartTooltipProps = Partial<TooltipContentProps<number, string>> & {
  valueFormatter?: (value: number) => string;
};

const defaultFormatter = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function ChartTooltip(props: ChartTooltipProps) {
  const { active, payload, label, valueFormatter = defaultFormatter } = props;
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 shadow-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {label !== undefined && (
        <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      )}
      {(payload as readonly Payload[]).map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span style={{ color: "var(--text-muted)" }}>{p.name}:</span>
          <span className="font-semibold">
            {typeof p.value === "number" ? valueFormatter(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}
