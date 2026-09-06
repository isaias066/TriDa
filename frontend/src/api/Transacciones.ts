// ¿Qué? Capa API para transacciones.
// ¿Para qué? Paginación, filtros, sort y conteos; exports de compatibilidad para Sidebar.

import { get } from './Client';
import { normalizeTransactions } from '@utils/Normalizers';
import type {
  Transaction,
  TransactionRaw,
  SelectedBankId,
  TransactionFilters,
  TransactionSort,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

export interface PaginatedTransactions {
  items: Transaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

type TransactionsApiResponse = {
  items: TransactionRaw[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export interface LevelCounts {
  all: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export async function getTransactionsPage(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit = 30,
  offset = 0,
  filters?: TransactionFilters,
  sort?: TransactionSort,
): Promise<PaginatedTransactions> {
  const params: Record<string, string | number> = {
    limit,
    offset,
  };

  if (bankId !== ALL_BANKS_ID) params.banco = bankId;

  if (filters) {
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.level && filters.level !== 'all') params.level = filters.level;
    if (filters.channel && filters.channel !== 'all') params.channel = filters.channel;
    if (filters.search && filters.search.trim() !== '') {
      params.search = filters.search.trim();
    }
    if (filters.amountMin !== undefined) params.amountMin = filters.amountMin;
    if (filters.amountMax !== undefined) params.amountMax = filters.amountMax;
  }

  if (sort?.field) {
    params.sortBy = sort.field;
    params.sortDir = sort.direction === 'asc' ? 'asc' : 'desc';
  }

  const raw = await get<TransactionsApiResponse>('/transacciones', params);

  return {
    items: normalizeTransactions(raw.items ?? []),
    total: Number(raw.total ?? 0),
    limit: Number(raw.limit ?? limit),
    offset: Number(raw.offset ?? offset),
    hasMore: Boolean(raw.hasMore),
  };
}

export async function getTransactionLevelCounts(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<LevelCounts> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  return get<LevelCounts>('/transacciones/counts-by-level', params);
}

/** Usado por Sidebar y contadores ligeros */
export async function getTransactionsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  try {
    const counts = await getTransactionLevelCounts(bankId);
    return counts.all;
  } catch {
    // Fallback si counts-by-level aún no está montado
    const page = await getTransactionsPage(bankId, 1, 0);
    return page.total;
  }
}

/** Compatibilidad legada */
export async function getTransactions(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<Transaction[]> {
  const page = await getTransactionsPage(bankId, 500, 0);
  return page.items;
}
