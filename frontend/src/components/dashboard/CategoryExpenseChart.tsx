import React from "react";
import { CategoryExpense } from "@/types/Dashboard";
import { formatCurrency } from "@/utils/Formatters";
import { PieChart } from "lucide-react";

interface CategoryExpenseChartProps {
  categories: CategoryExpense[];
}

export const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({
  categories,
}) => {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
        <PieChart className="w-4 h-4 text-[var(--color-primary-500)]" />
        <span>Gastos por Categoría</span>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-[var(--color-text-subtle)] text-center py-8">
          No hay gastos registrados para generar el desglose por categoría.
        </p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id_categoria ?? "sin-categoria"}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--color-text-primary)]">
                  {cat.nombre_categoria}
                </span>
                <span className="font-mono text-[var(--color-text-subtle)]">
                  {formatCurrency(cat.total)} ({cat.porcentaje.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--color-bg-surface-hover)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-primary-500)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(cat.porcentaje, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
