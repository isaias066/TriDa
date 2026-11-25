import React from "react";
import {
  TransactionFilters,
  TipoMovimiento,
  NivelRiesgo,
} from "@/types/Transaction";
import { Category } from "@/types/Category";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Filter, RotateCcw } from "lucide-react";

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  categories: Category[];
  onFilterChange: (filters: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

export const TransactionFiltersBar: React.FC<TransactionFiltersBarProps> = ({
  filters,
  categories,
  onFilterChange,
  onReset,
}) => {
  const tipoOptions = [
    { value: "", label: "Todos los tipos" },
    { value: "INGRESO", label: "Ingresos" },
    { value: "GASTO", label: "Gastos" },
    { value: "AHORRO", label: "Ahorro" },
    { value: "TRANSFERENCIA", label: "Transferencias" },
  ];

  const riesgoOptions = [
    { value: "", label: "Todos los niveles" },
    { value: "BAJO", label: "Riesgo Bajo" },
    { value: "MEDIO", label: "Riesgo Medio" },
    { value: "ALTO", label: "Riesgo Alto" },
    { value: "CRITICO", label: "Riesgo Crítico" },
  ];

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((c) => ({
      value: String(c.id_categoria),
      label: c.nombre,
    })),
  ];

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium text-[var(--color-text-subtle)]">
        <Filter className="w-4 h-4 text-[var(--color-primary-500)]" />
        <span>Filtros de Búsqueda</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.tipo_movimiento || ""}
          onChange={(e) =>
            onFilterChange({
              tipo_movimiento: (e.target.value as TipoMovimiento) || undefined,
            })
          }
          options={tipoOptions}
        />

        <Select
          value={filters.id_categoria ? String(filters.id_categoria) : ""}
          onChange={(e) =>
            onFilterChange({
              id_categoria: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          options={categoryOptions}
        />

        <Select
          value={filters.nivel_riesgo || ""}
          onChange={(e) =>
            onFilterChange({
              nivel_riesgo: (e.target.value as NivelRiesgo) || undefined,
            })
          }
          options={riesgoOptions}
        />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-sm"
            onClick={onReset}
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
