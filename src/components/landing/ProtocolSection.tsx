"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProtocolSection({ children }: { children: ReactNode }) {
  const protocolRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-protocol-card]");

      cards.forEach((card, i) => {
        if (i < cards.length - 1) {
          card.style.willChange = "transform, opacity";
          gsap.set(card, { force3D: true });

          const nextCard = cards[i + 1];
          ScrollTrigger.create({
            trigger: nextCard,
            start: "top 80%",
            end: "top 20%",
            scrub: 0.3,
            fastScrollEnd: true,
            onUpdate: (self) => {
              const p = self.progress;
              gsap.set(card, {
                scale: 1 - 0.08 * p,
                opacity: 1 - p,
                force3D: true,
              });
            },
            onLeave: () => { card.style.willChange = "auto"; },
            onEnterBack: () => { card.style.willChange = "transform, opacity"; },
          });
        }
      });
    }, protocolRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="protocol" ref={protocolRef} className="py-20 sm:py-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            Protocolo
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Como <span className="gradient-text">funciona</span>
          </h2>
        </div>

        <div className="space-y-8">{children}</div>
      </div>
    </section>
  );
}
