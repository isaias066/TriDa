import React, { useState } from "react";
import { Edit2, Plus, RefreshCw, Tag, Trash2 } from "lucide-react";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCategories } from "@/hooks/useCategories";
import {
  Category,
  CreateCategoryPayload,
  TipoCategoria,
} from "@/types/Category";

const categoryTypeLabel: Record<TipoCategoria, string> = {
  GASTO: "Gasto",
  INGRESO: "Ingreso",
  AHORRO: "Ahorro",
};

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const personalCategories = categories.filter(
    (category) => category.es_personalizada ?? category.id_usuario != null,
  );
  const systemCategories = categories.filter(
    (category) => !(category.es_personalizada ?? category.id_usuario != null),
  );

  const openCreateForm = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSave = async (
    payload: CreateCategoryPayload,
  ): Promise<boolean> => {
    if (editingCategory) {
      return Boolean(
        await updateCategory(editingCategory.id_categoria, payload),
      );
    }
    return Boolean(await createCategory(payload));
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    const deleted = await deleteCategory(deletingCategory.id_categoria);
    if (deleted) setDeletingCategory(null);
  };

  const handleReactivate = async (category: Category) => {
    await updateCategory(category.id_categoria, { estado: true });
  };

  const renderCategory = (category: Category, isPersonal: boolean) => (
    <Card
      key={category.id_categoria}
      className="flex items-center justify-between gap-4 p-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            color: category.color ?? "#8b5cf6",
            backgroundColor: `${category.color ?? "#8b5cf6"}20`,
          }}
        >
          <Tag className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-text-primary">
            {category.nombre}
          </p>
          <p className="text-xs text-text-muted">
            {categoryTypeLabel[category.tipo]}
            {!isPersonal && " · Predeterminada"}
          </p>
        </div>
      </div>
      {isPersonal && (
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Editar ${category.nombre}`}
            onClick={() => openEditForm(category)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          {category.estado === false ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Reactivar ${category.nombre}`}
              onClick={() => void handleReactivate(category)}
            >
              <RefreshCw className="h-4 w-4 text-income" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Desactivar ${category.nombre}`}
              onClick={() => setDeletingCategory(category)}
            >
              <Trash2 className="h-4 w-4 text-expense" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Categorías</h1>
          <p className="mt-1 text-sm text-text-muted">
            Administra las categorías que utilizas en tus movimientos.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateForm}
          icon={<Plus size={16} />}
        >
          Nueva categoría
        </Button>
      </header>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-text-muted">
          Cargando categorías...
        </p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary">
              Mis categorías
            </h2>
            {personalCategories.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {personalCategories.map((category) =>
                  renderCategory(category, true),
                )}
              </div>
            ) : (
              <Card className="p-5 text-sm text-text-muted">
                Aún no has creado categorías personalizadas.
              </Card>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-text-primary">
              Categorías predeterminadas
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {systemCategories.length ? (
                systemCategories.map((category) =>
                  renderCategory(category, false),
                )
              ) : (
                <Card className="p-5 text-sm text-text-muted">
                  No hay categorías predeterminadas disponibles.
                </Card>
              )}
            </div>
          </section>
        </div>
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        category={editingCategory}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Desactivar categoría"
        description={`¿Quieres desactivar «${deletingCategory?.nombre ?? ""}»? No podrás asignarla a movimientos nuevos.`}
        confirmText="Desactivar"
      />
    </div>
  );
};
