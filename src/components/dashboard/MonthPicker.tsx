"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type MonthOption = { value: string; label: string };

export function MonthPicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: MonthOption[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 pl-3 pr-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-hero-orange/40 hover:bg-[var(--bg-hover)]"
        style={{
          backgroundColor: "var(--bg-item)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        }}
      >
        <span className="grid text-center">
          <span className="col-start-1 row-start-1">{current?.label ?? value}</span>
          {options.map((o) => (
            <span key={o.value} aria-hidden className="col-start-1 row-start-1 invisible pointer-events-none">
              {o.label}
            </span>
          ))}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-full w-max rounded-xl shadow-lg overflow-hidden z-20 py-1"
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-4 px-3 py-1.5 text-xs font-medium text-left transition-colors hover:bg-[var(--bg-hover)] ${
                  active ? "text-hero-orange" : "text-primary"
                }`}
              >
                <span>{opt.label}</span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
