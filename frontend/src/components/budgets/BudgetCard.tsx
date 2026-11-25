import { Edit2, Trash2, AlertTriangle, Tag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/utils/Formatters";
import type { Budget } from "@/types";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const montoGastado = budget.gastado;
  const montoLimite = budget.limite_mensual;
  const porcentaje = montoLimite > 0 ? (montoGastado / montoLimite) * 100 : 0;
  const alertaPorcentaje = 80;

  const isExceeded = porcentaje >= 100;
  const isNearLimit = porcentaje >= alertaPorcentaje && !isExceeded;
  const restante = Math.max(0, montoLimite - montoGastado);
  const progreso = Math.max(0, Math.min(porcentaje, 100));

  const getProgressColor = () => {
    if (isExceeded) return "bg-[var(--color-danger)]";
    if (isNearLimit) return "bg-[var(--color-warning)]";
    return "bg-[var(--color-success)]";
  };

  return (
    <Card className="p-5 border-[var(--color-border)] bg-[var(--color-bg-card)] flex flex-col justify-between hover:border-primary/40 transition-colors">
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shadow-sm"
              style={{
                backgroundColor:
                  budget.categoria?.color || "var(--color-primary)",
              }}
            >
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                {budget.categoria?.nombre || "Categoría no asignada"}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] capitalize">
                {String(budget.mes).padStart(2, "0")}/{budget.anio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(budget)}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
              title="Editar presupuesto"
              aria-label={`Editar presupuesto de ${budget.categoria?.nombre || "categoría no asignada"}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(budget)}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)] transition-colors"
              title="Eliminar presupuesto"
              aria-label={`Eliminar presupuesto de ${budget.categoria?.nombre || "categoría no asignada"}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Estado de alerta */}
        {isExceeded && (
          <div className="mb-3">
            <Badge
              variant="danger"
              className="flex items-center gap-1 w-fit text-xs"
            >
              <AlertTriangle className="w-3 h-3" />
              Límite Excedido ({porcentaje.toFixed(0)}%)
            </Badge>
          </div>
        )}
        {isNearLimit && (
          <div className="mb-3">
            <Badge
              variant="warning"
              className="flex items-center gap-1 w-fit text-xs"
            >
              <AlertTriangle className="w-3 h-3" />
              Cerca del límite (80%)
            </Badge>
          </div>
        )}

        {/* Montos */}
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <span className="text-xs text-[var(--color-text-muted)]">
              Gastado
            </span>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {formatCurrency(montoGastado)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[var(--color-text-muted)]">
              Límite
            </span>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              {formatCurrency(montoLimite)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div
          className="w-full bg-[var(--color-bg-secondary)] h-2.5 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-label={`Presupuesto de ${budget.categoria?.nombre || "categoría no asignada"}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso}
          aria-valuetext={`${porcentaje.toFixed(1)}%`}
        >
          <div
            className={`h-full transition-all duration-300 rounded-full ${getProgressColor()}`}
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Pie de tarjeta */}
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
        <span>
          Restante:{" "}
          <strong className="text-[var(--color-text-primary)]">
            {formatCurrency(restante)}
          </strong>
        </span>
        <span>{porcentaje.toFixed(1)}%</span>
      </div>
    </Card>
  );
}
