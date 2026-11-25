import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import type { CreateBudgetPayload } from "@/types";

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateBudgetPayload) => Promise<boolean>;
  currentMonth: number;
  currentYear: number;
}

export function NewBudgetModal({
  isOpen,
  onClose,
  onSubmit,
  currentMonth,
  currentYear,
}: NewBudgetModalProps) {
  const { categories } = useCategories({ enabled: isOpen });
  const [idCategoria, setIdCategoria] = useState<string>("");
  const [montoLimite, setMontoLimite] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleClose = () => {
    setIdCategoria("");
    setMontoLimite("");
    onClose();
  };

  const expenseCategories = categories.filter((c) => c.tipo === "GASTO");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCategoria || !montoLimite) return;

    setSubmitting(true);
    const success = await onSubmit({
      id_categoria: Number(idCategoria),
      limite_mensual: Number(montoLimite),
      mes: currentMonth,
      anio: currentYear,
    });
    setSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  const categoryOptions = [
    { value: "", label: "Selecciona una categoría" },
    ...expenseCategories.map((c) => ({
      value: c.id_categoria.toString(),
      label: c.nombre,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Presupuesto"
      isSubmitting={submitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Categoría de Gasto *"
          value={idCategoria}
          onChange={(e) => setIdCategoria(e.target.value)}
          options={categoryOptions}
          required
        />

        <Input
          label="Monto Límite (COP) *"
          type="number"
          min="1"
          step="0.01"
          placeholder="Ej: 500000"
          value={montoLimite}
          onChange={(e) => setMontoLimite(e.target.value)}
          required
        />

        <p className="text-xs text-[var(--color-text-muted)]">
          Este presupuesto aplica al mes y año seleccionados en la pantalla.
        </p>

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
            {submitting ? "Creando..." : "Crear Presupuesto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
