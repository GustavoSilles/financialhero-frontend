"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DiagnosticShuffler } from "./DiagnosticShuffler";
import { TelemetryTypewriter } from "./TelemetryTypewriter";
import { CursorScheduler } from "./CursorScheduler";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FeaturesSection() {
  const featuresRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set("[data-feature-card]", {
        y: 24,
        opacity: 0,
        willChange: "transform, opacity",
        force3D: true,
      });

      gsap.to("[data-feature-card]", {
        y: 0,
        opacity: 1,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.08,
        force3D: true,
        clearProps: "willChange,transform",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 85%",
          once: true,
          fastScrollEnd: true,
        },
      });
    }, featuresRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={featuresRef}
      className="py-20 sm:py-32 px-4 sm:px-8 lg:px-16"
      style={{ backgroundColor: "var(--bg-surface)" }}
    >
      <div className="w-full">
        <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
          <p
            className="text-hero-orange font-semibold text-sm uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--font-fira), monospace" }}
          >
            Recursos
          </p>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-6"
            style={{
              fontFamily: "var(--font-sora), sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            Seus <span className="gradient-text">superpoderes</span> financeiros
          </h2>
          <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto">
            Ferramentas interativas que transformam o caos financeiro em clareza absoluta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          <div data-feature-card>
            <DiagnosticShuffler />
          </div>
          <div data-feature-card>
            <TelemetryTypewriter />
          </div>
          <div data-feature-card className="md:col-span-2 xl:col-span-1">
            <CursorScheduler />
          </div>
        </div>
      </div>
    </section>
  );
}
