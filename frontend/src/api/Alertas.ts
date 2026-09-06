// ¿Qué? API de alertas con paginación, filtros, sort y conteos reales.

import { get } from './Client';
import { normalizeAlerts, normalizeRecentAlerts } from '@utils/Normalizers';
import type { Alert, AlertRaw, RecentAlert, AlertCriticality, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

export interface AlertFilters {
  search?: string;
  level?: AlertCriticality | 'all' | string;
  status?: string;
}

export interface AlertSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedAlerts {
  items: Alert[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AlertLevelCounts {
  all: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
  active: number;
}

type AlertsApiResponse = {
  items: AlertRaw[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export async function getAlertsPage(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit = 30,
  offset = 0,
  filters?: AlertFilters,
  sort?: AlertSort,
): Promise<PaginatedAlerts> {
  const params: Record<string, string | number> = { limit, offset };

  if (bankId !== ALL_BANKS_ID) params.banco = bankId;

  if (filters) {
    if (filters.level && filters.level !== 'all') params.level = String(filters.level);
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.search?.trim()) params.search = filters.search.trim();
  }

  if (sort?.field) {
    params.sortBy = sort.field;
    params.sortDir = sort.direction === 'asc' ? 'asc' : 'desc';
  }

  const raw = await get<AlertsApiResponse>('/alertas', params);

  return {
    items: normalizeAlerts(raw.items ?? []),
    total: Number(raw.total ?? 0),
    limit: Number(raw.limit ?? limit),
    offset: Number(raw.offset ?? offset),
    hasMore: Boolean(raw.hasMore),
  };
}

export async function getAlertLevelCounts(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<AlertLevelCounts> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  return get<AlertLevelCounts>('/alertas/counts-by-level', params);
}

export async function getAlerts(bankId: SelectedBankId = ALL_BANKS_ID): Promise<Alert[]> {
  const page = await getAlertsPage(bankId, 500, 0);
  return page.items;
}

export async function getAlertsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  try {
    return (await getAlertLevelCounts(bankId)).all;
  } catch {
    return (await getAlertsPage(bankId, 1, 0)).total;
  }
}

export async function getActiveAlertsCount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  try {
    return (await getAlertLevelCounts(bankId)).active;
  } catch {
    return 0;
  }
}

export async function getAlertsCountsByLevel(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<Record<AlertCriticality, number>> {
  const c = await getAlertLevelCounts(bankId);
  return { low: c.low, medium: c.medium, high: c.high, critical: c.critical };
}

export async function getAlertsCountByLevel(
  level: AlertCriticality,
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const counts = await getAlertsCountsByLevel(bankId);
  return counts[level] ?? 0;
}

export async function getRecentAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<RecentAlert[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<AlertRaw[]>('/dashboard/alertas-recientes', params);
  return normalizeRecentAlerts(raw);
}
