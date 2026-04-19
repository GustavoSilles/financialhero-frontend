"use client";

import { useRef } from "react";
import { useInView } from "./useInView";

const GEAR_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const SCAN_DOTS = Array.from({ length: 36 }, (_, i) => ({
  cx: (i % 6) * 20 + 10,
  cy: Math.floor(i / 6) * 20 + 10,
}));

export function GearVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref);
  return (
    <svg
      ref={ref}
      width="120"
      height="120"
      viewBox="0 0 120 120"
      className="text-hero-orange"
      style={{
        animation: "rotate-slow 12s linear infinite",
        animationPlayState: inView ? "running" : "paused",
      }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="60" cy="60" r="20" />
        <circle cx="60" cy="60" r="35" strokeDasharray="8 4" />
        <circle cx="60" cy="60" r="50" strokeDasharray="4 8" opacity="0.5" />
        {GEAR_ANGLES.map((angle) => (
          <line
            key={angle}
            x1="60"
            y1="60"
            x2={60 + Math.cos((angle * Math.PI) / 180) * 55}
            y2={60 + Math.sin((angle * Math.PI) / 180) * 55}
            opacity="0.3"
          />
        ))}
      </g>
    </svg>
  );
}

export function ScanVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} className="relative w-[120px] h-[120px]">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {SCAN_DOTS.map((dot, i) => (
          <circle key={i} cx={dot.cx} cy={dot.cy} r="3" fill="var(--text-subtle)" opacity="0.3" />
        ))}
      </svg>
      <div
        className="absolute left-0 w-full h-0.5 bg-hero-purple"
        style={{
          animation: "scan 2.5s ease-in-out infinite alternate",
          animationPlayState: inView ? "running" : "paused",
          boxShadow: "0 0 12px rgba(120, 3, 212, 0.5)",
          top: "0",
        }}
      />
    </div>
  );
}

export function WaveVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref);
  return (
    <svg
      ref={ref}
      width="200"
      height="80"
      viewBox="0 0 200 80"
      className="text-hero-orange"
    >
      <path
        d="M0,40 Q10,10 20,40 Q30,70 40,40 Q50,10 60,40 Q70,70 80,40 Q90,10 100,40 Q110,70 120,40 Q130,10 140,40 Q150,70 160,40 Q170,10 180,40 Q190,70 200,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="1000"
        strokeDashoffset="1000"
        style={{
          animation: "ekg-wave 3s linear infinite",
          animationPlayState: inView ? "running" : "paused",
        }}
      />
      <path
        d="M0,40 Q10,10 20,40 Q30,70 40,40 Q50,10 60,40 Q70,70 80,40 Q90,10 100,40 Q110,70 120,40 Q130,10 140,40 Q150,70 160,40 Q170,10 180,40 Q190,70 200,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.2"
      />
    </svg>
  );
}
