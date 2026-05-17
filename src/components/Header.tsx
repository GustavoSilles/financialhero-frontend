"use client";

import Link from "next/link";
import { User, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const userName = user?.firstName || "Usuário";

  return (
    <header
      className="h-16 flex items-center justify-between px-4 xl:px-8 transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger - visible below lg */}
        <button
          onClick={onMenuToggle}
          className="xl:hidden p-2 rounded-xl transition-all hover:bg-hero-orange/10"
          style={{ color: "var(--text-muted)" }}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-base xl:text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          Olá, <span className="gradient-text">{userName}</span>!
        </h2>
      </div>
      <div className="flex items-center gap-2 xl:gap-3">
        <ThemeToggle />
        <Link
          href="/dashboard/perfil"
          aria-label="Abrir perfil"
          className="w-9 h-9 rounded-xl bg-hero-gradient flex items-center justify-center transition-transform hover:scale-105"
        >
          <User className="w-5 h-5 text-white" />
        </Link>
      </div>
    </header>
  );
}
