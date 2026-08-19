// ¿Qué? Hook que gestiona toda la carga y visualización de datos del mapa geográfico.
// ¿Para qué? Reemplazar la lógica compleja de transactionmap.jsx que incluía fetch
//            en paralelo, normalización de coordenadas, filtrado de puntos inválidos
//            y detección de transacciones nuevas para animaciones.
// ¿Impacto? Simplifica TransactionMapPage a un solo hook y expone puntos listos
//           para renderizar con react-leaflet.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMapData } from '@api/Mapa';
import type {
  MapStats,
  TransactionMapPoint,
  SelectedBankId,
} from '@app-types';
import type { RiskLevel } from '@constants/Risk';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_AUTO_REFRESH_MS = 10_000;

const MAX_ACTIVE_PULSES = 6;

const EMPTY_STATS: MapStats = {
  total:    0,
  critical: 0,
  high:     0,
  approved: 0,
  blocked:  0,
};

// ==============================================================================
// TYPES
// ==============================================================================

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

/** Valor retornado por useMapData. */
export interface UseMapDataResult {
  // --- Datos principales ---
  stats: MapStats;
  points: TransactionMapPoint[];

  // --- Vistas derivadas ---
  criticalPoints: TransactionMapPoint[];
  blockedPoints: TransactionMapPoint[];
  recentPoints: TransactionMapPoint[];

  // --- Pulses (transacciones nuevas) ---
  activePulses: MapPulse[];

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
 * Carga y gestiona los datos del mapa geográfico de transacciones.
 *
 * ¿Qué? Consume el endpoint compuesto que retorna stats + puntos, filtra
 *        automáticamente coordenadas inválidas y detecta transacciones nuevas.
 * ¿Para qué? Reemplazar la lógica compleja de `transactionmap.jsx`.
 * ¿Impacto? Con `enablePulses: true`, detecta cuándo hay puntos nuevos
 *           y los expone en `activePulses` para animar en el mapa.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @param options - Configuración opcional del hook.
 * @returns Objeto con puntos, stats, pulses y funciones de gestión.
 *
 */

export function useMapData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseMapDataOptions = {}
): UseMapDataResult {
  const {
    autoRefresh = false,
    autoRefreshMs = DEFAULT_AUTO_REFRESH_MS,
    enabled = true,
    enablePulses = false,
    maxPoints = 150,
  } = options;

  // ==============================================================================
  // ESTADOS
  // ==============================================================================

  const [stats, setStats] = useState<MapStats>(EMPTY_STATS);
  const [points, setPoints] = useState<TransactionMapPoint[]>([]);
  const [activePulses, setActivePulses] = useState<MapPulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const previousPointsCountRef = useRef<number>(0);
  const previousPointIdsRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);

  // ==============================================================================
  // FUNCIÓN DE CARGA
  // ==============================================================================

  /**
   * Función interna para cargar los datos del mapa.
   *
   * ¿Qué? Ejecuta getMapData y actualiza el estado.
   *        Si enablePulses está activo, detecta puntos nuevos y crea pulses.
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
        const data = await getMapData(bankId);
        setStats(data.stats);
        setPoints(data.points);
        setLastUpdated(new Date());

        // ==============================================================
        // Detección de transacciones nuevas (para pulses)
        // ==============================================================
        if (enablePulses && !loading) {
          const currentIds = new Set(data.points.map(p => p.id));
          const newPoints = data.points.filter(
            p => !previousPointIdsRef.current.has(p.id)
          );

          if (newPoints.length > 0) {
            const timestamp = Date.now();
            const newPulses: MapPulse[] = newPoints
              .slice(0, MAX_ACTIVE_PULSES)
              .map((point, index) => ({
                id:        `${point.id}-pulse-${timestamp}-${index}`,
                latitude:  point.location.latitude,
                longitude: point.location.longitude,
                level:     point.alertLevel,
                createdAt: timestamp,
              }));

            setActivePulses(prev => [...newPulses, ...prev].slice(0, MAX_ACTIVE_PULSES * 2));
          }

          previousPointIdsRef.current = currentIds;
        }

        previousPointsCountRef.current = data.points.length;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando datos del mapa';
        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId, enablePulses, loading]
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
        const data = await getMapData(bankId);
        if (!cancelled) {
          setStats(data.stats);
          setPoints(data.points);
          setLastUpdated(new Date());

          previousPointIdsRef.current = new Set(data.points.map(p => p.id));
          previousPointsCountRef.current = data.points.length;
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
  // PAUSAR CUANDO LA PESTAÑA NO ESTÁ VISIBLE
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
  // EXPIRACIÓN AUTOMÁTICA DE PULSES
  // ==============================================================================

  useEffect(() => {
    if (!enablePulses || activePulses.length === 0) return;

    // Los pulses expiran después de 3.5 segundos (para que termine la animación)
    const PULSE_LIFETIME_MS = 3_500;

    const cleanupInterval = window.setInterval(() => {
      const now = Date.now();
      setActivePulses(prev =>
        prev.filter(pulse => (now - pulse.createdAt) < PULSE_LIFETIME_MS)
      );
    }, 1000);

    return () => window.clearInterval(cleanupInterval);
  }, [enablePulses, activePulses.length]);

  // ==============================================================================
  // FUNCIÓN DE RECARGA MANUAL
  // ==============================================================================

  const refetch = useCallback(async (): Promise<void> => {
    await loadData(true);
  }, [loadData]);

  // ==============================================================================
  // VISTAS DERIVADAS
  // ==============================================================================

  /** Puntos limitados a `maxPoints` para no saturar el mapa. */
  const limitedPoints = useMemo<TransactionMapPoint[]>(
    () => points.slice(0, maxPoints),
    [points, maxPoints]
  );

  const criticalPoints = useMemo<TransactionMapPoint[]>(
    () => limitedPoints.filter(
      p => p.alertLevel === 'critical' || p.alertLevel === 'high'
    ),
    [limitedPoints]
  );

  const blockedPoints = useMemo<TransactionMapPoint[]>(
    () => limitedPoints.filter(p => p.status === 'blocked'),
    [limitedPoints]
  );

  const recentPoints = useMemo<TransactionMapPoint[]>(
    () => limitedPoints.slice(0, 5),
    [limitedPoints]
  );

  // ==============================================================================
  // RESULTADO
  // ==============================================================================

  return {
    // Datos principales
    stats,
    points: limitedPoints,

    // Vistas derivadas
    criticalPoints,
    blockedPoints,
    recentPoints,

    // Pulses
    activePulses,

    // Estados
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  };
}