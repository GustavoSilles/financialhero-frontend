"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  CalendarClock,
  Calculator,
  LogOut,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Comprovantes", href: "/dashboard/comprovantes", icon: Receipt },
  { label: "Gastos Recorrentes", href: "/dashboard/gastos", icon: CalendarClock },
  { label: "Calculadora", href: "/dashboard/calculadora", icon: Calculator },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 w-72 h-screen flex flex-col transition-transform duration-300 ease-in-out
          xl:relative xl:translate-x-0 xl:z-auto xl:h-auto xl:min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo + Close button (mobile) */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/dashboard" className="flex items-center" onClick={handleLinkClick}>
            <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Financial<span className="gradient-text">Hero</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="xl:hidden p-2 rounded-xl transition-all hover:bg-hero-orange/10"
            style={{ color: "var(--text-subtle)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={handleLinkClick}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 w-full hover:bg-hero-danger/10 hover:text-hero-danger"
            style={{ color: "var(--text-subtle)" }}
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
