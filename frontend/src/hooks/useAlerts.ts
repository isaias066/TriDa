// ¿Qué? Hook de alertas con paginación real, filtros, sort y conteos globales.
// ¿Para qué? Reemplaza filtrado/paginación en memoria de AlertsPage.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAlertsPage,
  getAlertLevelCounts,
  getRecentAlerts,
  type AlertFilters,
  type AlertSort,
  type AlertLevelCounts,
} from '@api/Alertas';
import { useDebounce } from './useDebounce';
import type { Alert, RecentAlert, SelectedBankId, AlertCriticality } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

const DEFAULT_PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 400;

const EMPTY_FILTERS: AlertFilters = {
  search: '',
  level: 'all',
  status: 'all',
};

const DEFAULT_SORT: AlertSort = {
  field: 'timestamp',
  direction: 'desc',
};

const EMPTY_LEVEL_COUNTS: AlertLevelCounts = {
  all: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
  active: 0,
};

export interface UseAlertsOptions {
  initialFilters?: AlertFilters;
  initialSort?: AlertSort;
  pageSize?: number;
}

export interface UseAlertsResult {
  alerts: Alert[];
  filteredAlerts: Alert[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  levelCounts: AlertLevelCounts;
  count: number;
  counts: Record<AlertCriticality, number>;

  filters: AlertFilters;
  setFilters: (filters: Partial<AlertFilters>) => void;
  clearFilters: () => void;

  sort: AlertSort;
  toggleSort: (field: string) => void;

  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;

  selected: Alert | null;
  setSelected: (alert: Alert | null) => void;
}

export function useAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseAlertsOptions = {},
): UseAlertsResult {
  const {
    initialFilters = EMPTY_FILTERS,
    initialSort = DEFAULT_SORT,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<AlertFilters>(initialFilters);
  const [sort, setSort] = useState<AlertSort>(initialSort);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [levelCounts, setLevelCounts] = useState<AlertLevelCounts>(EMPTY_LEVEL_COUNTS);

  const debouncedSearch = useDebounce(filters.search ?? '', SEARCH_DEBOUNCE_MS);

  const effectiveFilters = useMemo<AlertFilters>(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const fetchLevelCounts = useCallback(async () => {
    try {
      setLevelCounts(await getAlertLevelCounts(bankId));
    } catch {
      setLevelCounts(EMPTY_LEVEL_COUNTS);
    }
  }, [bankId]);

  useEffect(() => {
    fetchLevelCounts();
  }, [fetchLevelCounts]);

  const fetchPage = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setError(null);

      try {
        const offset = page * pageSize;
        const data = await getAlertsPage(bankId, pageSize, offset, effectiveFilters, sort);
        setAlerts(data.items);
        setTotalCount(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando alertas');
        setAlerts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId, page, pageSize, effectiveFilters, sort],
  );

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPage(true), fetchLevelCounts()]);
  }, [fetchPage, fetchLevelCounts]);

  const setFilters = useCallback((next: Partial<AlertFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setPage(0);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState(EMPTY_FILTERS);
    setPage(0);
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'desc' };
    });
    setPage(0);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const counts = useMemo<Record<AlertCriticality, number>>(
    () => ({
      low: levelCounts.low,
      medium: levelCounts.medium,
      high: levelCounts.high,
      critical: levelCounts.critical,
    }),
    [levelCounts],
  );

  return {
    alerts,
    filteredAlerts: alerts,
    loading,
    refreshing,
    error,
    refetch,
    levelCounts,
    count: levelCounts.all,
    counts,
    filters,
    setFilters,
    clearFilters,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalCount,
    selected,
    setSelected,
  };
}

export interface UseRecentAlertsResult {
  alerts: RecentAlert[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentAlerts(bankId: SelectedBankId = ALL_BANKS_ID): UseRecentAlertsResult {
  const [alerts, setAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAlerts(await getRecentAlerts(bankId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando alertas recientes');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRecentAlerts(bankId);
        if (!cancelled) setAlerts(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando alertas recientes');
          setAlerts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bankId]);

  return { alerts, loading, error, refetch: load };
}
