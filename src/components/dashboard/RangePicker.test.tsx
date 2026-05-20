import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangePicker, RANGE_MONTHS } from "./RangePicker";

describe("RangePicker", () => {
  afterEach(() => cleanup());

  // RANGE_MONTHS é consumido para traduzir o range escolhido em meses na
  // chamada da API de tendência — um erro aqui pede o período errado ao backend
  it("RANGE_MONTHS maps each range to the correct number of months", () => {
    expect(RANGE_MONTHS).toEqual({ "3M": 3, "6M": 6, "1A": 12 });
  });

  // Renderiza as três opções de período
  it("renders the three range options", () => {
    render(<RangePicker value="6M" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "3M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1A" })).toBeInTheDocument();
  });

  // Clicar numa opção dispara onChange com o value correspondente
  it("calls onChange with the picked range", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangePicker value="6M" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "1A" }));

    expect(onChange).toHaveBeenCalledWith("1A");
  });

  // A opção ativa recebe o destaque visual (fundo laranja); as demais, não
  it("highlights only the active option", () => {
    render(<RangePicker value="3M" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "3M" }).className).toContain("bg-hero-orange");
    expect(screen.getByRole("button", { name: "6M" }).className).not.toContain(
      "bg-hero-orange",
    );
  });
});
