// ¿Qué? API Analytics con normalización alineada al service enriquecido.
// ¿Para qué? Mapear tasa_deteccion, FP%, monto_protegido y agregaciones con fraude.

import { get } from './Client';
import type {
  AnalyticsMetrics,
  AnalyticsMetricsRaw,
  AnalyticsAggregations,
  TransactionTypeAggregation,
  ChannelAggregation,
  BankAggregation,
  CityStats,
  CityStatsRaw,
  CityAggregationRaw,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID, DEFAULT_BANK_COLOR } from '@app-types';

function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeAnalyticsMetrics(raw: AnalyticsMetricsRaw | null | undefined): AnalyticsMetrics {
  if (!raw) {
    return {
      detectionRate: 0,
      falsePositiveRate: 0,
      averageAmount: 0,
      totalAnalyzed: 0,
      averageResponseTime: 0,
      protectedAmount: 0,
      fraudsDetected: 0,
    };
  }

  const r = raw as Record<string, unknown>;

  return {
    detectionRate: toNumber(r.tasa_deteccion ?? r.detection_rate, 0),
    // Preferir tasa explícita; no usar conteo crudo como %
    falsePositiveRate: toNumber(
      r.tasa_falsos_positivos ?? r.false_positive_rate ?? r.falsos_positivos,
      0,
    ),
    averageAmount: toNumber(r.monto_promedio ?? r.avg_amount ?? r.avg, 0),
    totalAnalyzed: toNumber(r.total_analizadas ?? r.total ?? r.count, 0),
    averageResponseTime: toNumber(r.tiempo_promedio_respuesta, 0),
    protectedAmount: toNumber(r.monto_protegido, 0),
    fraudsDetected: toNumber(r.fraudes_detectados ?? r.total_fraude ?? r.fraud_count, 0),
  };
}

function normalizeTypeAggregation(raw: unknown): TransactionTypeAggregation {
  const r = raw as Record<string, unknown>;
  return {
    type: String(r.tipo_transaccion ?? r.tipo ?? r.type ?? r.nombre ?? 'Desconocido'),
    count: toNumber(r.total ?? r.count ?? r.cantidad, 0),
    fraud: toNumber(r.fraude ?? r.fraud ?? r.fraudes, 0),
    amount: toNumber(r.monto ?? r.amount, 0),
  };
}

function normalizeCityAggregation(raw: CityAggregationRaw | Record<string, unknown>): CityStats {
  const r = raw as Record<string, unknown>;
  return {
    city: String(r.ciudad ?? r.city ?? r.nombre ?? 'Desconocida'),
    country: '',
    transactionCount: toNumber(r.total ?? r.count ?? r.cantidad, 0),
    fraudCount: toNumber(r.fraude ?? r.fraud ?? r.fraudCount, 0),
  };
}

function normalizeChannelAggregation(raw: unknown): ChannelAggregation {
  const r = raw as Record<string, unknown>;
  return {
    channel: String(r.canal ?? r.channel ?? r.nombre ?? 'web'),
    count: toNumber(r.total ?? r.count ?? r.cantidad, 0),
    fraud: toNumber(r.fraude ?? r.fraud, 0),
  };
}

function normalizeBankAggregation(raw: unknown): BankAggregation {
  const r = raw as Record<string, unknown>;
  const fraud = toNumber(r.total_fraude ?? r.fraude ?? r.fraud ?? r.fraudes, 0);
  const count = toNumber(r.total ?? r.count ?? r.cantidad, fraud);
  return {
    bank: String(r.banco ?? r.bank ?? r.name ?? r.nombre ?? 'Banco'),
    bankId: r.banco_codigo ? String(r.banco_codigo) : r.bank_id ? String(r.bank_id) : undefined,
    count,
    fraud,
    color: String(r.banco_color ?? r.color ?? DEFAULT_BANK_COLOR),
  };
}

function normalizeAggregations(raw: {
  porTipo?: unknown[];
  porCiudad?: CityStatsRaw[];
  porCanal?: unknown[];
  porBanco?: unknown[];
}): AnalyticsAggregations {
  return {
    porTipo: (raw.porTipo ?? []).map(normalizeTypeAggregation),
    porCiudad: (raw.porCiudad ?? []).map(normalizeCityAggregation),
    porCanal: (raw.porCanal ?? []).map(normalizeChannelAggregation),
    porBanco: (raw.porBanco ?? []).map(normalizeBankAggregation),
  };
}

export async function getAnalyticsMetrics(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<AnalyticsMetrics> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<AnalyticsMetricsRaw>('/analytics/metricas', params);
  return normalizeAnalyticsMetrics(raw);
}

export async function getAnalyticsAggregations(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<AnalyticsAggregations> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;
  const raw = await get<{
    porTipo?: unknown[];
    porCiudad?: CityStatsRaw[];
    porCanal?: unknown[];
    porBanco?: unknown[];
  }>('/analytics/agregaciones', params);
  return normalizeAggregations(raw ?? {});
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  aggregations: AnalyticsAggregations;
}

export async function getAnalyticsData(
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<AnalyticsData> {
  const [metrics, aggregations] = await Promise.all([
    getAnalyticsMetrics(bankId),
    getAnalyticsAggregations(bankId),
  ]);
  return { metrics, aggregations };
}

export async function getDetectionRate(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  return (await getAnalyticsMetrics(bankId)).detectionRate;
}

export async function getFalsePositiveRate(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  return (await getAnalyticsMetrics(bankId)).falsePositiveRate;
}

export async function getProtectedAmount(bankId: SelectedBankId = ALL_BANKS_ID): Promise<number> {
  return (await getAnalyticsMetrics(bankId)).protectedAmount;
}

export async function getTopCities(
  limit: number = 10,
  bankId: SelectedBankId = ALL_BANKS_ID,
): Promise<CityStats[]> {
  const aggs = await getAnalyticsAggregations(bankId);
  return [...aggs.porCiudad]
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, limit);
}

export async function getTopBanksByFraud(limit: number = 5): Promise<BankAggregation[]> {
  const aggs = await getAnalyticsAggregations(ALL_BANKS_ID);
  return [...aggs.porBanco].sort((a, b) => b.fraud - a.fraud).slice(0, limit);
}
