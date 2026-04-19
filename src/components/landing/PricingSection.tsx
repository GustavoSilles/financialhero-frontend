"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PricingSection({ children }: { children: ReactNode }) {
  const pricingSectionRef = useRef<HTMLDivElement>(null);
  const pricingContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pricingContainerRef.current) {
        const container = pricingContainerRef.current;
        const getSideClip = () => {
          const sidePadding = window.innerWidth < 640 ? 16 : 24;
          const targetWidth = Math.min(window.innerWidth - sidePadding * 2, 1280);
          return Math.max((window.innerWidth - targetWidth) / 2, 0);
        };
        gsap.fromTo(
          container,
          { clipPath: () => `inset(0 ${getSideClip()}px round 2rem)` },
          {
            clipPath: "inset(0 0px round 0px)",
            ease: "none",
            scrollTrigger: {
              trigger: pricingSectionRef.current,
              start: "top 85%",
              end: "top 20%",
              scrub: true,
              invalidateOnRefresh: true,
              onEnter: () => { container.style.willChange = "clip-path"; },
              onLeave: () => { container.style.willChange = "auto"; },
              onEnterBack: () => { container.style.willChange = "clip-path"; },
              onLeaveBack: () => { container.style.willChange = "auto"; },
              onUpdate: (self) => {
                const isMaximized = self.progress >= 0.99;
                container.style.borderColor = isMaximized
                  ? "transparent"
                  : "var(--border)";
              },
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pricingSectionRef} className="relative w-full pb-20 sm:pb-32">
      <div
        ref={pricingContainerRef}
        className="absolute top-0 h-full"
        style={{
          left: 0,
          width: "100%",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border)",
          pointerEvents: "none",
        }}
      />

      <section id="pricing" className="relative z-10 py-20 sm:py-32 px-4 sm:px-6 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-fira), monospace" }}
            >
              Preços
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
              style={{
                fontFamily: "var(--font-sora), sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              Escolha seu <span className="gradient-text">plano</span>
            </h2>
            <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
              Comece grátis. Evolua quando precisar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}
