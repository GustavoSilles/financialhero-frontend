import { Shield, Zap, Crown } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PhilosophySection } from "@/components/landing/PhilosophySection";
import { ProtocolSection } from "@/components/landing/ProtocolSection";
import { ProtocolCard } from "@/components/landing/ProtocolCard";
import { PricingSection } from "@/components/landing/PricingSection";
import { PricingCard } from "@/components/landing/PricingCard";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page relative dark">
      <Navbar />

      <HeroSection />

      <FeaturesSection />

      <PhilosophySection />

      <ProtocolSection>
        <ProtocolCard
          step="01"
          title="Cadastre"
          description="Registre seus comprovantes, gastos recorrentes e configure seu salário. O setup leva menos de 2 minutos."
          visual="gear"
        />
        <ProtocolCard
          step="02"
          title="Monitore"
          description="Acompanhe em tempo real para onde seu dinheiro está indo. Receba alertas de vencimento e tendências de gastos."
          visual="scan"
        />
        <ProtocolCard
          step="03"
          title="Domine"
          description="Entenda exatamente quantas horas de trabalho cada compra custa. Tome decisões financeiras com consciência total."
          visual="wave"
        />
      </ProtocolSection>

      <PricingSection>
        <PricingCard
          name="Essencial"
          price="Grátis"
          description="Para quem está começando a organizar suas finanças"
          features={[
            "Até 50 comprovantes/mês",
            "3 gastos recorrentes",
            "Calculadora de horas",
            "Dashboard básico",
          ]}
          icon={<Shield className="w-6 h-6" />}
          highlighted={false}
        />
        <PricingCard
          name="Performance"
          price="R$ 19,90"
          period="/mês"
          description="Para quem quer controle total das finanças"
          features={[
            "Comprovantes ilimitados",
            "Gastos recorrentes ilimitados",
            "Alertas de vencimento",
            "Relatórios avançados",
            "Exportar dados",
          ]}
          icon={<Zap className="w-6 h-6" />}
          highlighted={true}
        />
        <PricingCard
          name="Enterprise"
          price="R$ 49,90"
          period="/mês"
          description="Para equipes e gestão financeira compartilhada"
          features={[
            "Tudo do Performance",
            "Múltiplos usuários",
            "API de integração",
            "Suporte prioritário",
            "Dashboard personalizado",
          ]}
          icon={<Crown className="w-6 h-6" />}
          highlighted={false}
        />
      </PricingSection>

      <div style={{ backgroundColor: "var(--bg-surface)" }}>
        <footer
          className="px-4 sm:px-6 py-12 sm:py-16"
          style={{
            backgroundColor: "#0A0A14",
            borderRadius: "3rem 3rem 0 0",
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
              <div className="md:col-span-1">
                <span
                  className="text-xl font-bold text-white block mb-4"
                  style={{ fontFamily: "var(--font-sora), sans-serif" }}
                >
                  Financial<span className="gradient-text">Hero</span>
                </span>
                <p className="text-white/40 text-sm leading-relaxed">
                  Transformando a relação das pessoas com o dinheiro, uma decisão consciente de cada vez.
                </p>
              </div>

              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Produto
                </h4>
                <ul className="space-y-3">
                  {["Recursos", "Preços", "Changelog", "Roadmap"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-white/40 hover:text-hero-orange text-sm transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Empresa
                </h4>
                <ul className="space-y-3">
                  {["Sobre", "Blog", "Carreiras", "Contato"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-white/40 hover:text-hero-orange text-sm transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
                  Legal
                </h4>
                <ul className="space-y-3">
                  {["Privacidade", "Termos", "Cookies", "Licenças"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-white/40 hover:text-hero-orange text-sm transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
              style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-white/30 text-sm">
                &copy; 2026 FinancialHero. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-hero-success pulse-dot" />
                <span
                  className="text-white/40 text-xs"
                  style={{ fontFamily: "var(--font-fira), monospace" }}
                >
                  Sistema Operacional
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
