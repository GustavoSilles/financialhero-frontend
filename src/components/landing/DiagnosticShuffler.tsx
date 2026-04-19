"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Receipt } from "lucide-react";
import { useInView } from "./useInView";

const shufflerLabels = [
  { title: "Aluguel", value: "R$ 1.200", category: "Moradia" },
  { title: "Supermercado", value: "R$ 487", category: "Alimentação" },
  { title: "Streaming", value: "R$ 55", category: "Lazer" },
];
const shufflerFilters = ["Todos", "Moradia", "Alimentação", "Lazer"];

function DiagnosticShufflerImpl() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, delay: 750 });

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % shufflerLabels.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div
      ref={containerRef}
      className="rounded-4xl p-6 sm:p-8 h-full"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-hero-orange/10 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-hero-orange" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Comprovantes
        </h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Organize todos os seus recibos em um só lugar. Busque, filtre e nunca perca um comprovante.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {shufflerFilters.map((f, i) => (
          <button
            key={f}
            onClick={() => setActiveFilter(i)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200"
            style={{
              backgroundColor: activeFilter === i ? "#ff7a00" : "var(--bg-hover)",
              color: activeFilter === i ? "white" : "var(--text-muted)",
              border: `1px solid ${activeFilter === i ? "#ff7a00" : "var(--border)"}`,
              fontFamily: "var(--font-fira), monospace",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="relative h-42">
        {shufflerLabels.map((item, i) => {
          const offset = (i - activeIndex + shufflerLabels.length) % shufflerLabels.length;
          return (
            <div
              key={item.title}
              className="absolute inset-x-0 rounded-2xl p-4"
              style={{
                backgroundColor: offset === 0 ? "var(--bg-surface)" : "var(--bg-hover)",
                border: "1px solid var(--border)",
                transform: `translateY(${offset * 40}px) scale(${1 - offset * 0.04})`,
                opacity: offset === 0 ? 1 : offset === 1 ? 0.5 : 0.3,
                zIndex: shufflerLabels.length - offset,
                transition: "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary text-sm">{item.title}</p>
                  <p className="text-xs text-muted mt-1">{item.category}</p>
                </div>
                <span
                  className="text-hero-orange font-bold text-lg"
                  style={{ fontFamily: "var(--font-fira), monospace" }}
                >
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className="text-xs text-muted"
          style={{ fontFamily: "var(--font-fira), monospace" }}
        >
          Este mês
        </span>
        <span
          className="text-xs font-bold text-hero-orange"
          style={{ fontFamily: "var(--font-fira), monospace" }}
        >
          3 comprovantes · R$ 1.742
        </span>
      </div>
    </div>
  );
}

export const DiagnosticShuffler = memo(DiagnosticShufflerImpl);
