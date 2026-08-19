// ¿Qué? Hook que encapsula la carga y gestión de alertas del sistema TriDa.
// ¿Para qué? Reemplazar el patrón repetitivo de useState + useEffect + fetch
//            que estaba en alerts.jsx y evitar duplicarlo en futuros componentes.
// ¿Impacto? Simplifica los componentes que necesitan mostrar alertas y garantiza
//           comportamiento consistente (loading, error, refresh, cancelación).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAlerts, getRecentAlerts } from '@api/Alertas';
import { countByRiskLevel } from '@utils/Risk';
import type {
  Alert,
  AlertCriticality,
  RecentAlert,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface UseAlertsResult {
  alerts: Alert[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  count: number;
  counts: Record<AlertCriticality, number>;
}

export interface UseRecentAlertsResult {
  alerts: RecentAlert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ==============================================================================
// HOOK PRINCIPAL — useAlerts
// ==============================================================================

/**
 * Carga y gestiona las alertas del sistema, opcionalmente filtradas por banco.
 *
 * ¿Qué? Encapsula el ciclo completo de fetch: estados de loading/error,
 *        normalización, contadores derivados y refetch manual.
 * ¿Para qué? Reemplazar el patrón que estaba en `alerts.jsx`:
 *
 *     const [alertsData, setAlertsData] = useState([]);
 *     const [loading, setLoading] = useState(true);
 *     useEffect(() => {
 *       setLoading(true);
 *       fetch(...).then(...).finally(() => setLoading(false));
 *     }, [selectedBank]);
 *
 * ¿Impacto? Al cambiar el banco, cancela cualquier request pendiente para
 *           evitar acumular llamadas obsoletas.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con alertas, estados y funciones de gestión.
 *
 * 
 */
export function useAlerts(bankId: SelectedBankId = ALL_BANKS_ID): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función interna para cargar alertas.
   *
   * ¿Por qué está separada? Para reutilizarla en el useEffect inicial y en
   * las llamadas manuales a refetch().
   */
  const fetchAlerts = useCallback(
    async (isRefresh: boolean = false): Promise<void> => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await getAlerts(bankId);
        setAlerts(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error cargando alertas';
        setError(message);
        setAlerts([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId]
  );

  // ==============================================================================
  // CARGA INICIAL — Al montar o cambiar el banco
  // ==============================================================================

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAlerts(bankId);
        if (!cancelled) {
          setAlerts(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando alertas';
          setError(message);
          setAlerts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    // Cleanup: si el bankId cambia antes de que termine el fetch,
    // marcamos el efecto como cancelado para no actualizar el estado
    return () => {
      cancelled = true;
    };
  }, [bankId]);

  // ==============================================================================
  // REFETCH MANUAL
  // ==============================================================================

  const refetch = useCallback(async (): Promise<void> => {
    await fetchAlerts(true);
  }, [fetchAlerts]);

  // ==============================================================================
  // VALORES DERIVADOS — Contadores
  // ==============================================================================

  const counts = useMemo<Record<AlertCriticality, number>>(
    () => countByRiskLevel(alerts),
    [alerts]
  );

  const count = alerts.length;

  return {
    alerts,
    loading,
    refreshing,
    error,
    refetch,
    count,
    counts,
  };
}

// ==============================================================================
// HOOK SECUNDARIO — useRecentAlerts
// ==============================================================================

/**
 * Carga las alertas recientes del Dashboard (formato simplificado).
 *
 * ¿Qué? Consume `/api/dashboard/alertas-recientes` que retorna un subset
 *        de las alertas con solo los campos necesarios para el panel del Dashboard.
 * ¿Para qué? Consumo eficiente en el Dashboard sin cargar toda la lista completa.
 * ¿Impacto? Payload más ligero que useAlerts, ideal para el Dashboard.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con alertas recientes, loading, error y refetch.
 *
 * );
 */
export function useRecentAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID
): UseRecentAlertsResult {
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRecentAlerts(bankId);
      setAlerts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando alertas recientes';
      setError(message);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRecentAlerts(bankId);
        if (!cancelled) {
          setAlerts(data);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando alertas recientes';
          setError(message);
          setAlerts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [bankId]);

  return {
    alerts,
    loading,
    error,
    refetch: load,
  };
}