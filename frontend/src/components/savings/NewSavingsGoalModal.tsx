import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { CreateSavingsGoalPayload } from "@/types";
import { dateOnlyInBogota } from "@/utils/Date";

interface NewSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateSavingsGoalPayload) => Promise<boolean>;
}

export function NewSavingsGoalModal({
  isOpen,
  onClose,
  onSubmit,
}: NewSavingsGoalModalProps) {
  const [nombre, setNombre] = useState<string>("");
  const [montoObjetivo, setMontoObjetivo] = useState<string>("");
  const [montoActual, setMontoActual] = useState<string>("");
  const [fechaLimite, setFechaLimite] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const today = dateOnlyInBogota(new Date());

  const handleClose = () => {
    setNombre("");
    setMontoObjetivo("");
    setMontoActual("");
    setFechaLimite("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !montoObjetivo) return;

    setSubmitting(true);
    const success = await onSubmit({
      nombre: nombre.trim(),
      monto_objetivo: Number(montoObjetivo),
      monto_actual: montoActual ? Number(montoActual) : undefined,
      fecha_limite: fechaLimite || undefined,
    });
    setSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Meta de Ahorro"
      isSubmitting={submitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la Meta *"
          type="text"
          placeholder="Ej: Fondo de Emergencia, Vacaciones..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Monto Objetivo (COP) *"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ej: 3000000"
              value={montoObjetivo}
              onChange={(e) => setMontoObjetivo(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              label="Ahorro Inicial (Opcional)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={montoActual}
              onChange={(e) => setMontoActual(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Fecha Límite (Opcional)"
              type="date"
              min={today}
              value={fechaLimite}
              onChange={(e) => setFechaLimite(e.target.value)}
            />
            <p className="mt-1 text-xs text-text-muted">
              Elige hoy o una fecha futura para completar tu objetivo.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Creando..." : "Crear Meta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
