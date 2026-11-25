import { useState, type FormEvent } from "react";
import { ShieldAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { insightsApi } from "@/api/Insights";
import { useInsights } from "@/hooks/useInsights";
import { useSavings } from "@/hooks/useSavings";
import { formatCurrency } from "@/utils/Formatters";
import type { MessageScanResult } from "@/types";
import { Link } from "react-router-dom";

const periodOptions = [
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "180", label: "Últimos 180 días" },
  { value: "365", label: "Último año" },
];

export function InsightsPage() {
  const { overview, periodDays, setPeriodDays, loading } = useInsights();
  const { summary: savingsSummary, loading: savingsLoading } = useSavings();
  const summary = overview?.resumen;
  const scamReport = overview?.reporte_riesgo_estafa;
  const securityGuides = overview?.guias_seguridad ?? [];

  const [scanText, setScanText] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<MessageScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  async function handleScanSubmit(event: FormEvent) {
    event.preventDefault();
    if (!scanText.trim()) return;
    setScanning(true);
    setScanError(null);
    try {
      const result = await insightsApi.scanMessage(scanText);
      setScanResult(result);
    } catch {
      setScanError("No se pudo analizar el mensaje. Verifica que el microservicio IA esté activo.");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[var(--color-text-primary)]">
            Análisis financiero y protección IA
            <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Monitoreo pasivo con Random Forest y heurísticas: diagnostica riesgos y genera guías sin bloquear tus cuentas.
          </p>
        </div>
        <div className="w-48">
          <Select
            value={String(periodDays)}
            onChange={(event) => setPeriodDays(Number(event.target.value))}
            options={periodOptions}
            aria-label="Periodo de análisis"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !overview || !summary ? (
        <Card className="p-6 text-sm text-[var(--color-text-secondary)]">
          No se pudo obtener el análisis para este periodo.
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Ingresos" value={formatCurrency(summary.ingresos)} />
            <MetricCard label="Gastos" value={formatCurrency(summary.gastos)} />
            <MetricCard label="Ahorros" value={formatCurrency(summary.ahorros)} />
            <MetricCard label="Tasa de ahorro" value={`${summary.tasa_ahorro.toFixed(1)}%`} />
            <MetricCard label="Transacciones analizadas" value={String(summary.total_transacciones)} />
            <MetricCard label="Alertas detectadas" value={String(summary.total_alertas)} />
            <MetricCard label="Alertas altas o críticas" value={String(summary.alertas_criticas)} />
            <MetricCard label="Score de riesgo promedio" value={`${summary.score_riesgo_promedio.toFixed(1)} / 100`} />
          </div>

          {scamReport && (
            <Card className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  {scamReport.nivel === "BAJO" ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                      Reporte de riesgo de estafa · Nivel {scamReport.nivel}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Modo vigilancia pasiva (TriDa alerta y guía; el bloqueo solo lo decides tú o tu banco)
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
                  Score promedio: {scamReport.score_promedio} / 100
                </span>
              </div>
              <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                {scamReport.diagnostico}
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GoalCountCard
              label="Metas activas"
              count={savingsLoading ? null : savingsSummary.metas_activas}
              estado="ACTIVA"
            />
            <GoalCountCard
              label="Metas completadas"
              count={savingsLoading ? null : savingsSummary.metas_completadas}
              estado="COMPLETADA"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-[var(--color-text-primary)]">
                Consejos financieros para este periodo
              </h2>
              <ul className="space-y-3">
                {overview.consejos.map((advice, index) => (
                  <li
                    key={`${index}-${advice}`}
                    className="rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm text-[var(--color-text-secondary)]"
                  >
                    {advice}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-[var(--color-text-primary)]">
                Guías de seguridad recomendadas
              </h2>
              {securityGuides.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  Sin guías adicionales para este periodo.
                </p>
              ) : (
                <ul className="space-y-3">
                  {securityGuides.map((guide, index) => (
                    <li
                      key={`${index}-${guide}`}
                      className="rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm text-[var(--color-text-secondary)]"
                    >
                      {guide}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
              Analizador de SMS, notificaciones y enlaces sospechosos
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Pega aquí cualquier mensaje recibido en tu celular para detectar suplantación bancaria (phishing/smishing) y recibir pasos de protección.
            </p>
            <form onSubmit={handleScanSubmit} className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={scanText}
                onChange={(e) => setScanText(e.target.value)}
                placeholder="Ej: Bancolombia informa que tu cuenta fue suspendida, ingresa aquí http://..."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3 text-sm text-[var(--color-text-primary)] focus:outline-none"
              />
              <button
                type="submit"
                disabled={scanning || !scanText.trim()}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {scanning ? "Analizando..." : "Analizar mensaje o enlace"}
              </button>
            </form>

            {scanError && (
              <p className="mt-3 text-xs text-red-400">{scanError}</p>
            )}

            {scanResult && (
              <div className="mt-4 space-y-3 rounded-lg bg-[var(--color-bg-secondary)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[var(--color-text-primary)]">
                    Resultado: Riesgo {scanResult.nivel_riesgo} ({scanResult.score_riesgo}/100)
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Sin bloqueo automático · Solo diagnóstico y guía
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">Hallazgos:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-[var(--color-text-secondary)]">
                    {scanResult.hallazgos.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">Guía de protección:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-[var(--color-text-secondary)]">
                    {scanResult.guia_proteccion.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-[var(--color-text-primary)]">
                Categorías con mayor gasto
              </h2>
              {overview.top_categorias.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No hay gastos por categoría en el periodo.
                </p>
              ) : (
                <ul className="space-y-3">
                  {overview.top_categorias.map((category) => (
                    <li
                      key={category.nombre}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="truncate text-[var(--color-text-secondary)]">
                        {category.nombre}
                      </span>
                      <span className="shrink-0 font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(category.total)} · {category.cantidad} mov.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-[var(--color-text-primary)]">
                Comercios con mayor gasto
              </h2>
              {overview.top_comercios.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">
                  No hay comercios registrados en el periodo.
                </p>
              ) : (
                <ul className="space-y-3">
                  {overview.top_comercios.map((merchant) => (
                    <li
                      key={merchant.comercio}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="truncate text-[var(--color-text-secondary)]">
                        {merchant.comercio}
                      </span>
                      <span className="shrink-0 font-semibold text-[var(--color-text-primary)]">
                        {formatCurrency(merchant.total)} · {merchant.cantidad} mov.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function GoalCountCard({
  label,
  count,
  estado,
}: {
  label: string;
  count: number | null;
  estado: "ACTIVA" | "COMPLETADA";
}) {
  return (
    <Card className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
          {count === null ? "Cargando…" : count}
        </p>
      </div>
      <Link
        to={`/savings?estado=${estado}`}
        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        Ver metas
      </Link>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
    </Card>
  );
}
