"use client";

export type RangeValue = "3M" | "6M" | "1A";

const OPTIONS: { value: RangeValue; label: string }[] = [
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1A", label: "1A" },
];

export const RANGE_MONTHS: Record<RangeValue, number> = {
  "3M": 3,
  "6M": 6,
  "1A": 12,
};

export function RangePicker({
  value,
  onChange,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full p-0.5"
      style={{
        backgroundColor: "var(--bg-item)",
        border: "1px solid var(--border)",
      }}
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
              active
                ? "bg-hero-orange text-white"
                : "text-muted hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
