"use client";

import { useEffect, useRef, useState } from "react";
import {
  Calculator,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  ArrowRight,
  Coffee,
  Smartphone,
  Car,
  Home,
  Plane,
  Laptop,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const presets = [
  { name: "Café", value: 8, icon: Coffee },
  { name: "Celular", value: 3500, icon: Smartphone },
  { name: "Carro Popular", value: 75000, icon: Car },
  { name: "Aluguel Mensal", value: 1500, icon: Home },
  { name: "Viagem", value: 5000, icon: Plane },
  { name: "Notebook", value: 4500, icon: Laptop },
];

// Dias úteis assumidos no mês para estimar o total mensal a partir das
// horas trabalhadas por dia.
const WORKING_DAYS_PER_MONTH = 22;

// Aceita formato BR ("1.500,50") ou simples ("1500.5").
function parseAmount(raw: string): number {
  if (!raw) return 0;
  const value = parseFloat(raw.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

const formatBRL = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Número no padrão BR, sem ".0" desnecessário (ex.: 1, 1,5, 3.299).
const formatNumber = (n: number) => {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded)
    ? rounded.toLocaleString("pt-BR")
    : rounded.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// Quantidade com singular/plural correto (ex.: "1 mês", "2 meses").
const formatQty = (n: number, singular: string, plural: string) =>
  `${formatNumber(n)} ${Math.round(n * 10) / 10 === 1 ? singular : plural}`;

const amountPattern = /^\d*(?:[.,]\d{0,2})?$/;
const intPattern = /^\d*$/;

export default function CalculadoraPage() {
  const { user } = useAuth();
  const [monthlySalaryInput, setMonthlySalaryInput] = useState("");
  const [itemValue, setItemValue] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("8");
  const prefilled = useRef(false);

  // Pré-preenche o salário a partir do perfil — apenas como ponto de partida.
  // O campo continua livre para simular outros cenários.
  useEffect(() => {
    if (prefilled.current || !user || user.wage <= 0) return;
    setMonthlySalaryInput(user.wage.toFixed(2).replace(".", ","));
    prefilled.current = true;
  }, [user]);

  const parsedDaily = parseInt(hoursPerDay, 10);
  const dailyHours = hoursPerDay.trim() === "" ? 8 : parsedDaily;
  const dailyValid = Number.isFinite(dailyHours) && dailyHours > 0;
  const dailyInvalid = hoursPerDay.trim() !== "" && !dailyValid;
  const monthlyHours = dailyValid ? dailyHours * WORKING_DAYS_PER_MONTH : 0;

  const monthlySalary = parseAmount(monthlySalaryInput);
  const value = parseAmount(itemValue);

  // Valor da hora derivado de salário ÷ horas mensais.
  const hourlyRate = monthlyHours > 0 ? monthlySalary / monthlyHours : 0;

  const hoursNeeded = hourlyRate > 0 ? value / hourlyRate : 0;
  const daysNeeded = dailyValid ? hoursNeeded / dailyHours : 0;
  const monthsNeeded = monthlyHours > 0 ? hoursNeeded / monthlyHours : 0;
  const yearsNeeded = monthsNeeded / 12;
  const percentOfSalary = monthlySalary > 0 ? (value / monthlySalary) * 100 : 0;

  const ready = monthlySalary > 0 && value > 0 && dailyValid;

  // Limiares em jornada: 1 dia = `dailyHours`, 1 mês = `monthlyHours`, 1 ano = 12 meses.
  const formatHours = (h: number) => {
    if (h < 1) {
      const minutes = Math.round(h * 60);
      return `${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
    }
    if (h < dailyHours) return formatQty(h, "hora", "horas");
    if (h < monthlyHours) return formatQty(daysNeeded, "dia", "dias");
    if (h < monthlyHours * 12) return formatQty(monthsNeeded, "mês", "meses");
    return formatQty(yearsNeeded, "ano", "anos");
  };

  const getImpact = () => {
    if (percentOfSalary === 0) return null;
    if (percentOfSalary <= 5) return { label: "Leve", color: "text-hero-success", barColor: "bg-hero-success", message: "Essa compra tem pouco impacto no seu orçamento. Pode ir sem medo, herói!" };
    if (percentOfSalary <= 20) return { label: "Moderado", color: "text-hero-warning", barColor: "bg-hero-warning", message: "Essa compra representa uma parte considerável do seu salário. Planeje-se!" };
    if (percentOfSalary <= 50) return { label: "Alto", color: "text-hero-orange", barColor: "bg-hero-orange", message: "Atenção! Essa compra consome boa parte do que você ganha. Vale a reflexão." };
    return { label: "Muito Alto", color: "text-hero-danger", barColor: "bg-hero-danger", message: "Cuidado, herói! Essa compra ultrapassa grande parte do seu rendimento mensal." };
  };

  const impact = getImpact();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Calculadora de Horas de Trabalho</h1>
        <p className="text-muted mt-1">
          Descubra quantas horas você precisa trabalhar para pagar uma compra
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Side */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-hero-orange" />
              Dados do Cálculo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Seu salário mensal (R$)
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 3.000,00"
                    className="input-field pl-12"
                    value={monthlySalaryInput}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === "" || amountPattern.test(next)) {
                        setMonthlySalaryInput(next);
                      }
                    }}
                  />
                </div>
                {user && user.wage > 0 && (
                  <p className="text-xs text-subtle mt-2">
                    Preenchido com o salário do seu perfil — ajuste para simular outros cenários.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Valor do item / compra (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ex: 150,00"
                    className="input-field pl-12"
                    value={itemValue}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === "" || amountPattern.test(next)) {
                        setItemValue(next);
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Horas trabalhadas por dia
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="8"
                    className="input-field pl-12"
                    style={dailyInvalid ? { borderColor: "#ff4444" } : undefined}
                    value={hoursPerDay}
                    onChange={(e) => {
                      const next = e.target.value;
                      if (next === "" || intPattern.test(next)) {
                        setHoursPerDay(next);
                      }
                    }}
                  />
                </div>
                {dailyInvalid ? (
                  <p className="text-xs text-hero-danger mt-2">
                    Informe um número de horas maior que zero.
                  </p>
                ) : (
                  <p className="text-xs text-subtle mt-2">
                    Estimativa com ~{WORKING_DAYS_PER_MONTH} dias úteis/mês ({monthlyHours}h)
                    {hourlyRate > 0 && ` · sua hora vale, em média, ~${formatBRL(hourlyRate)}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="card">
            <h3 className="text-lg font-bold text-primary mb-4">
              Simulação Rápida
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presets.map((preset) => {
                const isSelected = parseAmount(itemValue) === preset.value;
                return (
                  <button
                    key={preset.name}
                    onClick={() => setItemValue(preset.value.toString())}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      border: `1px solid ${isSelected ? "#FF7A00" : "var(--border)"}`,
                      backgroundColor: isSelected ? "rgba(255,122,0,0.05)" : "var(--bg-item)",
                    }}
                  >
                    <preset.icon className={`w-5 h-5 mb-2 ${isSelected ? "text-hero-orange" : "text-subtle"}`} />
                    <p className="text-sm font-medium text-primary">{preset.name}</p>
                    <p className="text-xs text-subtle">
                      R$ {preset.value.toLocaleString("pt-BR")}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Side */}
        <div className="space-y-6">
          {/* Main Result */}
          <div className="card bg-hero-gradient text-white">
            <div className="text-center py-4">
              <p className="text-sm opacity-80 mb-2">Você precisa trabalhar</p>
              <p className="text-5xl font-extrabold mb-2">
                {ready ? `≈ ${formatHours(hoursNeeded)}` : "--"}
              </p>
              <p className="text-sm opacity-80">
                para pagar{" "}
                {value > 0 ? formatBRL(value) : "este item"}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          {ready && (
            <>
              <div className="card">
                <h3 className="text-lg font-bold text-primary mb-4">Detalhamento</h3>
                <div className="space-y-4">
                  <DetailRow label="Horas necessárias" value={`≈ ${formatNumber(hoursNeeded)}h`} icon={<Clock className="w-4 h-4" />} />
                  <DetailRow label={`Dias de trabalho (${dailyHours}h/dia)`} value={`≈ ${formatQty(daysNeeded, "dia", "dias")}`} icon={<Calculator className="w-4 h-4" />} />
                  <DetailRow label="Valor médio da hora" value={`≈ ${formatBRL(hourlyRate)}`} icon={<DollarSign className="w-4 h-4" />} />
                  <DetailRow label="% do salário mensal" value={`${percentOfSalary.toFixed(1)}%`} icon={<ArrowRight className="w-4 h-4" />} />
                </div>
                <p className="text-xs text-subtle mt-4">
                  Horas e dias são estimativas (mês com ~{WORKING_DAYS_PER_MONTH} dias úteis). O % do salário é exato.
                </p>
              </div>

              {/* Impact */}
              {impact && (
                <div className="card" style={{ border: "2px solid var(--border)" }}>
                  <div className="flex items-start gap-4">
                    <Star className={`w-8 h-8 mt-0.5 ${impact.color}`} />
                    <div className="flex-1">
                      <p className={`font-bold ${impact.color}`}>Impacto {impact.label}</p>
                      <p className="text-sm text-muted mt-1">{impact.message}</p>
                      <div className="mt-3 w-full rounded-full h-3" style={{ backgroundColor: "var(--bg-hover)" }}>
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${impact.barColor}`}
                          style={{ width: `${Math.min(percentOfSalary, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-subtle mt-1">
                        {percentOfSalary.toFixed(1)}% do seu salário mensal
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty / invalid state */}
          {!ready && (
            <div className="card text-center py-8">
              <Calculator className="w-12 h-12 text-subtle mx-auto mb-4" />
              {dailyInvalid ? (
                <>
                  <p className="text-muted font-medium">Horas de trabalho inválidas</p>
                  <p className="text-subtle text-sm mt-1">
                    Informe quantas horas você trabalha por dia (maior que zero)
                  </p>
                </>
              ) : (
                <>
                  <p className="text-muted font-medium">
                    Preencha os campos <span className="lg:hidden">acima</span><span className="hidden lg:inline">ao lado</span>
                  </p>
                  <p className="text-subtle text-sm mt-1">
                    Informe seu salário e o valor da compra para ver o resultado
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}
