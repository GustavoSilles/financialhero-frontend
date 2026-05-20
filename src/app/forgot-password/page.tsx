"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { authApi, type ApiError } from "@/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword({ email: trimmed });
      setSuccess(
        response.message ??
          "Enviamos um e-mail com as instruções para redefinir sua senha."
      );
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Não foi possível enviar o e-mail. Tente novamente.");
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
          <h2 className="text-4xl font-bold mb-4">Recupere seu acesso</h2>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            Vamos te enviar um link seguro pra você voltar a controlar suas finanças
            em segundos.
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
              Esqueci minha senha
            </h1>
            <p className="text-muted mt-2">
              Informe seu e-mail cadastrado e enviaremos um link para criar uma
              nova senha.
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
              <label className="block text-sm font-medium mb-2 text-muted">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="input-field pl-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-hero w-full text-base py-4 disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar link de recuperação"}
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
