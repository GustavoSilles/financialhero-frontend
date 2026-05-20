import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";

// useAuth mockado: register() é controlado por teste
const registerMock = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// useRouter mockado: capturamos replace()
const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
}));

// ThemeToggle stubado para não precisar do ThemeProvider
vi.mock("@/components/ThemeToggle", () => ({ default: () => null }));

/** Preenche o formulário inteiro. Campos não passados ficam vazios. */
async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  fields: Partial<{
    name: string;
    email: string;
    wage: string;
    password: string;
    confirm: string;
  }>,
) {
  if (fields.name) await user.type(screen.getByPlaceholderText("Seu nome"), fields.name);
  if (fields.email) await user.type(screen.getByPlaceholderText("seu@email.com"), fields.email);
  if (fields.wage) await user.type(screen.getByPlaceholderText("0,00"), fields.wage);
  if (fields.password)
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), fields.password);
  if (fields.confirm)
    await user.type(screen.getByPlaceholderText("Repita a senha"), fields.confirm);
}

const submit = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole("button", { name: /criar conta/i }));

describe("RegisterPage", () => {
  beforeEach(() => {
    registerMock.mockReset();
    replaceMock.mockReset();
    mockUseAuth.mockReturnValue({
      register: registerMock,
      isAuthenticated: false,
      isLoading: false,
    });
  });
  afterEach(() => cleanup());

  // Validação client-side: senhas diferentes nem chegam à API
  it("blocks submit when the passwords do not match", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      name: "Gustavo Silles",
      email: "g@a.com",
      password: "12345678",
      confirm: "87654321",
    });
    await submit(user);

    expect(await screen.findByText(/senhas não coincidem/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  // Validação: senha curta demais é barrada com mensagem específica
  it("blocks submit when the password is shorter than 8 characters", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      name: "Gustavo Silles",
      email: "g@a.com",
      password: "1234567",
      confirm: "1234567",
    });
    await submit(user);

    expect(await screen.findByText(/pelo menos 8 caracteres/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  // Validação: precisa de nome E sobrenome (a API espera os dois separados)
  it("requires both a first and a last name", async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await fillForm(user, {
      name: "Gustavo",
      email: "g@a.com",
      password: "12345678",
      confirm: "12345678",
    });
    await submit(user);

    expect(await screen.findByText(/nome e sobrenome/i)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  // Caminho feliz: nome é dividido em first/last, salário é parseado e redireciona
  it("splits the name, parses the wage and redirects on success", async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValueOnce(undefined);
    render(<RegisterPage />);

    await fillForm(user, {
      name: "  Gustavo  Silles  ",
      email: "  gustavo@a.com  ",
      wage: "3000,50",
      password: "12345678",
      confirm: "12345678",
    });
    await submit(user);

    expect(registerMock).toHaveBeenCalledWith({
      firstName: "Gustavo",
      lastName: "Silles",
      email: "gustavo@a.com",
      password: "12345678",
      wage: 3000.5,
    });
    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });

  // Nome com 3+ partes: primeira é o firstName, o resto vira lastName
  it("treats every name part after the first as the last name", async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValueOnce(undefined);
    render(<RegisterPage />);

    await fillForm(user, {
      name: "Ana Maria Souza",
      email: "ana@a.com",
      password: "12345678",
      confirm: "12345678",
    });
    await submit(user);

    expect(registerMock).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Ana", lastName: "Maria Souza", wage: 0 }),
    );
  });

  // Erro da API é exibido e não há redirect
  it("shows the API error message and stays on the page", async () => {
    const user = userEvent.setup();
    registerMock.mockRejectedValueOnce({ message: "E-mail já cadastrado" });
    render(<RegisterPage />);

    await fillForm(user, {
      name: "Gustavo Silles",
      email: "g@a.com",
      password: "12345678",
      confirm: "12345678",
    });
    await submit(user);

    expect(await screen.findByText(/e-mail já cadastrado/i)).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // Se já está logado, a página redireciona direto pro dashboard
  it("redirects to /dashboard when the user is already authenticated", () => {
    mockUseAuth.mockReturnValue({
      register: registerMock,
      isAuthenticated: true,
      isLoading: false,
    });

    render(<RegisterPage />);

    expect(replaceMock).toHaveBeenCalledWith("/dashboard");
  });
});
