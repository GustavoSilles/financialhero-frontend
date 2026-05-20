import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastContext";

// Componente de teste que dispara toasts via o hook
function Consumer() {
  const { showToast } = useToast();
  return (
    <div>
      <button onClick={() => showToast("success", "Salvo com sucesso")}>sucesso</button>
      <button onClick={() => showToast("error", "Algo deu errado")}>erro</button>
    </div>
  );
}

const renderWithProvider = () =>
  render(
    <ToastProvider>
      <Consumer />
    </ToastProvider>,
  );

describe("ToastContext", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  // showToast renderiza um toast com a mensagem e role=status (acessível)
  it("renders a toast with the message when showToast is called", () => {
    renderWithProvider();

    fireEvent.click(screen.getByText("sucesso"));

    expect(screen.getByRole("status")).toHaveTextContent("Salvo com sucesso");
  });

  // Vários toasts coexistem empilhados
  it("stacks multiple toasts at once", () => {
    renderWithProvider();

    fireEvent.click(screen.getByText("sucesso"));
    fireEvent.click(screen.getByText("erro"));

    expect(screen.getAllByRole("status")).toHaveLength(2);
  });

  // Auto-dismiss: some sozinho depois da duração (4s) + animação de saída (200ms)
  it("auto-dismisses the toast after the timeout elapses", async () => {
    vi.useFakeTimers();
    renderWithProvider();

    fireEvent.click(screen.getByText("sucesso"));
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Ainda visível logo antes do prazo de 4s
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3999);
    });
    expect(screen.queryByRole("status")).toBeInTheDocument();

    // Cruza os 4s: dispara a animação de saída
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    // Passados os 200ms da transição, o toast é finalmente removido
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // Fechar manualmente no "X" remove o toast (após a animação de 200ms)
  it("dismisses the toast when the close button is clicked", async () => {
    vi.useFakeTimers();
    renderWithProvider();

    fireEvent.click(screen.getByText("erro"));
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  // Contrato do hook: usar useToast fora do provider é erro de programação
  it("throws when useToast is used outside <ToastProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
