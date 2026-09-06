// ¿Qué? Capa API para los endpoints del mapa geográfico de transacciones.
// ¿Para qué? Centralizar las consultas de ubicaciones, límites y conteos reales.
// ¿Impacto? Consumido por el hook useMapData. Soporta límites dinámicos desde el FE.

import { get } from './Client';
import type {
  MapStats,
  MapStatsRaw,
  TransactionMapPoint,
  TransactionRaw,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID, DEFAULT_BANK_COLOR, hasValidCoordinates } from '@app-types';
import { getRiskLevel, mapTransactionStatusRaw } from '@utils/Risk';

// ==============================================================================
// TYPES E INTERFACES DEL API
// ==============================================================================

export interface LocationsApiResponse {
  items: TransactionRaw[];
  total: number;
  truncated: boolean;
}

export interface MapPointsResult {
  points: TransactionMapPoint[];
  total: number;
  truncated: boolean;
}

export interface MapData {
  stats: MapStats;
  points: TransactionMapPoint[];
  totalPoints: number;
  truncated: boolean;
}

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(n) ? fallback : n;
}

function normalizeMapStats(raw: MapStatsRaw): MapStats {
  return {
    total: toNumber(raw.total_transacciones ?? raw.total, 0),
    critical: toNumber(raw.total_criticas ?? raw.crit, 0),
    high: toNumber(raw.total_altas ?? raw.high, 0),
    approved: toNumber(raw.total_aprobadas ?? raw.app, 0),
    blocked: toNumber(raw.total_bloqueadas ?? raw.blk, 0),
  };
}

function toMapPoint(raw: TransactionRaw): TransactionMapPoint {
  const score = toNumber(raw.score_riesgo, 0);
  const level = getRiskLevel(score);

  return {
    id: String(raw.id_transaccion),
    riskScore: score,
    alertLevel: level,
    status: mapTransactionStatusRaw(raw.estado_transaccion),
    user: raw.cliente ?? raw.nombre_completo ?? 'Desconocido',
    type: raw.tipo_transaccion ?? 'Sin tipo',
    amount: toNumber(raw.monto, 0),
    currency: raw.moneda ?? 'COP',
    channel: raw.canal ?? 'web',
    bank: {
      name: raw.banco ?? 'Sin banco',
      color: raw.banco_color ?? raw.color_banco ?? DEFAULT_BANK_COLOR,
    },
    location: {
      city: raw.ciudad ?? 'Desconocida',
      latitude: toNumber(raw.latitud, 0),
      longitude: toNumber(raw.longitud, 0),
    },
  };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

export async function getMapStats(bankId: SelectedBankId = ALL_BANKS_ID): Promise<MapStats> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<MapStatsRaw>('/mapa/stats', params);
  return normalizeMapStats(raw);
}

export async function getMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit: number = 500,
): Promise<MapPointsResult> {
  const params: Record<string, any> = { limit };
  if (bankId !== ALL_BANKS_ID) {
    params.banco = bankId;
  }

  const response = await get<LocationsApiResponse>('/mapa/ubicaciones', params);

  const items = response?.items ?? [];
  const total = response?.total ?? 0;
  const truncated = response?.truncated ?? false;

  const validPoints = items
    .filter((item) => hasValidCoordinates(item.latitud, item.longitud))
    .map(toMapPoint);

  return {
    points: validPoints,
    total,
    truncated,
  };
}

export async function getMapData(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit: number = 500,
): Promise<MapData> {
  const [stats, pointsData] = await Promise.all([getMapStats(bankId), getMapPoints(bankId, limit)]);

  return {
    stats,
    points: pointsData.points,
    totalPoints: pointsData.total,
    truncated: pointsData.truncated,
  };
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

export async function getCriticalMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit: number = 500,
): Promise<TransactionMapPoint[]> {
  const { points } = await getMapPoints(bankId, limit);
  return points.filter((point) => point.alertLevel === 'critical' || point.alertLevel === 'high');
}

export async function getBlockedMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID,
  limit: number = 500,
): Promise<TransactionMapPoint[]> {
  const { points } = await getMapPoints(bankId, limit);
  return points.filter((point) => point.status === 'blocked');
}

export async function getRecentMapPoints(
  limit: number = 6,
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<TransactionMapPoint[]> {
  const { points } = await getMapPoints(bankId, limit);
  return points.slice(0, limit);
}
