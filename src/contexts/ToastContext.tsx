"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:max-w-sm sm:w-full z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const dismiss = setTimeout(() => setLeaving(true), TOAST_DURATION_MS);
    return () => clearTimeout(dismiss);
  }, []);

  useEffect(() => {
    if (!leaving) return;
    const remove = setTimeout(onClose, 200);
    return () => clearTimeout(remove);
  }, [leaving, onClose]);

  const palette = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-hero-success" />,
      bar: "bg-hero-success",
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-hero-danger" />,
      bar: "bg-hero-danger",
    },
    info: {
      icon: <Info className="w-5 h-5 text-hero-orange" />,
      bar: "bg-hero-orange",
    },
  }[toast.type];

  return (
    <div
      role="status"
      className={`pointer-events-auto relative overflow-hidden rounded-xl shadow-lg flex items-start gap-3 p-4 pr-10 transition-all duration-200 ${
        leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      }`}
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${palette.bar}`} />
      <div className="shrink-0 mt-0.5">{palette.icon}</div>
      <p className="text-sm font-medium text-primary flex-1">{toast.message}</p>
      <button
        type="button"
        aria-label="Fechar"
        onClick={() => setLeaving(true)}
        className="absolute top-2 right-2 p-1 rounded-lg transition-colors hover:bg-hero-orange/10"
        style={{ color: "var(--text-subtle)" }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa estar dentro de <ToastProvider>");
  }
  return ctx;
}
