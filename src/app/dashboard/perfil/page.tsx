"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Briefcase,
  Check,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { userApi, type ApiError, type UpdateUserRequest } from "@/api";

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  wage: string;
}

function userToForm(user: {
  firstName: string;
  lastName: string;
  email: string;
  wage: number;
}): FormState {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    wage: user.wage ? String(user.wage) : "",
  };
}

function parseWage(raw: string): number {
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export default function ProfilePage() {
  const { user, refreshToken } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    wage: "",
  });
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) setForm(userToForm(user));
  }, [user]);

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      form.firstName.trim() !== user.firstName ||
      form.lastName.trim() !== user.lastName ||
      form.email.trim() !== user.email ||
      parseWage(form.wage) !== user.wage
    );
  }, [form, user]);

  const handleReset = () => {
    if (user) setForm(userToForm(user));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const wage = parseWage(form.wage);

    if (!firstName) {
      showToast("error", "Informe seu nome.");
      return;
    }
    if (!lastName) {
      showToast("error", "Informe seu sobrenome.");
      return;
    }
    if (!email) {
      showToast("error", "Informe um e-mail válido.");
      return;
    }
    if (wage < 0) {
      showToast("error", "O salário não pode ser negativo.");
      return;
    }

    const patch: UpdateUserRequest = {};
    if (firstName !== user.firstName) patch.firstName = firstName;
    if (lastName !== user.lastName) patch.lastName = lastName;
    if (email !== user.email) patch.email = email;
    if (wage !== user.wage) patch.wage = wage;

    if (Object.keys(patch).length === 0) return;

    setSaving(true);
    try {
      const response = await userApi.update(user.id, patch);
      refreshToken(response.token);
      showToast("success", response.message ?? "Perfil atualizado com sucesso!");
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      showToast("error", "Informe sua senha atual.");
      return;
    }
    if (newPassword.length < 8) {
      showToast("error", "A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "As senhas não coincidem.");
      return;
    }
    if (newPassword === currentPassword) {
      showToast("error", "A nova senha não pode ser igual à atual.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await userApi.changePassword(user.id, {
        currentPassword,
        newPassword,
      });
      showToast("success", response.message ?? "Senha alterada com sucesso!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const apiError = err as ApiError;
      showToast("error", apiError.message ?? "Não foi possível alterar a senha.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary">Meu perfil</h1>
        <p className="text-muted mt-1">
          Gerencie suas informações pessoais e financeiras.
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <h3 className="text-lg font-bold text-primary mb-6">
          Informações pessoais
        </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Nome"
                icon={<UserIcon className="w-5 h-5 text-subtle" />}
              >
                <input
                  type="text"
                  required
                  className="input-field pl-12"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </FormField>
              <FormField
                label="Sobrenome"
                icon={<UserIcon className="w-5 h-5 text-subtle" />}
              >
                <input
                  type="text"
                  required
                  className="input-field pl-12"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </FormField>
            </div>

            <FormField
              label="E-mail"
              icon={<Mail className="w-5 h-5 text-subtle" />}
            >
              <input
                type="email"
                required
                className="input-field pl-12"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>

            <FormField
              label="Salário mensal (R$)"
              icon={<Briefcase className="w-5 h-5 text-subtle" />}
            >
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                className="input-field pl-12"
                value={form.wage}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === "" || /^\d*(?:[.,]\d{0,2})?$/.test(next)) {
                    setForm({ ...form, wage: next });
                  }
                }}
              />
            </FormField>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving || !isDirty}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-muted)",
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Desfazer
              </button>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="btn-hero text-base py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>
        </div>

        {/* Mudar senha */}
        <div className="card">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-hero-purple"
              style={{ backgroundColor: "rgba(120, 3, 212, 0.1)" }}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Alterar senha</h3>
              <p className="text-sm text-subtle mt-0.5">
                Use uma senha forte com pelo menos 8 caracteres.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            aria-label={showPasswords ? "Ocultar senhas" : "Mostrar senhas"}
            className="p-2 rounded-xl transition-colors hover:bg-hero-orange/10 shrink-0"
            style={{ color: "var(--text-subtle)" }}
          >
            {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <FormField
            label="Senha atual"
            icon={<Lock className="w-5 h-5 text-subtle" />}
          >
            <input
              type={showPasswords ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-field pl-12"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Nova senha"
              icon={<Lock className="w-5 h-5 text-subtle" />}
            >
              <input
                type={showPasswords ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="input-field pl-12"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
              />
            </FormField>
            <FormField
              label="Confirmar nova senha"
              icon={<Lock className="w-5 h-5 text-subtle" />}
            >
              <input
                type={showPasswords ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                className="input-field pl-12"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </FormField>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-hero text-base py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {changingPassword ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-muted">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
      {hint && <p className="text-xs text-subtle mt-2">{hint}</p>}
    </div>
  );
}
