// ¿Qué? Hook que gestiona toda la carga y visualización de datos del mapa geográfico.
// ¿Para qué? Consumir la paginación/límites reales del backend y evitar el colapso de UI.
// ¿Impacto? Provee el conteo total para la UI y administra animaciones de pulsos.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMapData, type MapData } from '@api/Mapa';
import type { MapStats, TransactionMapPoint, SelectedBankId } from '@app-types';
import type { RiskLevel } from '@constants/Risk';
import { ALL_BANKS_ID } from '@app-types';

const DEFAULT_AUTO_REFRESH_MS = 10_000;
const MAX_ACTIVE_PULSES = 6;

const EMPTY_STATS: MapStats = {
  total: 0,
  critical: 0,
  high: 0,
  approved: 0,
  blocked: 0,
};

export interface MapPulse {
  id: string;
  latitude: number;
  longitude: number;
  level: RiskLevel;
  createdAt: number;
}

export interface UseMapDataOptions {
  autoRefresh?: boolean;
  autoRefreshMs?: number;
  enabled?: boolean;
  enablePulses?: boolean;
  maxPoints?: number;
}

export interface UseMapDataResult {
  stats: MapStats;
  points: TransactionMapPoint[];
  criticalPoints: TransactionMapPoint[];
  blockedPoints: TransactionMapPoint[];
  recentPoints: TransactionMapPoint[];
  activePulses: MapPulse[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  totalPoints: number;
  truncated: boolean;
  refetch: () => Promise<void>;
}

export function useMapData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseMapDataOptions = {},
): UseMapDataResult {
  const {
    autoRefresh = false,
    autoRefreshMs = DEFAULT_AUTO_REFRESH_MS,
    enabled = true,
    enablePulses = false,
    maxPoints = 500,
  } = options;

  const [stats, setStats] = useState<MapStats>(EMPTY_STATS);
  const [points, setPoints] = useState<TransactionMapPoint[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [truncated, setTruncated] = useState<boolean>(false);
  const [activePulses, setActivePulses] = useState<MapPulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const previousPointIdsRef = useRef<Set<string>>(new Set<string>());
  const intervalRef = useRef<number | null>(null);

  const loadData = useCallback(
    async (isRefresh: boolean = false): Promise<void> => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data: MapData = await getMapData(bankId, maxPoints);
        setStats(data.stats);
        setPoints(data.points);
        setTotalPoints(data.totalPoints);
        setTruncated(data.truncated);
        setLastUpdated(new Date());

        if (enablePulses && !loading) {
          const currentIds = new Set<string>(data.points.map((p: TransactionMapPoint) => p.id));
          const newPoints = data.points.filter(
            (p: TransactionMapPoint) => !previousPointIdsRef.current.has(p.id),
          );

          if (newPoints.length > 0) {
            const timestamp = Date.now();
            const newPulses: MapPulse[] = newPoints
              .slice(0, MAX_ACTIVE_PULSES)
              .map((point: TransactionMapPoint, index: number) => ({
                id: `${point.id}-pulse-${timestamp}-${index}`,
                latitude: point.location.latitude,
                longitude: point.location.longitude,
                level: point.alertLevel,
                createdAt: timestamp,
              }));

            setActivePulses((prev: MapPulse[]) =>
              [...newPulses, ...prev].slice(0, MAX_ACTIVE_PULSES * 2),
            );
          }

          previousPointIdsRef.current = currentIds;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando datos del mapa';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId, enablePulses, loading, maxPoints],
  );

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
        const data: MapData = await getMapData(bankId, maxPoints);
        if (!cancelled) {
          setStats(data.stats);
          setPoints(data.points);
          setTotalPoints(data.totalPoints);
          setTruncated(data.truncated);
          setLastUpdated(new Date());
          previousPointIdsRef.current = new Set<string>(
            data.points.map((p: TransactionMapPoint) => p.id),
          );
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando datos del mapa';
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
  }, [bankId, enabled, maxPoints]);

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

  useEffect(() => {
    if (!enablePulses || activePulses.length === 0) return;

    const PULSE_LIFETIME_MS = 3_500;

    const cleanupInterval = window.setInterval(() => {
      const now = Date.now();
      setActivePulses((prev: MapPulse[]) =>
        prev.filter((pulse: MapPulse) => now - pulse.createdAt < PULSE_LIFETIME_MS),
      );
    }, 1000);

    return () => window.clearInterval(cleanupInterval);
  }, [enablePulses, activePulses.length]);

  const refetch = useCallback(async (): Promise<void> => {
    await loadData(true);
  }, [loadData]);

  const criticalPoints = useMemo<TransactionMapPoint[]>(
    () =>
      points.filter(
        (p: TransactionMapPoint) => p.alertLevel === 'critical' || p.alertLevel === 'high',
      ),
    [points],
  );

  const blockedPoints = useMemo<TransactionMapPoint[]>(
    () => points.filter((p: TransactionMapPoint) => p.status === 'blocked'),
    [points],
  );

  const recentPoints = useMemo<TransactionMapPoint[]>(() => points.slice(0, 5), [points]);

  return {
    stats,
    points,
    criticalPoints,
    blockedPoints,
    recentPoints,
    activePulses,
    loading,
    refreshing,
    error,
    lastUpdated,
    totalPoints,
    truncated,
    refetch,
  };
}
