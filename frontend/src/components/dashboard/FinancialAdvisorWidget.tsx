import React from "react";
import { FinancialAdvice } from "@/types/Dashboard";
import { AlertTriangle, Check, Lightbulb } from "lucide-react";

interface FinancialAdvisorWidgetProps {
  recommendations: FinancialAdvice[];
  onMarkRead: (id: number) => void;
}

export const FinancialAdvisorWidget: React.FC<FinancialAdvisorWidgetProps> = ({
  recommendations,
  onMarkRead,
}) => {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-[var(--color-primary-500)]">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Consejos financieros
          </h3>
          <p className="text-xs text-[var(--color-text-subtle)]">
            Avisos generados por tus presupuestos
          </p>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-4 rounded-lg bg-[var(--color-bg-surface-hover)] text-xs text-[var(--color-text-subtle)] text-center">
          No tienes avisos de presupuesto pendientes.
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id_consejo}
              className="p-3.5 rounded-lg bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] flex items-start gap-3"
            >
              {rec.prioridad === "ALTA" ? (
                <AlertTriangle className="w-4 h-4 text-risk-high shrink-0 mt-0.5" />
              ) : (
                <Lightbulb className="w-4 h-4 text-[var(--color-primary-500)] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--color-text-primary)]">
                      {rec.titulo}
                    </h4>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">
                      {rec.descripcion}
                    </p>
                    <span className="mt-1 inline-block text-2xs text-[var(--color-text-muted)]">
                      Prioridad {rec.prioridad.toLowerCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onMarkRead(rec.id_consejo)}
                    aria-label={`Marcar como leído: ${rec.titulo}`}
                    className="rounded-md p-1 text-[var(--color-text-muted)] hover:text-income focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
