import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import type { MapFilters, NivelRiesgo } from "@/types";

interface MapFiltersBarProps {
  filters: MapFilters;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (newFilters: Partial<MapFilters>) => void;
  onReset: () => void;
}

export function MapFiltersBar({
  filters,
  searchValue,
  onSearchChange,
  onFilterChange,
  onReset,
}: MapFiltersBarProps) {
  const riskOptions = [
    { value: "ALL", label: "Todos los riesgos" },
    { value: "BAJO", label: "Bajo" },
    { value: "MEDIO", label: "Medio" },
    { value: "ALTO", label: "Alto" },
    { value: "CRITICO", label: "Crítico" },
  ];

  const statusOptions = [
    { value: "", label: "Todos los estados" },
    { value: "PENDIENTE", label: "Pendiente" },
    { value: "CONFIRMADA", label: "Confirmada" },
    { value: "APROBADA", label: "Aprobada" },
    { value: "SOSPECHOSA", label: "Sospechosa" },
    { value: "RECHAZADA", label: "Rechazada" },
  ];

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <Filter className="h-4 w-4" />
          </span>
          Filtrar transacciones
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          title="Restablecer filtros"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Input
          type="search"
          aria-label="Buscar en el mapa"
          placeholder="Comercio, ciudad o categoría"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="text-sm"
        />
        <div>
          <Select
            value={filters.nivel_riesgo || "ALL"}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({
                nivel_riesgo: e.target.value
                  ? (e.target.value as NivelRiesgo)
                  : undefined,
              })
            }
            options={riskOptions}
            aria-label="Filtrar por nivel de riesgo"
          />
        </div>

        <div>
          <Select
            value={filters.estado || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({
                estado: (e.target.value as MapFilters["estado"]) || undefined,
              })
            }
            options={statusOptions}
            aria-label="Filtrar por estado"
          />
        </div>

        <Input
          type="date"
          aria-label="Fecha inicial"
          title="Desde la fecha"
          value={filters.fecha_inicio || ""}
          onChange={(e) =>
            onFilterChange({ fecha_inicio: e.target.value || undefined })
          }
          className="text-sm"
        />
        <Input
          type="date"
          aria-label="Fecha final"
          title="Hasta la fecha"
          value={filters.fecha_fin || ""}
          onChange={(e) =>
            onFilterChange({ fecha_fin: e.target.value || undefined })
          }
          className="text-sm"
        />
      </div>
    </section>
  );
}
