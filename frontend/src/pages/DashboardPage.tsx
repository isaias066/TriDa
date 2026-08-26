// ¿Qué? Página principal del Dashboard del sistema TriDa.
// ¿Para qué? Reemplazar dashboards.jsx con una versión modular que compone
//            StatsCardsGrid, AlertsByLevelRings y RecentAlertsPanel.
// ¿Impacto? Es la primera página que ve el usuario al entrar al sistema.
//           Muestra el estado general de transacciones, alertas y métricas.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDashboardData } from '@hooks/useDashboardData';
import { useAlerts } from '@hooks/useAlerts';
import { useFormattedClock } from '@hooks/useClock';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { StatsCardsGrid, AlertsByLevelRings, RecentAlertsPanel } from '@components/dashboard';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedBank, selectedBankInfo } = useBank();
  const { timeWithSeconds } = useFormattedClock();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Dashboard — TriDa';
  }, []);

  // ==============================================================================
  // ESTADO LOCAL
  // ==============================================================================

  const [isLive, setIsLive] = useState(true);

  // ==============================================================================
  // DATOS — Dashboard stats + alertas recientes (paralelo)
  // ==============================================================================

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

  // ==============================================================================
  // DATOS — Conteo de alertas por nivel
  // ==============================================================================

  const { counts: alertCounts, loading: alertsLoading } = useAlerts(selectedBank);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

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

  const handleLevelClick = (level: string): void => {
    navigate(`/alerts?level=${level}`);
  };

  // ==============================================================================
  // RESPONSIVE — breakpoint para sección inferior
  // ==============================================================================

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (dashboardLoading && !stats.totalTransactions) {
    return (
      <div className="flex min-h-screen flex-col gap-6 p-6 font-sans md:p-8">
        <Spinner size="lg" label="Cargando dashboard..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

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

  // ==============================================================================
  // RENDER — DASHBOARD
  // ==============================================================================

  return (
    <div className="flex min-h-full flex-col gap-6 p-6 font-sans md:gap-7 md:p-8">
      {/* ================================================================
          HEADER — Título + controles
          ================================================================ */}

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
          {/* Reloj */}
          <span className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-semibold tabular-nums text-[var(--text-tertiary)]">
            {timeWithSeconds}
          </span>

          {/* Indicador LIVE */}
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            aria-label={
              isLive ? 'Sistema en vivo. Click para pausar' : 'Sistema pausado. Click para reanudar'
            }
            aria-pressed={isLive}
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

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Actualizar
          </Button>

          {/* Última actualización */}
          {lastUpdated && (
            <span className="text-[10px] italic text-[var(--text-tertiary)]">
              Actualizado: {lastUpdated.toLocaleTimeString('es-CO')}
            </span>
          )}
        </div>
      </header>

      {/* ================================================================
          STATS CARDS — métricas principales
          ================================================================ */}

      <section aria-label="Métricas principales">
        <StatsCardsGrid
          stats={stats}
          isLive={isLive}
          transactionsPerSecond={isLive ? Math.floor(Math.random() * 8) + 3 : 0}
          onFraudClick={handleFraudClick}
          onBlockedClick={handleBlockedClick}
        />
      </section>

           {/* ================================================================
          SECCIÓN INFERIOR — Alertas recientes (izq) + Distribución (der)
          ================================================================ */}

      <section
        aria-label="Alertas y distribución"
        className={
          isMobile
            ? 'flex flex-col gap-5'
            : 'grid grid-cols-[1fr_minmax(260px,320px)] items-start gap-5'
        }
      >
        {/* Columna izquierda: panel de alertas recientes */}
        <div className="min-w-0">
          <RecentAlertsPanel
            alerts={recentAlerts}
            loading={dashboardLoading}
            onViewAll={handleViewAllAlerts}
            isLive={isLive}
            maxItems={15}
          />
        </div>

        {/* Columna derecha: distribución por nivel */}
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 shadow-glow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="m-0 text-[13px] font-bold text-[var(--text-primary)]">
              Distribución de alertas
            </h2>
          </div>

          {alertsLoading ? (
            <Spinner label="Cargando..." centered />
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