import { BarChart3, Store } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useReports } from "@/hooks/useReports";
import { ReportFiltersBar } from "@/components/reports/ReportFiltersBar";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { CategoryBreakdownTable } from "@/components/reports/CategoryBreakdownTable";
import { formatCurrency } from "@/utils/Formatters";

export function ReportsPage() {
  const {
    reportData,
    loading,
    exporting,
    filters,
    setPeriodType,
    setCustomDateRange,
    exportReport,
  } = useReports({ tipo_periodo: "MES_ACTUAL" });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Reportes Financieros
            </h1>
            <span className="p-1 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <BarChart3 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Análisis consolidado de ingresos, egresos y comportamiento
            comercial.
          </p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <ReportFiltersBar
        currentPeriod={filters.tipo_periodo ?? "MES_ACTUAL"}
        fechaInicio={filters.fecha_inicio}
        fechaFin={filters.fecha_fin}
        exporting={exporting}
        canExport={
          Boolean(reportData) &&
          (filters.tipo_periodo !== "PERSONALIZADO" ||
            Boolean(
              filters.fecha_inicio &&
                filters.fecha_fin &&
                filters.fecha_inicio <= filters.fecha_fin,
            ))
        }
        onPeriodChange={setPeriodType}
        onCustomDateRangeChange={setCustomDateRange}
        onExport={exportReport}
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {reportData?.transacciones_truncadas && (
            <p
              role="status"
              className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-text-primary"
            >
              El reporte contiene las primeras 5,000 de{" "}
              {reportData.total_transacciones.toLocaleString("es-CO")}{" "}
              transacciones del período; la exportación está truncada.
            </p>
          )}

          {/* Tarjetas Ejecutivas */}
          <ReportSummaryCards summary={reportData?.resumen} />

          {/* Grilla: Categorías y Comercios */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <CategoryBreakdownTable
                expenseCategories={reportData?.gastos_por_categoria || []}
                incomeCategories={reportData?.ingresos_por_categoria || []}
              />
            </div>
            <section className="lg:col-span-5 rounded-xl border border-border bg-surface p-4">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
                <Store className="h-4 w-4" />
                Comercios principales
              </h2>
              {reportData?.top_comercios.length ? (
                <ul className="space-y-3">
                  {reportData.top_comercios.map((merchant) => (
                    <li
                      key={merchant.comercio}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-text-secondary">
                        {merchant.comercio}
                      </span>
                      <span className="shrink-0 text-right font-medium text-text-primary">
                        {formatCurrency(merchant.total)} ·{" "}
                        {merchant.porcentaje.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-muted">
                  No hay comercios para este período.
                </p>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
