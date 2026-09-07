// ¿Qué? Página principal del Dashboard del sistema TriDa.
// ¿Para qué? Renderizar métricas, alertas recientes y panel de distribución de riesgo con soporte para Toasts de fraude en vivo.
// ¿Impacto? Alertas críticas inyectadas por el simulador se notifican instantáneamente arriba a la derecha.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ShieldAlert, X } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDashboardData } from '@hooks/useDashboardData';
import { useAlerts } from '@hooks/useAlerts';
import { useFormattedClock } from '@hooks/useClock';

import { Button, EmptyState, Skeleton } from '@components/ui';
import { StatsCardsGrid, AlertsByLevelRings, RecentAlertsPanel } from '@components/dashboard';
import type { RiskLevel } from '@constants/Risk';
import { RISK_COLORS } from '@constants/Risk';
import { formatCurrency } from '@utils/Formatters';

export function DashboardPage() {
  const navigate = useNavigate();
  const { selectedBank, selectedBankInfo } = useBank();
  const { timeWithSeconds } = useFormattedClock();

  useEffect(() => {
    document.title = 'Dashboard — TriDa';
  }, []);

  const {
    stats,
    recentAlerts,
    liveStatus,
    liveAlertToasts,
    dismissLiveAlertToast,
    loading: dashboardLoading,
    refreshing,
    error: dashboardError,
    lastUpdated,
    refetch: refetchDashboard,
  } = useDashboardData(selectedBank, {
    autoRefresh: true,
    autoRefreshMs: 15000, // Acelerado a 15s para mayor dinamismo del simulador
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

  // Expiración automática de notificaciones de fraude (7 segundos en pantalla)
  useEffect(() => {
    if (liveAlertToasts.length === 0) return;

    const timer = setTimeout(() => {
      // Descartar el toast más antiguo (el último del array)
      const oldest = liveAlertToasts[liveAlertToasts.length - 1];
      if (oldest) {
        dismissLiveAlertToast(oldest.id);
      }
    }, 7000);

    return () => clearTimeout(timer);
  }, [liveAlertToasts, dismissLiveAlertToast]);

  const isLive = liveStatus.isLive;
  const isStandby = liveStatus.status === 'STANDBY';

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
    <div className="flex min-h-full flex-col gap-6 p-6 font-sans md:gap-7 md:p-8 relative">
      {/* ── CONTENEDOR FLOTANTE DE TOASTS DE FRAUDE EN VIVO ── */}
      <div className="fixed right-6 top-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {liveAlertToasts.map((toast) => {
          const isCritical = String(toast.level).toUpperCase().includes('CRIT');
          const color = isCritical ? RISK_COLORS.critical : RISK_COLORS.high;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-rose-500/40 bg-[#160b0f]/95 p-4 text-xs shadow-2xl backdrop-blur-md transition-all duration-300 ease-out"
              style={{
                boxShadow: `0 10px 30px rgba(239, 68, 68, 0.25), 0 0 1px 1px rgba(239, 68, 68, 0.4)`,
              }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                <ShieldAlert size={18} className="animate-pulse" />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="font-extrabold uppercase tracking-wide text-[11px]"
                    style={{ color }}
                  >
                    {isCritical ? '¡Fraude Crítico!' : 'Alerta de Riesgo'}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-rose-300 bg-rose-900/60 px-1.5 py-0.5 rounded border border-rose-700/50">
                    #{String(toast.id).padStart(4, '0')}
                  </span>
                </div>

                <p className="m-0 text-rose-100 font-semibold leading-snug">
                  {toast.description || 'Patrón anómalo detectado por el motor'}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-rose-200">
                  <span>{formatCurrency(toast.amount ?? 0)}</span>
                  {toast.origin && (
                    <>
                      <span className="text-rose-500/50">·</span>
                      <span className="text-[10px] text-rose-300/80 font-normal truncate max-w-[140px]">
                        {toast.origin}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissLiveAlertToast(toast.id)}
                className="rounded-lg p-1 text-rose-400 hover:bg-rose-900/40 transition-colors"
                aria-label="Cerrar notificación"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

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

          <span
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-bold ${
              isLive
                ? 'border-[rgba(6,214,160,0.25)] bg-[rgba(6,214,160,0.1)] text-neon-green'
                : isStandby
                  ? 'border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.1)] text-amber-400'
                  : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive
                  ? 'animate-pulse-slow bg-neon-green'
                  : isStandby
                    ? 'bg-amber-400'
                    : 'bg-[var(--text-disabled)]'
              }`}
            />
            {isLive ? 'LIVE' : isStandby ? 'EN ESPERA' : 'OFFLINE'}
          </span>

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
          transactionsPerSecond={liveStatus.tps}
          latencyMs={liveStatus.latencyMs}
          liveStatusLabel={
            isLive
              ? 'Transmisión activa'
              : isStandby
                ? 'Simulador en espera'
                : 'Sin conexión externa'
          }
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
