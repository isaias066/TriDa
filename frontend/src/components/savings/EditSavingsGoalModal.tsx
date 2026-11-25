import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  SavingsGoal,
  UpdateSavingsGoalPayload,
  EstadoMeta,
} from "@/types";
import { dateOnlyInBogota } from "@/utils/Date";

interface EditSavingsGoalModalProps {
  goal: SavingsGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: number, payload: UpdateSavingsGoalPayload) => Promise<boolean>;
}

export function EditSavingsGoalModal({
  goal,
  isOpen,
  onClose,
  onSubmit,
}: EditSavingsGoalModalProps) {
  const [nombre, setNombre] = useState<string>("");
  const [montoObjetivo, setMontoObjetivo] = useState<string>("");
  const [fechaLimite, setFechaLimite] = useState<string>("");
  const [estado, setEstado] = useState<EstadoMeta>("ACTIVA");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const today = dateOnlyInBogota(new Date());

  useEffect(() => {
    if (goal) {
      setNombre(goal.nombre);
      setMontoObjetivo(goal.monto_objetivo.toString());
      setFechaLimite(goal.fecha_limite ? goal.fecha_limite.split("T")[0] : "");
      setEstado(goal.estado);
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal || !nombre.trim() || !montoObjetivo) return;

    setSubmitting(true);
    const success = await onSubmit(goal.id_meta, {
      nombre: nombre.trim(),
      monto_objetivo: Number(montoObjetivo),
      fecha_limite: fechaLimite || null,
      estado,
    });
    setSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const estadoOptions = [
    { value: "ACTIVA", label: "Activa" },
    { value: "COMPLETADA", label: "Completada" },
    { value: "PAUSADA", label: "Pausada" },
    { value: "CANCELADA", label: "Cancelada" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isSubmitting={submitting}
      title={`Editar Meta: ${goal?.nombre || ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la Meta *"
          type="text"
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
              value={montoObjetivo}
              onChange={(e) => setMontoObjetivo(e.target.value)}
              required
            />
          </div>

          <div>
            <Select
              label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoMeta)}
              options={estadoOptions}
            />
          </div>
        </div>

        <div>
          <Input
            label="Fecha Límite"
            type="date"
            min={today}
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
          <p className="mt-1 text-xs text-text-muted">
            Las nuevas fechas límite deben ser hoy o posteriores.
          </p>
        </div>

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
