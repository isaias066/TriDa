import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/utils/Formatters";
import type { CategoryReportItem } from "@/types";

interface CategoryBreakdownTableProps {
  expenseCategories: CategoryReportItem[];
  incomeCategories: CategoryReportItem[];
}

export function CategoryBreakdownTable({
  expenseCategories,
  incomeCategories,
}: CategoryBreakdownTableProps) {
  const [activeTab, setActiveTab] = useState<"GASTO" | "INGRESO">("GASTO");

  const categories =
    activeTab === "GASTO" ? expenseCategories : incomeCategories;

  return (
    <Card className="p-5 border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
            Distribución por Categorías
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Volumen acumulado y porcentaje sobre el total
          </p>
        </div>

        {/* Selector de Pestaña */}
        <div className="flex items-center gap-1 bg-[var(--color-bg-secondary)] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("GASTO")}
            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
              activeTab === "GASTO"
                ? "bg-[var(--color-bg-card)] text-[var(--color-danger)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Gastos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INGRESO")}
            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
              activeTab === "INGRESO"
                ? "bg-[var(--color-bg-card)] text-[var(--color-success)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Ingresos
          </button>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
          No hay movimientos registrados para este tipo en el periodo.
        </p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id_categoria ?? "sin-categoria"}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: cat.color || "var(--color-primary)",
                    }}
                  />
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {cat.nombre}
                  </span>
                  <span className="text-2xs text-[var(--color-text-muted)]">
                    ({cat.numero_transacciones} mov.)
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {formatCurrency(cat.total)}
                  </span>
                  <span className="ml-2 text-2xs text-[var(--color-text-muted)]">
                    {cat.porcentaje.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-[var(--color-bg-secondary)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, cat.porcentaje)}%`,
                    backgroundColor: cat.color || "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
