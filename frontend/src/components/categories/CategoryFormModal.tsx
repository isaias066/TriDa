import React, { useEffect, useState } from "react";
import {
  Category,
  CreateCategoryPayload,
  TipoCategoria,
} from "@/types/Category";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface CategoryFormModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryPayload) => Promise<boolean>;
}

const categoryTypes: { value: TipoCategoria; label: string }[] = [
  { value: "GASTO", label: "Gasto" },
  { value: "INGRESO", label: "Ingreso" },
  { value: "AHORRO", label: "Ahorro" },
];

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  category,
  onClose,
  onSubmit,
}) => {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCategoria>("GASTO");
  const [color, setColor] = useState("#8b5cf6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNombre(category?.nombre ?? "");
    setTipo(category?.tipo ?? "GASTO");
    setColor(category?.color ?? "#8b5cf6");
  }, [category, isOpen]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const succeeded = await onSubmit({
        nombre: nombre.trim(),
        tipo,
        color,
      });
      if (succeeded) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      isSubmitting={isSubmitting}
      title={category ? "Editar categoría" : "Nueva categoría"}
      description="Las categorías personalizadas pueden asignarse a tus movimientos."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          minLength={2}
          maxLength={80}
          required
        />

        <div>
          <label
            htmlFor="category-type"
            className="mb-1 block text-sm font-medium text-text-secondary"
          >
            Tipo
          </label>
          <select
            id="category-type"
            value={tipo}
            onChange={(event) => setTipo(event.target.value as TipoCategoria)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            {categoryTypes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
            <label
              htmlFor="category-color"
              className="mb-1 block text-sm font-medium text-text-secondary"
            >
              Color
            </label>
            <input
              id="category-color"
              type="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="h-10 w-full cursor-pointer rounded-lg border border-border bg-surface p-1"
            />
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
