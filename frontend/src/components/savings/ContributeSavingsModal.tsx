import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/utils/Formatters";
import { useToast } from "@/components/ui/Toast";
import type { SavingsGoal, CreateContributionPayload } from "@/types";

interface ContributeSavingsModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateContributionPayload) => Promise<boolean>;
}

export function ContributeSavingsModal({
  goal,
  isOpen,
  onClose,
  onSubmit,
}: ContributeSavingsModalProps) {
  const { showToast } = useToast();
  const [monto, setMonto] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!goal) return null;

  const restante = Math.max(0, goal.monto_objetivo - goal.monto_actual);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || Number(monto) < 1000) {
      showToast({
        type: "error",
        title: "Monto insuficiente",
        message: "El aporte mínimo permitido es de 1.000.",
      });
      return;
    }

    setSubmitting(true);
    const success = await onSubmit({
      id_meta: goal.id_meta,
      monto: Number(monto),
    });
    setSubmitting(false);

    if (success) {
      setMonto("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isSubmitting={submitting}
      title={`Aportar a: ${goal.nombre}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info actual */}
        <div className="bg-[var(--color-bg-secondary)] p-3 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span className="text-[var(--color-text-muted)]">
              Ahorrado hasta ahora:
            </span>
            <p className="font-bold text-[var(--color-text-primary)] text-sm">
              {formatCurrency(goal.monto_actual)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[var(--color-text-muted)]">
              Falta para el objetivo:
            </span>
            <p className="font-bold text-[var(--color-primary)] text-sm">
              {formatCurrency(restante)}
            </p>
          </div>
        </div>

        <Input
          label="Monto a Aportar (COP) *"
          type="number"
          min="1000"
          step="0.01"
          placeholder="Ej: 50000"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
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
            {submitting ? "Aportando..." : "Confirmar Aporte"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
