"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, type ApiError } from "@/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(
        "Link inválido. Solicite uma nova recuperação de senha para continuar."
      );
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!token) return;

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword({ token, password });
      setSuccess(response.message ?? "Senha alterada com sucesso!");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex">
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 text-center text-white px-12">
          <h2 className="text-4xl font-bold mb-4">Defina uma nova senha</h2>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            Escolha algo forte e único para manter seu cofre de finanças seguro.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center mb-8">
              <span className="text-2xl font-bold text-primary">
                Financial<span className="gradient-text">Hero</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mt-6">
              Redefinir senha
            </h1>
            <p className="text-muted mt-2">
              Crie uma nova senha para acessar sua conta.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-hero-danger/10 text-hero-danger text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-hero-success/10 text-hero-success text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Nova senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="input-field pl-12 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle hover:text-muted"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Confirmar nova senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repita a nova senha"
                  className="input-field pl-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="btn-hero w-full text-base py-4 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>

          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-muted hover:text-hero-orange transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-page flex items-center justify-center">
          <p className="text-muted">Carregando...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
