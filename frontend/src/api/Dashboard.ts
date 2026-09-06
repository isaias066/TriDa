// ¿Qué? Capa API para los endpoints de estadísticas del Dashboard principal.
// ¿Para qué? Centralizar la consulta de métricas y alertas recientes sincronizadas.
// ¿Impacto? Consume los 15 registros reales desde el backend.

import { get } from './Client';
import type {
  DashboardStats,
  DashboardStatsRaw,
  RecentAlert,
  AlertCriticality,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';
import { getRecentAlerts } from './Alertas';

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

function normalizeDashboardStats(raw: DashboardStatsRaw): DashboardStats {
  const total = raw.total_transacciones ?? raw.total ?? 0;
  const totalBlocked = raw.total_bloqueadas ?? raw.blk ?? 0;
  const totalFrauds = raw.total_fraudes ?? 0;

  const alertsByLevel: Record<AlertCriticality, number> = {
    low: 0,
    medium: 0,
    high: raw.total_altas ?? raw.high ?? 0,
    critical: raw.total_criticas ?? raw.crit ?? 0,
  };

  const fraudRate = total > 0 ? (totalFrauds / total) * 100 : 0;

  return {
    totalTransactions: total,
    totalClients: raw.total_clientes ?? 0,
    totalFrauds,
    totalBlocked,
    totalAmount: raw.monto_total ?? 0,
    fraudRate: Number(fraudRate.toFixed(1)),
    alertsByLevel,
  };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

export async function getDashboardStats(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<DashboardStats> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<DashboardStatsRaw>('/dashboard/stats', params);
  return normalizeDashboardStats(raw);
}

// ==============================================================================
// FUNCIÓN COMPUESTA
// ==============================================================================

export interface DashboardData {
  stats: DashboardStats;
  recentAlerts: RecentAlert[];
}

export async function getDashboardData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  alertsLimit: number = 15,
): Promise<DashboardData> {
  const [stats, recentAlerts] = await Promise.all([
    getDashboardStats(bankId),
    getRecentAlerts(bankId, alertsLimit),
  ]);

  return { stats, recentAlerts };
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

export async function getTotalProcessedAmount(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<number> {
  const stats = await getDashboardStats(bankId);
  return stats.totalAmount;
}

export async function getFraudRate(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  const stats = await getDashboardStats(bankId);
  return stats.fraudRate;
}
