// ¿Qué? Hook que gestiona toda la carga de datos analíticos del sistema TriDa.
// ¿Para qué? Reemplazar la lógica compleja de analytics.jsx que hacía fetch en
//            paralelo, normalización de campos con múltiples nombres posibles
//            y cálculos manuales de agregaciones.
// ¿Impacto? Simplifica AnalyticsPage a un solo hook y provee helpers para
//           obtener top ciudades, top bancos y otras vistas derivadas.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAnalyticsData } from '@api/Analytics';
import type {
  AnalyticsMetrics,
  AnalyticsAggregations,
  BankAggregation,
  CityStats,
  TransactionTypeAggregation,
  ChannelAggregation,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_AUTO_REFRESH_MS = 60_000;

const EMPTY_METRICS: AnalyticsMetrics = {
  detectionRate:       0,
  falsePositiveRate:   0,
  averageAmount:       0,
  totalAnalyzed:       0,
  averageResponseTime: 0,
  protectedAmount:     0,
  fraudsDetected:      0,
};

const EMPTY_AGGREGATIONS: AnalyticsAggregations = {
  porTipo:   [],
  porCiudad: [],
  porCanal:  [],
  porBanco:  [],
};

// ==============================================================================
// TYPES
// ==============================================================================

export interface UseAnalyticsDataOptions {
  autoRefresh?: boolean;
  autoRefreshMs?: number;
  enabled?: boolean;
  topCitiesLimit?: number;
  topBanksLimit?: number;
}

/** Valor retornado por useAnalyticsData. */
export interface UseAnalyticsDataResult {
  // --- Datos principales ---
  metrics: AnalyticsMetrics;
  aggregations: AnalyticsAggregations;

  // --- Vistas derivadas ---
  topCities: CityStats[];
  topBanksByFraud: BankAggregation[];
  topBanksByVolume: BankAggregation[];
  typesRanked: TransactionTypeAggregation[];
  channelsRanked: ChannelAggregation[];

  // --- Estados ---
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
 * Carga y mantiene actualizados los datos de la página de Analytics.
 *
 * ¿Qué? Consume el endpoint compuesto `/api/analytics/data` (métricas +
 *        agregaciones) y expone vistas derivadas útiles para gráficos.
 * ¿Para qué? Reemplazar la lógica de `analytics.jsx` con una API limpia.
 * ¿Impacto? Cambios de banco disparan re-fetch, y el auto-refresh mantiene
 *           las métricas del modelo IA actualizadas.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @param options - Configuración opcional del hook.
 * @returns Objeto con métricas, agregaciones y vistas derivadas.
 *
 */
export function useAnalyticsData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseAnalyticsDataOptions = {}
): UseAnalyticsDataResult {
  const {
    autoRefresh = false,
    autoRefreshMs = DEFAULT_AUTO_REFRESH_MS,
    enabled = true,
    topCitiesLimit = 10,
    topBanksLimit = 5,
  } = options;

  // ==============================================================================
  // ESTADOS
  // ==============================================================================

  const [metrics, setMetrics] = useState<AnalyticsMetrics>(EMPTY_METRICS);
  const [aggregations, setAggregations] = useState<AnalyticsAggregations>(EMPTY_AGGREGATIONS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);

  // ==============================================================================
  // FUNCIÓN DE CARGA
  // ==============================================================================

  /**
   * Función interna para cargar los datos.
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
        const data = await getAnalyticsData(bankId);
        setMetrics(data.metrics);
        setAggregations(data.aggregations);
        setLastUpdated(new Date());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando analytics';
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
        const data = await getAnalyticsData(bankId);
        if (!cancelled) {
          setMetrics(data.metrics);
          setAggregations(data.aggregations);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando analytics';
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
  // VISTAS DERIVADAS — Cálculos con useMemo para eficiencia
  // ==============================================================================

  const topCities = useMemo<CityStats[]>(
    () => [...aggregations.porCiudad]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, topCitiesLimit),
    [aggregations.porCiudad, topCitiesLimit]
  );

  const topBanksByFraud = useMemo<BankAggregation[]>(
    () => [...aggregations.porBanco]
      .sort((a, b) => b.fraud - a.fraud)
      .slice(0, topBanksLimit),
    [aggregations.porBanco, topBanksLimit]
  );

  const topBanksByVolume = useMemo<BankAggregation[]>(
    () => [...aggregations.porBanco]
      .sort((a, b) => b.count - a.count)
      .slice(0, topBanksLimit),
    [aggregations.porBanco, topBanksLimit]
  );

  const typesRanked = useMemo<TransactionTypeAggregation[]>(
    () => [...aggregations.porTipo]
      .sort((a, b) => b.count - a.count),
    [aggregations.porTipo]
  );

  const channelsRanked = useMemo<ChannelAggregation[]>(
    () => [...aggregations.porCanal]
      .sort((a, b) => b.count - a.count),
    [aggregations.porCanal]
  );

  // ==============================================================================
  // RESULTADO
  // ==============================================================================

  return {
    // Datos principales
    metrics,
    aggregations,

    // Vistas derivadas
    topCities,
    topBanksByFraud,
    topBanksByVolume,
    typesRanked,
    channelsRanked,

    // Estados
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  };
}