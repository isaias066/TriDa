// ¿Qué? Hook de gestión de transacciones.
// ¿Para qué? Vincular la tabla de UI con el API recargando en cada click de flecha.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTransactionsPage, getTransactionLevelCounts } from '@api/Transacciones';
import { useDebounce } from './useDebounce';
import type {
  Transaction,
  TransactionFilters,
  TransactionSort,
  TransactionSortField,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

const DEFAULT_PAGE_SIZE = 30;
const SEARCH_DEBOUNCE_MS = 400;

const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  level: 'all',
  status: 'all',
  channel: 'all',
};

const DEFAULT_SORT: TransactionSort = {
  field: 'timestamp',
  direction: 'desc',
};

const EMPTY_LEVEL_COUNTS = {
  all: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

export interface UseTransactionsOptions {
  initialFilters?: TransactionFilters;
  initialSort?: TransactionSort;
  pageSize?: number;
}

export interface UseTransactionsResult {
  transactions: Transaction[];
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  levelCounts: typeof EMPTY_LEVEL_COUNTS;

  filters: TransactionFilters;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;

  sort: TransactionSort;
  toggleSort: (field: TransactionSortField) => void;

  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
  nextPage: () => void;
  previousPage: () => void;

  selected: Transaction | null;
  setSelected: (transaction: Transaction | null) => void;
}

export function useTransactions(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseTransactionsOptions = {},
): UseTransactionsResult {
  const {
    initialFilters = EMPTY_FILTERS,
    initialSort = DEFAULT_SORT,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<TransactionFilters>(initialFilters);
  const [sort, setSort] = useState<TransactionSort>(initialSort);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const [levelCounts, setLevelCounts] = useState(EMPTY_LEVEL_COUNTS);

  const debouncedSearch = useDebounce(filters.search ?? '', SEARCH_DEBOUNCE_MS);

  const effectiveFilters = useMemo<TransactionFilters>(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const fetchLevelCounts = useCallback(async () => {
    try {
      const counts = await getTransactionLevelCounts(bankId);
      setLevelCounts(counts);
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
        // Agregamos sort aquí para que se envíe al backend
        const data = await getTransactionsPage(bankId, pageSize, offset, effectiveFilters, sort);

        setTransactions(data.items);
        setTotalCount(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando transacciones');
        setTransactions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bankId, page, pageSize, effectiveFilters, sort], // Dependencia de sort
  );

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const refetch = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    await Promise.all([fetchPage(true), fetchLevelCounts()]);
  }, [fetchPage, fetchLevelCounts]);

  const setFilters = useCallback((newFilters: Partial<TransactionFilters>): void => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPage(0);
  }, []);

  const clearFilters = useCallback((): void => {
    setFiltersState(EMPTY_FILTERS);
    setPage(0);
  }, []);

  const toggleSort = useCallback((field: TransactionSortField): void => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'desc' };
    });
    setPage(0); // Reiniciar paginación al reordenar
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const nextPage = useCallback((): void => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const previousPage = useCallback((): void => {
    setPage((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    transactions,
    allTransactions: transactions,
    filteredTransactions: transactions,
    loading,
    refreshing,
    error,
    refetch,
    levelCounts,
    filters,
    setFilters,
    clearFilters,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalCount,
    nextPage,
    previousPage,
    selected,
    setSelected,
  };
}

export function useTransactionsCount(bankId: SelectedBankId = ALL_BANKS_ID): {
  count: number;
  loading: boolean;
} {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getTransactionLevelCounts(bankId)
      .then((counts) => {
        if (!cancelled) setCount(counts.all);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bankId]);

  return { count, loading };
}
