// ¿Qué? Hook que encapsula la carga, filtrado, ordenamiento y paginación de transacciones.
// ¿Para qué? Reemplazar la lógica compleja que estaba en transactions.jsx y evitar
//            duplicarla en Analytics, Layout, Sidebar y futuros componentes.
// ¿Impacto? Simplifica drásticamente los componentes que muestran transacciones,
//           aplicando búsqueda con debounce y paginación consistente.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getTransactions } from '@api/Transacciones';
import { useDebounce } from './useDebounce';
import type {
  Transaction,
  TransactionFilters,
  TransactionSort,
  TransactionSortField,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_PAGE_SIZE = 30;

const SEARCH_DEBOUNCE_MS = 300;

// ==============================================================================
// TYPES
// ==============================================================================

/** Configuración del hook. */
export interface UseTransactionsOptions {
  initialFilters?: TransactionFilters;
  initialSort?: TransactionSort;
  pageSize?: number;
}

/** Valor retornado por useTransactions. */
export interface UseTransactionsResult {
  // --- Datos ---
  transactions: Transaction[];
  allTransactions: Transaction[];
  filteredTransactions: Transaction[];

  // --- Estados ---
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;

  // --- Filtros ---
  filters: TransactionFilters;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  clearFilters: () => void;

  // --- Ordenamiento ---
  sort: TransactionSort;
  toggleSort: (field: TransactionSortField) => void;

  // --- Paginación ---
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
  nextPage: () => void;
  previousPage: () => void;

  // --- Selección ---
  selected: Transaction | null;
  setSelected: (transaction: Transaction | null) => void;
}

// ==============================================================================
// FILTROS POR DEFECTO
// ==============================================================================

const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  level: 'all',
  status: 'all',
};

const DEFAULT_SORT: TransactionSort = {
  field:     'timestamp',
  direction: 'desc',
};

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Aplica los filtros a un array de transacciones.
 */
function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  let result = transactions;

  // Filtro de búsqueda de texto libre
  if (filters.search && filters.search.trim() !== '') {
    const query = filters.search.toLowerCase().trim();
    result = result.filter(
      tx =>
        tx.id.toLowerCase().includes(query) ||
        tx.user.toLowerCase().includes(query) ||
        tx.bank.name.toLowerCase().includes(query) ||
        tx.location.city.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query)
    );
  }

  // Filtro por nivel de riesgo
  if (filters.level && filters.level !== 'all') {
    result = result.filter(tx => tx.alertLevel === filters.level);
  }

  // Filtro por estado de transacción
  if (filters.status && filters.status !== 'all') {
    result = result.filter(tx => tx.status === filters.status);
  }

  // Filtro por canal
  if (filters.channel && filters.channel !== 'all') {
    result = result.filter(tx => tx.channel === filters.channel);
  }

  // Filtro por rango de monto
  if (filters.amountMin !== undefined) {
    result = result.filter(tx => tx.amount >= (filters.amountMin ?? 0));
  }
  if (filters.amountMax !== undefined) {
    result = result.filter(tx => tx.amount <= (filters.amountMax ?? Infinity));
  }

  return result;
}

/**
 * Ordena un array de transacciones según la configuración.
 */
function applySort(
  transactions: Transaction[],
  sort: TransactionSort
): Transaction[] {
  const sorted = [...transactions];
  const { field, direction } = sort;
  const modifier = direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    let aValue: number | string = a[field] as number | string;
    let bValue: number | string = b[field] as number | string;

    // Casos especiales por tipo de campo
    if (field === 'timestamp') {
      aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    } else if (field === 'bank') {
      aValue = a.bank.name;
      bValue = b.bank.name;
    }

    if (aValue < bValue) return -1 * modifier;
    if (aValue > bValue) return  1 * modifier;
    return 0;
  });

  return sorted;
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Carga y gestiona las transacciones con filtros, ordenamiento y paginación.
 *
 * ¿Qué? Encapsula toda la lógica que estaba en `transactions.jsx`:
 *        fetch, normalización, filtrado, ordenamiento, paginación y selección.
 * ¿Para qué? Reducir componentes complejos a simples "vistas de datos".
 * ¿Impacto? Aplica debounce automático a la búsqueda para evitar filtros excesivos.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @param options - Configuración opcional del hook.
 * @returns Objeto con transacciones y controles de filtro/sort/paginación.
 *
 * 
 */
export function useTransactions(
  bankId: SelectedBankId = ALL_BANKS_ID,
  options: UseTransactionsOptions = {}
): UseTransactionsResult {
  const {
    initialFilters = EMPTY_FILTERS,
    initialSort = DEFAULT_SORT,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  // ==============================================================================
  // ESTADOS
  // ==============================================================================

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<TransactionFilters>(initialFilters);
  const [sort, setSort] = useState<TransactionSort>(initialSort);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(filters.search ?? '', SEARCH_DEBOUNCE_MS);

  // ==============================================================================
  // CARGA DE DATOS
  // ==============================================================================

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await getTransactions(bankId);
        if (!cancelled) {
          setAllTransactions(data);
          setPage(0); 
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Error cargando transacciones';
          setError(message);
          setAllTransactions([]);
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

  const refetch = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    setError(null);

    try {
      const data = await getTransactions(bankId);
      setAllTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando transacciones';
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [bankId]);

  // ==============================================================================
  // FILTROS
  // ==============================================================================

  const setFilters = useCallback(
    (newFilters: Partial<TransactionFilters>): void => {
      setFiltersState(prev => ({ ...prev, ...newFilters }));
      setPage(0); // Reset paginación al cambiar filtros
    },
    []
  );

  const clearFilters = useCallback((): void => {
    setFiltersState(EMPTY_FILTERS);
    setPage(0);
  }, []);

  // Aplica debouncedSearch a los filtros efectivos
  const effectiveFilters = useMemo<TransactionFilters>(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch]
  );

  const filteredTransactions = useMemo<Transaction[]>(
    () => applyFilters(allTransactions, effectiveFilters),
    [allTransactions, effectiveFilters]
  );

  // ==============================================================================
  // ORDENAMIENTO
  // ==============================================================================

  const toggleSort = useCallback((field: TransactionSortField): void => {
    setSort(prev => {
      if (prev.field === field) {
        return { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { field, direction: 'desc' };
    });
  }, []);

  const sortedTransactions = useMemo<Transaction[]>(
    () => applySort(filteredTransactions, sort),
    [filteredTransactions, sort]
  );

  // ==============================================================================
  // PAGINACIÓN
  // ==============================================================================

  const totalCount = sortedTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedTransactions = useMemo<Transaction[]>(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    return sortedTransactions.slice(start, end);
  }, [sortedTransactions, page, pageSize]);

  const nextPage = useCallback((): void => {
    setPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const previousPage = useCallback((): void => {
    setPage(prev => Math.max(prev - 1, 0));
  }, []);

  // ==============================================================================
  // RESULTADO
  // ==============================================================================

  return {
    // Datos
    transactions:         paginatedTransactions,
    allTransactions,
    filteredTransactions: sortedTransactions,

    // Estados
    loading,
    refreshing,
    error,
    refetch,

    // Filtros
    filters,
    setFilters,
    clearFilters,

    // Ordenamiento
    sort,
    toggleSort,

    // Paginación
    page,
    setPage,
    totalPages,
    totalCount,
    nextPage,
    previousPage,

    // Selección
    selected,
    setSelected,
  };
}

// ==============================================================================
// HOOK SECUNDARIO — Contador ligero
// ==============================================================================

/**
 * Retorna solo el conteo total de transacciones (sin cargar todos los datos).
 *
 * ¿Qué? Versión simplificada para componentes que solo necesitan el número.
 * ¿Para qué? Sidebar, badge de contador, métricas rápidas.
 * ¿Impacto? Actualmente carga todas las transacciones y las cuenta.
 *           Cuando el backend tenga un endpoint /count, se optimizará.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con `count` y `loading`.
 *
 */
export function useTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): { count: number; loading: boolean } {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getTransactions(bankId)
      .then(data => {
        if (!cancelled) setCount(data.length);
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