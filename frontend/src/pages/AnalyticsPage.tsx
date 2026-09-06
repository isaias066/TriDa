// ¿Qué? Página de analíticas del modelo TriDa.
// ¿Para qué? KPIs + 4 agregaciones con datos reales del backend enriquecido.
// ¿Impacto? Sin emojis ni estilos inline de negocio; skeletons y tokens CSS.

import { useEffect } from 'react';
import {
  BarChart3,
  Smartphone,
  Monitor,
  CreditCard,
  Landmark,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useAnalyticsData } from '@hooks/useAnalyticsData';
import { Button, EmptyState, Skeleton } from '@components/ui';
import { ScoreRing } from '@components/shared/ScoreRing';
import { AggregationChart } from '@components/analytics';
import { formatCurrency, formatNumber, formatPercent } from '@utils/Formatters';
import type { LucideIcon } from 'lucide-react';

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  mobile: Smartphone,
  web: Monitor,
  pos: CreditCard,
  atm: Landmark,
  branch: Building2,
};

export function AnalyticsPage() {
  const { selectedBank } = useBank();

  useEffect(() => {
    document.title = 'Analíticas — TriDa';
  }, []);

  const {
    metrics,
    typesRanked,
    topCities,
    channelsRanked,
    topBanksByFraud,
    loading,
    error,
    lastUpdated,
    refetch,
    refreshing,
  } = useAnalyticsData(selectedBank, {
    topCitiesLimit: 12,
    topBanksLimit: 10,
    autoRefresh: true,
    autoRefreshMs: 60_000,
  });

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col gap-5 p-6 font-sans md:p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6 font-sans md:p-8">
        <EmptyState
          preset="error"
          description={error}
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col gap-5 p-6 font-sans md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            <BarChart3 size={24} aria-hidden />
            Analíticas del Modelo
          </h1>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            Efectividad, distribución y exposición por dimensión
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] italic text-[var(--text-tertiary)]">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={refreshing}
            aria-label="Actualizar analíticas"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : undefined} />
          </Button>
        </div>
      </header>

      <section
        aria-label="Métricas del modelo de IA"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <ScoreRing
            score={metrics.detectionRate}
            size="md"
            color="#34D399"
            scoreFormat="compact"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">
              {formatPercent(metrics.detectionRate)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Tasa de Detección
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <ScoreRing
            score={metrics.falsePositiveRate}
            size="md"
            color="#FBBF24"
            scoreFormat="compact"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">
              {formatPercent(metrics.falsePositiveRate)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Falsos Positivos
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">
              {formatCurrency(metrics.averageAmount)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Monto Promedio
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-xl font-extrabold tabular-nums tracking-tight text-[var(--text-primary)]">
              {formatNumber(metrics.totalAnalyzed)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Total Analizadas
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              {formatNumber(metrics.fraudsDetected)} señaladas ·{' '}
              {formatCurrency(metrics.protectedAmount)} protegido
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label="Distribución de transacciones"
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <AggregationChart
          title="Transacciones por Tipo"
          data={typesRanked.map((t) => ({
            label: t.type,
            count: t.count,
            fraud: t.fraud,
          }))}
          showFraudColumn
        />

        <AggregationChart
          title="Top Ciudades"
          data={topCities.map((c) => ({
            label: c.city,
            count: c.transactionCount,
            fraud: c.fraudCount,
          }))}
          barColor="var(--chart-cyan, #06B6D4)"
          showFraudColumn
          maxItems={12}
        />

        <AggregationChart
          title="Canal"
          data={channelsRanked.map((c) => {
            const Icon = CHANNEL_ICONS[c.channel?.toLowerCase()] ?? BarChart3;
            return {
              label: c.channel,
              count: c.count,
              fraud: c.fraud,
              icon: <Icon size={14} className="shrink-0 text-[var(--text-tertiary)]" aria-hidden />,
            };
          })}
          barColor="var(--chart-indigo, #818CF8)"
          showFraudColumn
        />

        <AggregationChart
          title="Fraude por Banco"
          data={topBanksByFraud.map((b) => ({
            label: b.bank,
            count: b.fraud > 0 ? b.fraud : b.count,
            fraud: b.fraud,
            color: b.color,
          }))}
          showFraudColumn
        />
      </section>
    </div>
  );
}
