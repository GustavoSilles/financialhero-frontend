"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Receipt, Calculator, TrendingUp, ChevronRight, Zap } from "lucide-react";
import gsap from "gsap";

const heroStats = [
  { label: "Gastos rastreados", value: "R$ 2.4M+", Icon: TrendingUp },
  { label: "Comprovantes", value: "18K+", Icon: Receipt },
  { label: "Horas economizadas", value: "520+", Icon: Calculator },
];

export function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from("[data-hero-anim]", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.2,
      });

      gsap.to("[data-hero-float]", {
        y: -26,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        force3D: true,
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 60% at 80% 40%, rgba(120, 3, 212, 0.14) 0%, transparent 60%), radial-gradient(ellipse 95% 75% at 10% 70%, rgba(255, 122, 0, 0.2) 0%, transparent 65%), linear-gradient(200deg, #05050a 0%, #0a0714 40%, #0f0820 70%, #05050a 100%)",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient soft blobs */}
      <div
        className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #7803d4 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-52 -left-52 w-[720px] h-[720px] rounded-full opacity-[0.28] blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #ff7a00 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 min-h-screen flex flex-col justify-center pt-18 pb-12 md:pt-24 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 items-center">
          {/* ── Esquerda: Conteúdo ── */}
          <div className="max-w-[600px] mx-auto md:mx-0 text-center md:text-left">
            <div
              data-hero-anim
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5 md:mb-8 w-fit mx-auto md:mx-0"
              style={{
                background: "rgba(255, 122, 0, 0.12)",
                color: "#ff7a00",
                border: "1px solid rgba(255, 122, 0, 0.28)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Zap className="w-4 h-4" />
              Seu superpoder financeiro
            </div>

            <h1 data-hero-anim className="mb-4 md:mb-6">
              <span
                className="block text-[28px] sm:text-4xl md:text-4xl xl:text-5xl font-bold text-white leading-[1.15]"
                style={{ fontFamily: "var(--font-sora), sans-serif", letterSpacing: "-0.02em" }}
              >
                Finanças são o seu
              </span>
              <span
                className="block mt-1 md:mt-2 gradient-text"
                style={{
                  fontFamily: "var(--font-instrument), serif",
                  fontStyle: "italic",
                  fontSize: "clamp(3.5rem, 14vw, 7.5rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                Superpoder.
              </span>
            </h1>

            <p
              data-hero-anim
              className="text-sm sm:text-base md:text-lg xl:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed mb-7 md:mb-10"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Organize comprovantes, acompanhe gastos recorrentes e descubra
              quanto do seu tempo de trabalho está sendo investido em cada
              compra. Tudo em um só lugar.
            </p>

            <div
              data-hero-anim
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center md:justify-start mb-8 md:mb-12"
            >
              <a
                href="/register"
                className="btn-hero text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 justify-center"
              >
                Começar agora
                <ChevronRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 rounded-xl font-semibold text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-200"
              >
                Já tenho conta
              </a>
            </div>

            {/* Stats cards — abaixo dos CTAs */}
            <div
              data-hero-anim
              className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3"
            >
              {heroStats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2 lg:gap-3 px-2 sm:px-4 py-2.5 rounded-xl text-center sm:text-left"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <stat.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-hero-orange shrink-0" />
                  <div>
                    <p className="text-white font-bold text-xs sm:text-sm leading-tight">{stat.value}</p>
                    <p className="text-white/50 text-[10px] sm:text-xs leading-tight">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Direita: Ilustração (desktop only) ── */}
          <div
            data-hero-anim
            className="relative hidden md:flex items-center justify-center"
          >
            <div
              data-hero-float
              className="relative w-full max-w-[480px] aspect-square"
              style={{
                willChange: "transform",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              {/* Glow atrás da imagem */}
              <div
                className="absolute inset-8 rounded-full opacity-70 blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,122,0,0.35) 0%, rgba(120,3,212,0.25) 50%, transparent 75%)",
                }}
              />
              <Image
                src="/hero-illustration.svg"
                alt="Ilustração FinancialHero: comprovantes ascendendo como gráfico com raio de superpoder"
                fill
                priority
                sizes="(max-width: 768px) 80vw, 40vw"
                style={{ objectFit: "contain" }}
                className="relative drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
