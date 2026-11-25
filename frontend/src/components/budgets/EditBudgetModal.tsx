import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Budget, UpdateBudgetPayload } from "@/types";

interface EditBudgetModalProps {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: UpdateBudgetPayload) => Promise<boolean>;
}

export function EditBudgetModal({
  budget,
  isOpen,
  onClose,
  onSubmit,
}: EditBudgetModalProps) {
  const [montoLimite, setMontoLimite] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (budget) {
      setMontoLimite(budget.limite_mensual.toString());
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !montoLimite) return;

    setSubmitting(true);
    const success = await onSubmit(budget.id_presupuesto, {
      limite_mensual: Number(montoLimite),
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isSubmitting={submitting}
      title={`Editar Presupuesto: ${budget?.categoria?.nombre || ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Monto Límite (COP) *"
          type="number"
          min="1"
          step="0.01"
          value={montoLimite}
          onChange={(e) => setMontoLimite(e.target.value)}
          required
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
