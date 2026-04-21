"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import type { ApiError } from "@/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      router.replace("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative z-10 text-center text-white px-12">
          <h2 className="text-4xl font-bold mb-4">Bem-vindo de volta, herói!</h2>
          <p className="text-lg opacity-90 max-w-md mx-auto">
            Continue sua jornada de organização financeira. Seus comprovantes e
            métricas estão esperando por você.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative">
        {/* Theme toggle top-right */}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mt-6">Entrar</h1>
            <p className="text-muted mt-2">
              Acesse sua conta para gerenciar suas finanças
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-hero-danger/10 text-hero-danger text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="input-field pl-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="input-field pl-12 pr-12"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <button
              type="submit"
              disabled={loading}
              className="btn-hero w-full text-base py-4 disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-muted mt-6">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-hero-orange font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
