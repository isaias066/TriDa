import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useSavings } from "@/hooks/useSavings";
import { SavingsSummaryCards } from "@/components/savings/SavingsSummaryCards";
import { SavingsGoalCard } from "@/components/savings/SavingsGoalCards";
import { NewSavingsGoalModal } from "@/components/savings/NewSavingsGoalModal";
import { EditSavingsGoalModal } from "@/components/savings/EditSavingsGoalModal";
import { ContributeSavingsModal } from "@/components/savings/ContributeSavingsModal";
import type { SavingsGoal, EstadoMeta } from "@/types";

export function SavingsPage() {
  const [searchParams] = useSearchParams();
  const requestedEstado = searchParams.get("estado");
  const initialEstado: EstadoMeta | undefined =
    requestedEstado === "ACTIVA" || requestedEstado === "COMPLETADA"
      ? requestedEstado
      : undefined;
  const {
    goals,
    summary,
    loading,
    selectedEstado,
    setSelectedEstado,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
  } = useSavings(initialEstado);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(
    null,
  );
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  const statusOptions = [
    { value: "", label: "Todas las metas" },
    { value: "ACTIVA", label: "Activas" },
    { value: "COMPLETADA", label: "Completadas" },
    { value: "PAUSADA", label: "Pausadas" },
    { value: "CANCELADA", label: "Canceladas" },
  ];

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as EstadoMeta | "";
    setSelectedEstado(val ? val : undefined);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    await deleteGoal(deletingGoal.id_meta);
    setDeletingGoal(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Metas de Ahorro
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Planea y alcanza tus objetivos financieros paso a paso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select
              value={selectedEstado || ""}
              onChange={handleStatusChange}
              options={statusOptions}
            />
          </div>

          <Button
            variant="primary"
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Meta</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <SavingsSummaryCards summary={summary} />

      {/* Contenido Principal */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] mx-auto flex items-center justify-center mb-4">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
            No tienes metas de ahorro registradas
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto mb-5">
            Crea tu primera meta (por ejemplo: Fondo de Emergencia o Viaje) y
            realiza aportes periódicos para alcanzarla.
          </p>
          <Button variant="primary" onClick={() => setIsNewModalOpen(true)}>
            Crear Primera Meta
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id_meta}
              goal={goal}
              onContribute={(g) => setContributingGoal(g)}
              onEdit={(g) => setEditingGoal(g)}
              onDelete={(g) => setDeletingGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <NewSavingsGoalModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={createGoal}
      />

      <EditSavingsGoalModal
        goal={editingGoal}
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSubmit={updateGoal}
      />

      <ContributeSavingsModal
        goal={contributingGoal}
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        onSubmit={addContribution}
      />

      <ConfirmDialog
        isOpen={!!deletingGoal}
        title="Eliminar Meta de Ahorro"
        description={`¿Estás seguro de que deseas eliminar la meta "${deletingGoal?.nombre}"? Esta acción no se puede revertir.`}
        confirmText="Eliminar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingGoal(null)}
      />
    </div>
  );
}
