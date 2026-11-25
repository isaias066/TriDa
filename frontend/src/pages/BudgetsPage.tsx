import { useState } from "react";
import { Plus, PiggyBank, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useBudgets } from "@/hooks/useBudgets";
import { BudgetSummaryCards } from "@/components/budgets/BudgetSummaryCards";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { NewBudgetModal } from "@/components/budgets/NewBudgetModal";
import { EditBudgetModal } from "@/components/budgets/EditBudgetModal";
import type { Budget } from "@/types";
import { dateOnlyInBogota } from "@/utils/Date";

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const MIN_BUDGET_YEAR = 2020;
const MAX_BUDGET_YEAR = 2100;

export function BudgetsPage() {
  const todayInBogota = dateOnlyInBogota(new Date());
  const [currentYear, currentMonth] = todayInBogota.split("-").map(Number);

  const {
    budgets,
    summary,
    loading,
    filters,
    setFilters,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets({ mes: currentMonth, anio: currentYear });

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);

  const monthOptions = MONTH_NAMES.map((name, index) => ({
    value: (index + 1).toString(),
    label: name,
  }));

  const lastBudgetYear = Math.min(
    MAX_BUDGET_YEAR,
    Math.max(currentYear + 1, MIN_BUDGET_YEAR),
  );
  const yearOptions = Array.from(
    { length: lastBudgetYear - MIN_BUDGET_YEAR + 1 },
    (_, index) => MIN_BUDGET_YEAR + index,
  ).map((year) => ({ value: year.toString(), label: year.toString() }));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, mes: Number(e.target.value) }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({ ...prev, anio: Number(e.target.value) }));
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return;
    await deleteBudget(deletingBudget.id_presupuesto);
    setDeletingBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Presupuestos
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Define límites de gasto por categoría y mantén tus finanzas bajo
            control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl px-2 py-1">
            <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
            <Select
              value={(filters.mes ?? currentMonth).toString()}
              onChange={handleMonthChange}
              options={monthOptions}
              className="border-none bg-transparent py-1 text-xs font-medium focus:ring-0"
            />
            <Select
              value={(filters.anio ?? currentYear).toString()}
              onChange={handleYearChange}
              options={yearOptions}
              className="border-none bg-transparent py-1 text-xs font-medium focus:ring-0"
            />
          </div>

          <Button
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Presupuesto</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <BudgetSummaryCards summary={summary} />

      {/* Contenido Principal */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] mx-auto flex items-center justify-center mb-4">
            <PiggyBank className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
            No tienes presupuestos para este periodo
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-5">
            Crea tu primer presupuesto para recibir alertas cuando estés cerca
            de superar tus límites de gasto.
          </p>
          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            Crear Presupuesto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id_presupuesto}
              budget={budget}
              onEdit={(b) => setEditingBudget(b)}
              onDelete={(b) => setDeletingBudget(b)}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <NewBudgetModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={createBudget}
        currentMonth={filters.mes ?? currentMonth}
        currentYear={filters.anio ?? currentYear}
      />

      <EditBudgetModal
        budget={editingBudget}
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        onSubmit={updateBudget}
      />

      <ConfirmDialog
        isOpen={!!deletingBudget}
        title="Eliminar Presupuesto"
        description={`¿Estás seguro de que deseas eliminar el presupuesto de "${deletingBudget?.categoria?.nombre || "esta categoría"}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingBudget(null)}
      />
    </div>
  );
}
