import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMapTransactions } from "@/hooks/useMapTransactions";
import { MapSummaryCards } from "@/components/map/MapSummaryCards";
import { MapFiltersBar } from "@/components/map/MapFiltersBar";
import { GeoTransactionsList } from "@/components/map/GeoTransactionsList";

const InteractiveExpenseMap = lazy(() =>
  import("@/components/map/InteractiveExpenseMap").then((module) => ({
    default: module.InteractiveExpenseMap,
  })),
);

export function MapPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    transactions,
    total,
    truncated,
    summary,
    selectedTransaction,
    setSelectedTransaction,
    loading,
    filters,
    updateFilters,
    resetFilters,
  } = useMapTransactions();
  const visibleTransactions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) =>
      [
        transaction.comercio,
        transaction.ciudad,
        transaction.pais,
        transaction.nombre_categoria,
        transaction.nombre_cuenta,
      ]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(query) ?? false),
    );
  }, [searchTerm, transactions]);

  useEffect(() => {
    setSelectedTransaction(
      (current) =>
        visibleTransactions.find(
          (transaction) =>
            transaction.id_transaccion === current?.id_transaccion,
        ) ??
        visibleTransactions[0] ??
        null,
    );
  }, [setSelectedTransaction, visibleTransactions]);

  const handleResetFilters = () => {
    resetFilters();
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Mapa de Gastos
            </h1>
            <span className="p-1 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Ubicación geográfica de consumos en comercios y detección de
            anomalías por localización.
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <MapSummaryCards summary={summary} />

      {/* Barra de Filtros */}
      <MapFiltersBar
        filters={filters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* Contenido Principal: Mapa + Lista */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : visibleTransactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-8 w-8 text-text-muted" />
          <h2 className="text-base font-semibold text-text-primary">
            No hay ubicaciones que coincidan
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Prueba con otro término o modifica los filtros del mapa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {(truncated || searchTerm.trim()) && (
            <p className="lg:col-span-12 text-xs text-[var(--color-text-muted)]">
              {searchTerm.trim()
                ? `${visibleTransactions.length} coincidencias en las ubicaciones cargadas.`
                : `Se muestran ${transactions.length} de ${total} ubicaciones. Ajusta los filtros para ver un conjunto más específico.`}
            </p>
          )}
          <div className="lg:col-span-8">
            <Suspense
              fallback={
                <div className="flex h-[560px] items-center justify-center">
                  <Spinner size="lg" />
                </div>
              }
            >
              <InteractiveExpenseMap
                transactions={visibleTransactions}
                selectedTransaction={selectedTransaction}
                onSelectTransaction={setSelectedTransaction}
              />
            </Suspense>
          </div>

          <div className="lg:col-span-4">
            <GeoTransactionsList
              transactions={visibleTransactions}
              selectedTransaction={selectedTransaction}
              onSelectTransaction={setSelectedTransaction}
            />
          </div>
        </div>
      )}
    </div>
  );
}
