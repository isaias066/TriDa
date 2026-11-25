import { Target, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/Formatters";
import type { SavingsSummary } from "@/types";

interface SavingsSummaryCardsProps {
  summary: SavingsSummary | null;
}

export function SavingsSummaryCards({ summary }: SavingsSummaryCardsProps) {
  const totalAhorrado = summary?.total_ahorrado ?? 0;
  const totalObjetivo = summary?.total_objetivo ?? 0;
  const metasActivas = summary?.metas_activas ?? 0;
  const metasCompletadas = summary?.metas_completadas ?? 0;
  const porcentajeGeneral =
    summary?.porcentaje_general ??
    (totalObjetivo > 0 ? (totalAhorrado / totalObjetivo) * 100 : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Ahorrado */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Total Ahorrado
          </p>
          <p className="text-xl font-bold text-[var(--color-success)] mt-1">
            {formatCurrency(totalAhorrado)}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            {porcentajeGeneral.toFixed(1)}% del objetivo total
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center">
          <TrendingUp className="w-5 h-5" />
        </div>
      </Card>

      {/* Meta Global */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Objetivo Total
          </p>
          <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            {formatCurrency(totalObjetivo)}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            Sumatoria de metas
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <Target className="w-5 h-5" />
        </div>
      </Card>

      {/* Metas Activas */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Metas Activas
          </p>
          <p className="text-xl font-bold text-[var(--color-primary)] mt-1">
            {metasActivas}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            En progreso
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
          <Clock className="w-5 h-5" />
        </div>
      </Card>

      {/* Metas Completadas */}
      <Card className="p-4 flex items-center justify-between border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Completadas
          </p>
          <p className="text-xl font-bold text-[var(--color-success)] mt-1">
            {metasCompletadas}
          </p>
          <span className="text-xs text-[var(--color-text-muted)]">
            Objetivos alcanzados
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center">
          <CheckCircle className="w-5 h-5" />
        </div>
      </Card>
    </div>
  );
}
