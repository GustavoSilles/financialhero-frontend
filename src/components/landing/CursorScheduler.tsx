"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Calculator } from "lucide-react";
import { useInView } from "./useInView";

const calcExamples = [
  { item: "iPhone 16 Pro", price: 9799, wage: 25 },
  { item: "Nike Air Max", price: 899, wage: 25 },
  { item: "Netflix (mês)", price: 55.9, wage: 25 },
  { item: "Jantar fora", price: 180, wage: 25 },
];

function CursorSchedulerImpl() {
  const [exampleIndex, setExampleIndex] = useState(0);
  const hoursRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, delay: 750 });

  const current = calcExamples[exampleIndex];
  const targetHours = parseFloat((current.price / current.wage).toFixed(1));

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let rafId = 0;
    const duration = 1200;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = (eased * targetHours).toFixed(1);
      if (hoursRef.current) hoursRef.current.textContent = `${value}h`;
      if (progress < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [exampleIndex, targetHours, inView]);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setExampleIndex((i) => (i + 1) % calcExamples.length);
    }, 3500);
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
          <Calculator className="w-5 h-5 text-hero-orange" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Calculadora de Horas
        </h3>
      </div>
      <p className="text-muted text-sm mb-6">
        Veja exatamente quantas horas de trabalho cada compra custa. Agende e planeje com consciência.
      </p>

      <div className="mt-2 space-y-3">
        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            compra
          </span>
          <span className="text-sm font-semibold text-primary">{current.item}</span>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            valor
          </span>
          <span
            className="text-sm font-semibold text-hero-orange"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            R$ {current.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-2.5"
          style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
        >
          <span
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            seu valor/hora
          </span>
          <span
            className="text-sm text-muted"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            R$ {current.wage},00/h
          </span>
        </div>

        <div
          className="rounded-xl px-5 py-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(255,122,0,0.15), rgba(255,122,0,0.05))",
            border: "1px solid rgba(255,122,0,0.3)",
          }}
        >
          <span
            className="text-xs font-semibold text-hero-orange"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            horas de trabalho
          </span>
          <span
            ref={hoursRef}
            className="text-2xl font-bold text-hero-orange"
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            0h
          </span>
        </div>
      </div>
    </div>
  );
}

export const CursorScheduler = memo(CursorSchedulerImpl);
