// ¿Qué? Página principal del Dashboard del sistema TriDa.
// ¿Para qué? Renderizar métricas, alertas recientes y panel de distribución de riesgo.
// ¿Impacto? Integra componentes visuales optimizados y Skeletons de carga.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDashboardData } from '@hooks/useDashboardData';
import { useAlerts } from '@hooks/useAlerts';
import { useFormattedClock } from '@hooks/useClock';

import { Button, EmptyState, Skeleton } from '@components/ui';
import { StatsCardsGrid, AlertsByLevelRings, RecentAlertsPanel } from '@components/dashboard';
import type { RiskLevel } from '@constants/Risk';

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedBank, selectedBankInfo } = useBank();
  const { timeWithSeconds } = useFormattedClock();

  useEffect(() => {
    document.title = 'Dashboard — TriDa';
  }, []);

  const [isLive, setIsLive] = useState(true);

  const {
    stats,
    recentAlerts,
    loading: dashboardLoading,
    refreshing,
    error: dashboardError,
    lastUpdated,
    refetch: refetchDashboard,
  } = useDashboardData(selectedBank, {
    autoRefresh: isLive,
    autoRefreshMs: 30_000,
  });

  const { counts: alertCounts, loading: alertsLoading } = useAlerts(selectedBank);

  const handleRefresh = async (): Promise<void> => {
    await refetchDashboard();
  };

  const handleFraudClick = (): void => {
    navigate('/alerts');
  };

  const handleBlockedClick = (): void => {
    navigate('/transactions');
  };

  const handleViewAllAlerts = (): void => {
    navigate('/alerts');
  };

  const handleLevelClick = (level: RiskLevel): void => {
    navigate(`/alerts?level=${level}`);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (dashboardError && !stats.totalTransactions) {
    return (
      <div className="flex min-h-screen flex-col gap-6 p-6 font-sans md:p-8">
        <EmptyState
          preset="error"
          description={dashboardError}
          action={
            <Button variant="primary" onClick={handleRefresh}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  if (dashboardLoading && !stats.totalTransactions) {
    return (
      <div className="flex min-h-full flex-col gap-6 p-6 font-sans md:gap-7 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>

        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_300px]">
          <Skeleton className="h-80 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 font-sans md:gap-7 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Panel de Control
          </h1>
          <p className="m-0 flex flex-wrap items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            Detección de Fraude con IA
            {selectedBankInfo && selectedBankInfo.id !== 'all' && (
              <span className="font-semibold" style={{ color: selectedBankInfo.color }}>
                · {selectedBankInfo.name}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">
            {timeWithSeconds}
          </span>

          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            aria-label={isLive ? 'Pausar sistema' : 'Reanudar sistema'}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold transition-all duration-150 ${
              isLive
                ? 'border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.1)] text-neon-green'
                : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'animate-pulse-slow bg-neon-green' : 'bg-[var(--text-disabled)]'
              }`}
            />
            {isLive ? 'LIVE' : 'OFF'}
          </button>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>

          {lastUpdated && (
            <span className="text-[10px] italic text-[var(--text-tertiary)]">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
        </div>
      </header>

      <section aria-label="Métricas principales">
        <StatsCardsGrid
          stats={stats}
          isLive={isLive}
          transactionsPerSecond={isLive ? Math.floor(Math.random() * 8) + 3 : 0}
          onFraudClick={handleFraudClick}
          onBlockedClick={handleBlockedClick}
        />
      </section>

      <section
        aria-label="Alertas y distribución"
        className={
          isMobile
            ? 'flex flex-col gap-5'
            : 'grid grid-cols-[1fr_minmax(260px,320px)] items-start gap-5'
        }
      >
        <div className="min-w-0">
          <RecentAlertsPanel
            alerts={recentAlerts}
            loading={dashboardLoading}
            onViewAll={handleViewAllAlerts}
            isLive={isLive}
            maxItems={15}
          />
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-glow-sm">
          <h2 className="m-0 text-[13px] font-bold text-[var(--text-primary)]">
            Distribución de alertas
          </h2>

          {alertsLoading ? (
            <div className="flex flex-col gap-3 py-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
          ) : (
            <AlertsByLevelRings
              counts={alertCounts}
              onLevelClick={handleLevelClick}
              showTotal
              size="md"
            />
          )}
        </div>
      </section>
    </div>
  );
}
