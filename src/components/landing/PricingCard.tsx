import { ReactNode } from "react";
import { Check, ArrowRight } from "lucide-react";

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  icon,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  icon: ReactNode;
  highlighted: boolean;
}) {
  return (
    <div
      className="rounded-4xl p-6 sm:p-8 flex flex-col relative overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: highlighted ? "#0A0A14" : "var(--bg-surface)",
        border: highlighted ? "2px solid #ff7a00" : "1px solid var(--border)",
        boxShadow: highlighted
          ? "0 8px 40px rgba(255, 122, 0, 0.15)"
          : "0 4px 24px rgba(0,0,0,0.06)",
        color: highlighted ? "#eaeaea" : "var(--text-primary)",
      }}
    >
      {highlighted && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, #ff7a00, #7803d4)" }}
        />
      )}

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: highlighted ? "rgba(255, 122, 0, 0.15)" : "var(--bg-hover)",
            color: highlighted ? "#ff7a00" : "var(--text-muted)",
          }}
        >
          {icon}
        </div>
        <span
          className="font-bold text-lg"
          style={{ fontFamily: "var(--font-sora), sans-serif" }}
        >
          {name}
        </span>
      </div>

      <div className="mb-6">
        <span
          className="text-3xl sm:text-4xl font-bold"
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            color: highlighted ? "#ffffff" : "var(--text-primary)",
          }}
        >
          {price}
        </span>
        {period && (
          <span
            className="text-sm ml-1"
            style={{
              color: highlighted ? "rgba(255,255,255,0.5)" : "var(--text-subtle)",
            }}
          >
            {period}
          </span>
        )}
      </div>
      <p
        className="text-sm mb-8"
        style={{ color: highlighted ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}
      >
        {description}
      </p>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#ff7a00" }} />
            <span
              style={{
                color: highlighted ? "rgba(255,255,255,0.8)" : "var(--text-muted)",
              }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <a
        href="/register"
        className={`inline-flex items-center justify-center py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
          highlighted ? "btn-hero" : ""
        }`}
        style={
          highlighted
            ? {}
            : {
                backgroundColor: "var(--bg-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }
        }
      >
        Começar agora
        <ArrowRight className="w-4 h-4 ml-2" />
      </a>
    </div>
  );
}
