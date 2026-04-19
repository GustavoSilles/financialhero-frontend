"use client";

import { memo, useEffect, useRef } from "react";
import { CalendarClock } from "lucide-react";
import { useInView } from "./useInView";

const messages = [
  "→ Netflix cobrado: R$ 55,90",
  "→ Aluguel pago ✓ (-R$ 1.200)",
  "→ Economia do mês: +R$ 340",
  "→ Limite de gastos: 78% usado",
];

const recurringBills = [
  { name: "Aluguel", value: "R$ 1.200", daysLeft: 5, paid: false },
  { name: "Energia elétrica", value: "R$ 189", daysLeft: 3, paid: false },
];

function TelemetryTypewriterImpl() {
  const containerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, delay: 750 });

  useEffect(() => {
    if (!inView || !feedRef.current) return;

    const feed = feedRef.current;
    let msgIdx = 0;
    let charIdx = 0;
    let timerId: ReturnType<typeof setTimeout>;
    const completedLines: string[] = [];

    function render() {
      if (!feed) return;
      let html = "";
      for (const line of completedLines) {
        html += `<p class="text-muted leading-relaxed opacity-60">${line}</p>`;
      }
      if (msgIdx < messages.length) {
        const partial = messages[msgIdx].slice(0, charIdx);
        if (partial) {
          html += `<p class="text-primary leading-relaxed">${partial}<span class="cursor-blink text-hero-orange ml-0.5">▌</span></p>`;
        }
      }
      feed.innerHTML = html;
    }

    function tick() {
      if (msgIdx >= messages.length) {
        timerId = setTimeout(() => {
          completedLines.length = 0;
          msgIdx = 0;
          charIdx = 0;
          render();
          timerId = setTimeout(tick, 35);
        }, 2000);
        return;
      }

      const msg = messages[msgIdx];
      if (charIdx < msg.length) {
        charIdx++;
        render();
        timerId = setTimeout(tick, 35);
      } else {
        completedLines.push(msg);
        if (completedLines.length > 4) completedLines.shift();
        charIdx = 0;
        msgIdx++;
        render();
        timerId = setTimeout(tick, 800);
      }
    }

    render();
    timerId = setTimeout(tick, 35);
    return () => clearTimeout(timerId);
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
        <div className="w-10 h-10 rounded-xl bg-hero-purple/10 flex items-center justify-center">
          <CalendarClock className="w-5 h-5 text-hero-purple" />
        </div>
        <h3
          className="text-lg font-bold text-primary"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          Gastos Recorrentes
        </h3>
      </div>
      <p className="text-muted text-sm mb-4">
        Acompanhe contas fixas com alertas automáticos. Nunca mais perca um vencimento.
      </p>

      <div className="space-y-2 mb-4">
        {recurringBills.map((bill) => (
          <div
            key={bill.name}
            className="flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ backgroundColor: "var(--bg-hover)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: bill.paid
                    ? "#22c55e"
                    : bill.daysLeft <= 3
                      ? "#f59e0b"
                      : "var(--text-muted)",
                }}
              />
              <span className="text-sm text-primary">{bill.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs text-muted"
                style={{ fontFamily: "var(--font-fira), monospace" }}
              >
                {bill.paid ? "pago ✓" : `vence em ${bill.daysLeft}d`}
              </span>
              <span
                className="text-sm font-semibold text-hero-orange"
                style={{ fontFamily: "var(--font-fira), monospace" }}
              >
                {bill.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-hero-success pulse-dot" />
        <span
          className="text-xs font-semibold text-hero-success uppercase tracking-wider"
          style={{ fontFamily: "var(--font-fira), monospace" }}
        >
          Live Feed
        </span>
      </div>

      <div
        ref={feedRef}
        className="rounded-xl p-4 overflow-hidden flex flex-col justify-end"
        style={{
          backgroundColor: "var(--bg-hover)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-fira), monospace",
          fontSize: "0.7rem",
          height: "7rem",
        }}
      />
    </div>
  );
}

export const TelemetryTypewriter = memo(TelemetryTypewriterImpl);
