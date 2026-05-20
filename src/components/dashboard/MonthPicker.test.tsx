import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MonthPicker, type MonthOption } from "./MonthPicker";

const options: MonthOption[] = [
  { value: "2026-04", label: "Abril" },
  { value: "2026-05", label: "Maio" },
  { value: "2026-06", label: "Junho" },
];

describe("MonthPicker", () => {
  afterEach(() => cleanup());

  // O gatilho mostra o rótulo da opção atualmente selecionada
  it("shows the label of the selected option on the trigger", () => {
    render(<MonthPicker value="2026-05" options={options} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Maio" })).toBeInTheDocument();
  });

  // Fallback: valor sem opção correspondente é exibido cru (não quebra a UI)
  it("falls back to the raw value when it matches no option", () => {
    render(<MonthPicker value="desconhecido" options={options} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "desconhecido" })).toBeInTheDocument();
  });

  // Fechado por padrão; clicar abre a lista com todas as opções
  it("is closed by default and opens the option list on click", async () => {
    const user = userEvent.setup();
    render(<MonthPicker value="2026-05" options={options} onChange={vi.fn()} />);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Maio" }));

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);
  });

  // Marca a opção ativa com aria-selected (acessibilidade + destaque visual)
  it("marks the selected option with aria-selected", async () => {
    const user = userEvent.setup();
    render(<MonthPicker value="2026-05" options={options} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Maio" }));

    expect(screen.getByRole("option", { name: "Maio" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "Abril" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  // Escolher uma opção dispara onChange com o value certo e fecha a lista
  it("calls onChange with the chosen value and closes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MonthPicker value="2026-05" options={options} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Maio" }));
    await user.click(screen.getByRole("option", { name: "Junho" }));

    expect(onChange).toHaveBeenCalledWith("2026-06");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // Tecla Escape fecha a lista sem selecionar nada
  it("closes on Escape without selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MonthPicker value="2026-05" options={options} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Maio" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  // Clicar fora do componente fecha a lista
  it("closes when clicking outside the component", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>area externa</button>
        <MonthPicker value="2026-05" options={options} onChange={vi.fn()} />
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Maio" }));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "area externa" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
