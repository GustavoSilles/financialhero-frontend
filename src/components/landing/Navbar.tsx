"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 80;
      setNavScrolled((prev) => (prev === scrolled ? prev : scrolled));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-3 rounded-[30px] ${
        menuOpen ? "transition-none" : "transition-all duration-500"
      } ${navScrolled || menuOpen ? "shadow-lg border" : "border border-transparent"}`}
      style={{
        backgroundColor:
          navScrolled || menuOpen
            ? "color-mix(in srgb, var(--bg-surface) 95%, transparent)"
            : "transparent",
        backdropFilter: navScrolled || menuOpen ? "blur(20px)" : "none",
        WebkitBackdropFilter: navScrolled || menuOpen ? "blur(20px)" : "none",
        borderColor: navScrolled || menuOpen ? "var(--border)" : "transparent",
        maxWidth: "min(90vw, 800px)",
        width: "100%",
      }}
    >
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-xl font-bold transition-all duration-300 hover:opacity-80 cursor-pointer text-left"
          style={{
            fontFamily: "var(--font-sora), sans-serif",
            color: navScrolled ? "var(--text-primary)" : "#fff",
          }}
        >
          Financial<span className="gradient-text">Hero</span>
        </button>

        <div
          className="hidden md:flex items-center gap-6 text-sm font-medium transition-colors duration-300"
          style={{ color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)" }}
        >
          <a href="#features" className="hover:text-hero-orange transition-colors">
            Recursos
          </a>
          <a href="#protocol" className="hover:text-hero-orange transition-colors">
            Como funciona
          </a>
          <a href="#pricing" className="hover:text-hero-orange transition-colors">
            Preços
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className="text-sm font-medium transition-colors hover:text-hero-orange"
            style={{ color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)" }}
          >
            Entrar
          </a>
          <a href="/register" className="btn-hero text-sm py-2 px-5">
            Criar conta
          </a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl transition-all"
            style={{ color: navScrolled ? "var(--text-muted)" : "rgba(255,255,255,0.8)" }}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden mt-3 pt-4 pb-2 space-y-1"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <a
            href="#features"
            className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Recursos
          </a>
          <a
            href="#protocol"
            className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Como funciona
          </a>
          <a
            href="#pricing"
            className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Preços
          </a>
          <a
            href="/login"
            className="block py-3 px-2 text-base text-gray-300 hover:text-hero-orange transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Entrar
          </a>
          <a
            href="/register"
            className="block w-full py-3 mt-4 text-center btn-hero text-base"
            onClick={() => setMenuOpen(false)}
          >
            Criar conta
          </a>
        </div>
      )}
    </nav>
  );
}
