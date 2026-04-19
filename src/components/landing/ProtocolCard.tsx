import { GearVisual, ScanVisual, WaveVisual } from "./ProtocolVisuals";

export function ProtocolCard({
  step,
  title,
  description,
  visual,
}: {
  step: string;
  title: string;
  description: string;
  visual: "gear" | "scan" | "wave";
}) {
  return (
    <div
      data-protocol-card
      className="rounded-4xl p-8 sm:p-12 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 min-h-[350px]"
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        position: "sticky",
        top: "80px",
        zIndex: parseInt(step, 10) * 10,
      }}
    >
      <div
        className="w-full lg:w-1/2 flex items-center justify-center rounded-2xl p-8"
        style={{ backgroundColor: "var(--bg-hover)", minHeight: "200px" }}
      >
        {visual === "gear" && <GearVisual />}
        {visual === "scan" && <ScanVisual />}
        {visual === "wave" && <WaveVisual />}
      </div>

      <div className="w-full lg:w-1/2">
        <span
          className="text-hero-orange text-sm font-bold mb-4 block"
          style={{ fontFamily: "var(--font-fira), monospace" }}
        >
          Passo {step}
        </span>
        <h3
          className="text-2xl sm:text-3xl font-bold text-primary mb-4"
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h3>
        <p className="text-muted text-base sm:text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
