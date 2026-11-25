import {
  PiggyBank,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/Formatters";
import type { BudgetSummary } from "@/types";

interface BudgetSummaryCardsProps {
  summary: BudgetSummary | null;
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
  const totalPresupuestado = summary?.total_presupuestado ?? 0;
  const totalGastado = summary?.total_gastado ?? 0;
  const restante = Math.max(0, totalPresupuestado - totalGastado);
  const porcentajeTotal =
    summary?.porcentaje_total ??
    (totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0);
  const presupuestosEnAlerta = summary?.presupuestos_en_alerta ?? 0;
  const presupuestosExcedidos = summary?.presupuestos_excedidos ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Presupuestado */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total Presupuestado
          </p>
          <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            {formatCurrency(totalPresupuestado)}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            Límite mensual
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <PiggyBank className="w-5 h-5" />
        </div>
      </Card>

      {/* Total Gastado */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total gastado
          </p>
          <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            {formatCurrency(totalGastado)}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            {porcentajeTotal.toFixed(1)}% del límite
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center">
          <TrendingDown className="w-5 h-5" />
        </div>
      </Card>

      {/* Disponible / Restante */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Disponible Restante
          </p>
          <p className="text-xl font-bold text-[var(--color-success)] mt-1">
            {formatCurrency(restante)}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            Margen disponible
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </Card>

      {/* Alertas */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Alertas Activas
          </p>
          <p className="text-xl font-bold text-[var(--color-warning)] mt-1">
            {presupuestosEnAlerta + presupuestosExcedidos}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            {presupuestosExcedidos} excedidos, {presupuestosEnAlerta} en umbral
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
}
