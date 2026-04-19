"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useInView } from "./useInView";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-hero-orange border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

type SplineApp = { play?: () => void; stop?: () => void };

function LazySpline({ scene }: { scene: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<SplineApp | null>(null);
  const mountedOnceRef = useRef(false);
  const inView = useInView(containerRef, { rootMargin: "400px" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (inView && !mountedOnceRef.current) {
      mountedOnceRef.current = true;
      setMounted(true);
    }
  }, [inView]);

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (inView) {
      app.play?.();
    } else {
      app.stop?.();
    }
  }, [inView]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {mounted && (
        <Spline
          scene={scene}
          onLoad={(app: SplineApp) => {
            appRef.current = app;
            if (!inView) app.stop?.();
          }}
        />
      )}
    </div>
  );
}

export function PhilosophySection() {
  const philosophyRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set("[data-philosophy-word]", {
        y: 30,
        opacity: 0,
        willChange: "transform, opacity",
        force3D: true,
      });

      gsap.to("[data-philosophy-word]", {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.04,
        force3D: true,
        clearProps: "willChange,transform",
        scrollTrigger: {
          trigger: philosophyRef.current,
          start: "top 75%",
          once: true,
          fastScrollEnd: true,
        },
      });
    }, philosophyRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={philosophyRef}
      className="relative w-full min-h-screen flex flex-col items-center justify-center py-20 px-4 sm:px-6 overflow-hidden"
      style={{ backgroundColor: "#0A0A14" }}
    >
      {/* Background texture via next/image (otimizado) */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <Image
          src="/terra_noite.avif"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
          loading="lazy"
        />
      </div>

      {/* 3D Spline Background */}
      <div className="absolute w-full h-[120%] z-0 cursor-grab active:cursor-grabbing">
        <LazySpline scene="https://prod.spline.design/qcckZE7VvJkI0sF2/scene.splinecode" />
      </div>

      {/* Smooth Glass Mask behind text */}
      <div
        className="absolute inset-x-0 inset-y-0 z-0 pointer-events-none"
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          maskImage: "radial-gradient(circle at center, black 15%, transparent 40%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 15%, transparent 40%)",
        }}
      />

      {/* Floating Text Container */}
      <div
        className="relative z-10 max-w-5xl mx-auto text-center shrink-0 pointer-events-none"
        style={{ textShadow: "0px 4px 30px rgba(0,0,0,0.9)" }}
      >
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium mb-6 sm:mb-8 leading-relaxed">
          {"A maioria dos apps de finanças foca em:".split(" ").map((word, i) => (
            <span key={i} data-philosophy-word className="inline-block mr-2">
              {word}
            </span>
          ))}
          <br />
          {"planilhas complicadas e gráficos confusos.".split(" ").map((word, i) => (
            <span
              key={`b-${i}`}
              data-philosophy-word
              className="inline-block mr-2"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {word}
            </span>
          ))}
        </p>
        <p className="leading-tight">
          {"Nós focamos em:".split(" ").map((word, i) => (
            <span
              key={`c-${i}`}
              data-philosophy-word
              className="inline-block mr-3 text-2xl sm:text-3xl md:text-4xl text-white font-bold"
              style={{ fontFamily: "var(--font-sora), sans-serif" }}
            >
              {word}
            </span>
          ))}
          <br />
          <span
            data-philosophy-word
            className="inline-block mt-2 sm:mt-4"
            style={{
              fontFamily: "var(--font-instrument), serif",
              fontStyle: "italic",
              fontSize: "clamp(3rem, 8vw, 7rem)",
              lineHeight: 1.1,
              background: "linear-gradient(135deg, #ff7a00, #ff9a40)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Clareza.
          </span>
        </p>
      </div>
    </section>
  );
}
