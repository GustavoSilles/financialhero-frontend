import type { BillType } from "@/api";

export interface BillCategoryStyle {
  label: string;
  color: string;
  bg: string;
}

export const BILL_CATEGORY_STYLES: Record<BillType, BillCategoryStyle> = {
  MORADIA: { label: "Moradia", color: "#7803d4", bg: "rgba(120, 3, 212, 0.14)" },
  ALIMENTACAO: { label: "Alimentação", color: "#ff7a00", bg: "rgba(255, 122, 0, 0.14)" },
  SERVICOS: { label: "Serviços", color: "#3b9bff", bg: "rgba(59, 155, 255, 0.14)" },
  SAUDE: { label: "Saúde", color: "#22c55e", bg: "rgba(34, 197, 94, 0.14)" },
  TRANSPORTE: { label: "Transporte", color: "#ffaa00", bg: "rgba(255, 170, 0, 0.14)" },
  OUTROS: { label: "Outros", color: "#6b7280", bg: "rgba(107, 114, 128, 0.14)" },
};

const FALLBACK: BillCategoryStyle = {
  label: "Outros",
  color: "#6b7280",
  bg: "rgba(107, 114, 128, 0.14)",
};

export function getCategoryStyle(type: string): BillCategoryStyle {
  return BILL_CATEGORY_STYLES[type as BillType] ?? FALLBACK;
}
