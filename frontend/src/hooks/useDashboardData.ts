// ¿Qué? Hook que gestiona toda la carga de datos del Dashboard principal.
// ¿Para qué? Centralizar la consulta y refresco de métricas, alertas y estado en vivo.
// ¿Impacto? Trae las 15 alertas sin truncar y el TPS/latencia reales del backend.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDashboardData } from '@api/Dashboard';
import { get } from '@api/Client';
import type { DashboardStats, RecentAlert, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

const DEFAULT_AUTO_REFRESH_MS = 30_000;
const LIVE_POLLING_MS = 10_000;

const EMPTY_STATS: DashboardStats = {
  totalTransactions: 0,
  totalClients: 0,
  totalFrauds: 0,
  totalBlocked: 0,
  totalAmount: 0,
  fraudRate: 0,
  alertsByLevel: {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  },
};

export interface LiveStatus {
  status: 'LIVE' | 'STANDBY' | 'OFFLINE';
  isLive: boolean;
  tps: number;
  latencyMs: number;
  transactionsLastMinute: number;
  simulator: {
    online: boolean;
    streaming: boolean;
  };
  lastActivitySecondsAgo: number;
}

const EMPTY_LIVE_STATUS: LiveStatus = {
  status: 'OFFLINE',
  isLive: false,
  tps: 0,
  latencyMs: 0,
  transactionsLastMinute: 0,
  simulator: { online: false, streaming: false },
  lastActivitySecondsAgo: 9999,
};

export interface UseDashboardDataOptions {
  autoRefresh?: boolean;
  autoRefreshMs?: number;
  enabled?: boolean;
  alertsLimit?: number;
}

export interface UseDashboardDataResult {
  stats: DashboardStats;
  recentAlerts: RecentAlert[];
  liveStatus: LiveStatus; // ← Propiedad requerida por DashboardPage.tsx
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

export function useDashboardData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseDashboardDataOptions = {},
): UseDashboardDataResult {
  const {
    autoRefresh = false,
    autoRefreshMs = DEFAULT_AUTO_REFRESH_MS,
    enabled = true,
    alertsLimit = 15,
  } = options;

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [liveStatus, setLiveStatus] = useState<LiveStatus>(EMPTY_LIVE_STATUS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);
  const liveIntervalRef = useRef<number | null>(null);

  const loadData = useCallback(
    async (isRefresh: boolean = false): Promise<void> => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const { stats: newStats, recentAlerts: newAlerts } = await getDashboardData(
          bankId,
          alertsLimit,
        );
        setStats(newStats);
        setRecentAlerts(newAlerts);
        setLastUpdated(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando dashboard';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId, alertsLimit],
  );

  const fetchLiveStatus = useCallback(async (): Promise<void> => {
    try {
      const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
      const data = await get<LiveStatus>('/dashboard/live-status', params);
      if (data) {
        setLiveStatus(data);
      }
    } catch {
      // Si el endpoint no responde temporalmente, se mantiene el último estado conocido
    }
  }, [bankId]);

  // Carga inicial
  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchInitial = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const [dashboardResult] = await Promise.all([
          getDashboardData(bankId, alertsLimit),
          fetchLiveStatus(),
        ]);
        if (!cancelled) {
          setStats(dashboardResult.stats);
          setRecentAlerts(dashboardResult.recentAlerts);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando dashboard';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      cancelled = true;
    };
  }, [bankId, enabled, alertsLimit, fetchLiveStatus]);

  // Auto-refresh de estadísticas generales
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    intervalRef.current = window.setInterval(() => {
      loadData(true);
    }, autoRefreshMs);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, autoRefreshMs, enabled, loadData]);

  // Polling del estado en vivo (cada 10s)
  useEffect(() => {
    if (!enabled) return;

    liveIntervalRef.current = window.setInterval(() => {
      fetchLiveStatus();
    }, LIVE_POLLING_MS);

    return () => {
      if (liveIntervalRef.current !== null) {
        window.clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [enabled, fetchLiveStatus]);

  // Pausar polling cuando la pestaña no esté visible
  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (liveIntervalRef.current !== null) {
          window.clearInterval(liveIntervalRef.current);
          liveIntervalRef.current = null;
        }
      } else {
        loadData(true);
        fetchLiveStatus();
        intervalRef.current = window.setInterval(() => {
          loadData(true);
        }, autoRefreshMs);
        liveIntervalRef.current = window.setInterval(() => {
          fetchLiveStatus();
        }, LIVE_POLLING_MS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, autoRefreshMs, enabled, loadData, fetchLiveStatus]);

  const refetch = useCallback(async (): Promise<void> => {
    await Promise.all([loadData(true), fetchLiveStatus()]);
  }, [loadData, fetchLiveStatus]);

  return {
    stats,
    recentAlerts,
    liveStatus,
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  };
}
