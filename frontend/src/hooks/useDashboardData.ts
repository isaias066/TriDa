// ¿Qué? Hook que gestiona toda la carga de datos del Dashboard principal.
// ¿Para qué? Reemplazar la lógica compleja de dashboards.jsx que hacía fetch en
//            paralelo de múltiples fuentes y calculaba métricas manualmente.
// ¿Impacto? Simplifica el Dashboard a un solo hook y permite auto-refresh
//           opcional para monitoreo en tiempo real de transacciones y alertas.

import { useCallback, useEffect, useRef, useState } from 'react';
import { getDashboardData } from '@api/Dashboard';
import type {
  DashboardStats,
  RecentAlert,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_AUTO_REFRESH_MS = 30_000;

const EMPTY_STATS: DashboardStats = {
  totalTransactions: 0,
  totalClients:      0,
  totalFrauds:       0,
  totalBlocked:      0,
  totalAmount:       0,
  fraudRate:         0,
  alertsByLevel: {
    low:      0,
    medium:   0,
    high:     0,
    critical: 0,
  },
};

// ==============================================================================
// TYPES
// ==============================================================================

export interface UseDashboardDataOptions {
  autoRefresh?: boolean;
  autoRefreshMs?: number;
  enabled?: boolean;
}

export interface UseDashboardDataResult {
  stats: DashboardStats;
  recentAlerts: RecentAlert[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Carga y mantiene actualizados los datos del Dashboard principal.
 *
 * ¿Qué? Ejecuta en paralelo la carga de stats generales y alertas recientes,
 *        con opción de auto-refresh periódico para monitoreo en tiempo real.
 * ¿Para qué? Reemplazar el fetch múltiple del `dashboards.jsx` con una API
 *            limpia que retorna todo listo para renderizar.
 * ¿Impacto? Los cambios de banco disparan re-fetch automático, y el auto-refresh
 *           mantiene los datos frescos sin intervención del usuario.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @param options - Configuración opcional del hook.
 * @returns Objeto con stats, alertas recientes y funciones de gestión.
 *
 *
 */
export function useDashboardData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseDashboardDataOptions = {}
): UseDashboardDataResult {
  const {
    autoRefresh = false,
    autoRefreshMs = DEFAULT_AUTO_REFRESH_MS,
    enabled = true,
  } = options;

  // ==============================================================================
  // ESTADOS
  // ==============================================================================

  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);

  // ==============================================================================
  // FUNCIÓN DE CARGA
  // ==============================================================================

  /**
   * Función interna para cargar los datos del Dashboard.
   *
   * @param isRefresh - Si es true, usa `refreshing` en vez de `loading`.
   */
  const loadData = useCallback(
    async (isRefresh: boolean = false): Promise<void> => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const { stats: newStats, recentAlerts: newAlerts } = await getDashboardData(bankId);
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
    [bankId]
  );

  // ==============================================================================
  // CARGA INICIAL Y AL CAMBIAR BANCO
  // ==============================================================================

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
        const { stats: newStats, recentAlerts: newAlerts } = await getDashboardData(bankId);
        if (!cancelled) {
          setStats(newStats);
          setRecentAlerts(newAlerts);
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
  }, [bankId, enabled]);

  // ==============================================================================
  // AUTO-REFRESH PERIÓDICO
  // ==============================================================================

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

  // ==============================================================================
  // PAUSAR AUTO-REFRESH CUANDO LA PESTAÑA NO ESTÁ VISIBLE
  // ==============================================================================

  useEffect(() => {
    if (!autoRefresh || !enabled) return;

    /**
     * Cuando la pestaña se oculta, cancela el intervalo.
     * Cuando vuelve a mostrarse, refresca inmediatamente y reactiva el intervalo.
     */
    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        if (intervalRef.current !== null) {
          window.clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        loadData(true);
        intervalRef.current = window.setInterval(() => {
          loadData(true);
        }, autoRefreshMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [autoRefresh, autoRefreshMs, enabled, loadData]);

  // ==============================================================================
  // FUNCIÓN DE RECARGA MANUAL
  // ==============================================================================

  const refetch = useCallback(async (): Promise<void> => {
    await loadData(true);
  }, [loadData]);

  // ==============================================================================
  // RESULTADO
  // ==============================================================================

  return {
    stats,
    recentAlerts,
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  };
}