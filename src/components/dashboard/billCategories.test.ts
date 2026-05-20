import { describe, expect, it } from "vitest";
import { BILL_CATEGORY_STYLES, getCategoryStyle } from "./billCategories";
import type { BillType } from "@/api";

const ALL_TYPES: BillType[] = [
  "MORADIA",
  "ALIMENTACAO",
  "SERVICOS",
  "SAUDE",
  "TRANSPORTE",
  "OUTROS",
];

describe("billCategories", () => {
  // Toda categoria do backend precisa ter um estilo — senão a UI fica sem cor/rótulo
  it("defines a style for every BillType", () => {
    for (const type of ALL_TYPES) {
      expect(BILL_CATEGORY_STYLES[type]).toBeDefined();
    }
    expect(Object.keys(BILL_CATEGORY_STYLES)).toHaveLength(ALL_TYPES.length);
  });

  // Cada estilo é completo: label legível, cor em hex e cor de fundo
  it("gives every category a non-empty label, hex color and background", () => {
    for (const type of ALL_TYPES) {
      const style = getCategoryStyle(type);
      expect(style.label).toBeTruthy();
      expect(style.color).toMatch(/^#[0-9a-f]{3,8}$/i);
      expect(style.bg).toBeTruthy();
    }
  });

  // Caminho feliz: tipo conhecido devolve exatamente seu estilo
  it("getCategoryStyle returns the exact style of a known type", () => {
    expect(getCategoryStyle("ALIMENTACAO")).toEqual({
      label: "Alimentação",
      color: "#ff7a00",
      bg: "rgba(255, 122, 0, 0.14)",
    });
  });

  // Robustez: tipo desconhecido (ex.: nova categoria no backend) cai no fallback
  // "Outros" em vez de quebrar a renderização com undefined
  it("getCategoryStyle falls back to 'Outros' for an unknown type", () => {
    const fallback = getCategoryStyle("TIPO_INEXISTENTE");
    expect(fallback.label).toBe("Outros");
    expect(fallback).toEqual(getCategoryStyle("OUTROS"));
  });
});
