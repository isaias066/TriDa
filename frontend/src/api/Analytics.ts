// ¿Qué? Capa API para todos los endpoints de analytics y métricas del modelo IA.
// ¿Para qué? Centralizar las consultas de efectividad del modelo, tasas de detección
//            y agregaciones por dimensión (tipo, ciudad, canal, banco).
// ¿Impacto? Consumido exclusivamente por AnalyticsPage. Cambios aquí afectan
//           los gráficos y métricas de rendimiento del sistema.

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

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Convierte un valor a número seguro con fallback.
 * NOTE: Duplicación intencional de Normalizers.ts para mantener este archivo
 *       autocontenido en cuanto a helpers básicos.
 */
function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(n) ? fallback : n;
}

/**
 * Normaliza métricas globales del modelo IA desde el backend.
 *
 * ¿Qué? Convierte los múltiples nombres de campo posibles del backend a la
 *        estructura estable `AnalyticsMetrics`.
 * ¿Para qué? Manejar en un solo lugar las variaciones que hacía el helper
 *            `getVal()` de `analytics.jsx`.
 */
function normalizeAnalyticsMetrics(raw: AnalyticsMetricsRaw): AnalyticsMetrics {
  return {
    detectionRate:       toNumber(raw.tasa_deteccion ?? raw.detection_rate, 0),
    falsePositiveRate:   toNumber(raw.falsos_positivos ?? raw.false_positives ?? raw.fp, 0),
    averageAmount:       toNumber(raw.monto_promedio ?? raw.avg_amount ?? raw.avg, 0),
    totalAnalyzed:       toNumber(raw.total_analizadas ?? raw.total ?? raw.count, 0),
    averageResponseTime: toNumber(raw.tiempo_promedio_respuesta, 0),
    protectedAmount:     toNumber(raw.monto_protegido, 0),
    fraudsDetected:      toNumber(raw.fraudes_detectados, 0),
  };
}

/**
 * Normaliza agregación por tipo de transacción.
 */
function normalizeTypeAggregation(raw: unknown): TransactionTypeAggregation {
  const r = raw as Record<string, unknown>;
  return {
    type:   String(r.tipo ?? r.type ?? r.nombre ?? 'Desconocido'),
    count:  toNumber(r.count ?? r.cantidad ?? r.total, 0),
    fraud:  toNumber(r.fraud ?? r.fraude ?? r.fraudes, 0),
    amount: toNumber(r.amount ?? r.monto, 0),
  };
}

/**
 * Normaliza agregación por ciudad.
 */
function normalizeCityAggregation(raw: CityAggregationRaw): CityStats {
  return {
    city:             String(raw.ciudad ?? raw.city ?? raw.nombre ?? 'Desconocida'),
    country:          '',
    transactionCount: toNumber(raw.count ?? raw.cantidad ?? raw.total, 0),
    fraudCount:       0,
  };
}

/**
 * Normaliza agregación por canal.
 */
function normalizeChannelAggregation(raw: unknown): ChannelAggregation {
  const r = raw as Record<string, unknown>;
  return {
    channel: String(r.canal ?? r.channel ?? r.nombre ?? 'web'),
    count:   toNumber(r.count ?? r.cantidad ?? r.total, 0),
    fraud:   toNumber(r.fraud ?? r.fraude, 0),
  };
}

/**
 * Normaliza agregación por banco.
 */
function normalizeBankAggregation(raw: unknown): BankAggregation {
  const r = raw as Record<string, unknown>;
  return {
    bank:   String(r.banco ?? r.bank ?? r.name ?? r.nombre ?? 'Banco'),
    bankId: r.bank_id ? String(r.bank_id) : undefined,
    count:  toNumber(r.count ?? r.cantidad ?? r.total, 0),
    fraud:  toNumber(r.fraud ?? r.fraude ?? r.fraudes, 0),
    color:  String(r.color ?? DEFAULT_BANK_COLOR),
  };
}

/**
 * Normaliza la estructura completa de agregaciones del backend.
 */
function normalizeAggregations(raw: {
  porTipo?:   unknown[];
  porCiudad?: CityStatsRaw[];
  porCanal?:  unknown[];
  porBanco?:  unknown[];
}): AnalyticsAggregations {
  return {
    porTipo:   (raw.porTipo ?? []).map(normalizeTypeAggregation),
    porCiudad: (raw.porCiudad ?? []).map(normalizeCityAggregation),
    porCanal:  (raw.porCanal ?? []).map(normalizeChannelAggregation),
    porBanco:  (raw.porBanco ?? []).map(normalizeBankAggregation),
  };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene las métricas globales del modelo de IA.
 *
 * ¿Qué? Consulta el endpoint `GET /api/analytics/metricas` y normaliza la respuesta.
 * ¿Para qué? Renderizar los indicadores clave de efectividad del modelo:
 *            tasa de detección, falsos positivos, tiempo de respuesta, monto protegido.
 * ¿Impacto? Es la fuente única para las métricas mostradas en AnalyticsPage.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para métricas globales.
 * @returns Métricas normalizadas del modelo.
 *
 */
export async function getAnalyticsMetrics(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<AnalyticsMetrics> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<AnalyticsMetricsRaw>('/analytics/metricas', params);
  return normalizeAnalyticsMetrics(raw);
}

/**
 * Obtiene las agregaciones de transacciones por dimensión.
 *
 * ¿Qué? Consulta el endpoint `GET /api/analytics/agregaciones` y normaliza.
 * ¿Para qué? Renderizar los 4 gráficos de barras de AnalyticsPage:
 *            por tipo de transacción, por ciudad, por canal, por banco.
 * ¿Impacto? Es la fuente única para todos los gráficos de agregación.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con arrays de agregaciones por cada dimensión.
 *
 */
export async function getAnalyticsAggregations(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<AnalyticsAggregations> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<{
    porTipo?:   unknown[];
    porCiudad?: CityStatsRaw[];
    porCanal?:  unknown[];
    porBanco?:  unknown[];
  }>('/analytics/agregaciones', params);

  return normalizeAggregations(raw);
}

// ==============================================================================
// FUNCIÓN COMPUESTA (carga paralela optimizada)
// ==============================================================================

/**
 * Payload completo de Analytics con métricas + agregaciones.
 */
export interface AnalyticsData {
  metrics:      AnalyticsMetrics;
  aggregations: AnalyticsAggregations;
}

/**
 * Obtiene toda la data de Analytics en paralelo.
 *
 * ¿Qué? Ejecuta las 2 requests principales en paralelo con `Promise.all`.
 * ¿Para qué? Optimizar la carga inicial de AnalyticsPage evitando peticiones
 *            secuenciales.
 * ¿Impacto? Reduce el tiempo de carga de ~400ms a ~200ms típicamente.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con métricas y agregaciones.
 *
 */
export async function getAnalyticsData(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<AnalyticsData> {
  const [metrics, aggregations] = await Promise.all([
    getAnalyticsMetrics(bankId),
    getAnalyticsAggregations(bankId),
  ]);

  return { metrics, aggregations };
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

/**
 * Obtiene solo la tasa de detección del modelo (utilidad rápida).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Tasa de detección en porcentaje (0-100).
 */
export async function getDetectionRate(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const metrics = await getAnalyticsMetrics(bankId);
  return metrics.detectionRate;
}

/**
 * Obtiene solo la tasa de falsos positivos (utilidad rápida).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Tasa de falsos positivos en porcentaje (0-100).
 */
export async function getFalsePositiveRate(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const metrics = await getAnalyticsMetrics(bankId);
  return metrics.falsePositiveRate;
}

/**
 * Obtiene el monto total protegido por el sistema (utilidad rápida).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Monto total protegido.
 */
export async function getProtectedAmount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const metrics = await getAnalyticsMetrics(bankId);
  return metrics.protectedAmount;
}

/**
 * Obtiene las top N ciudades por volumen de transacciones.
 *
 * ¿Qué? Ordena la agregación por ciudad y toma las primeras N.
 * ¿Para qué? Renderizar el gráfico "Top Ciudades" en AnalyticsPage.
 *
 * @param limit - Cantidad de ciudades a retornar (default: 10).
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de las top N ciudades ordenadas por volumen.
 */
export async function getTopCities(
  limit: number = 10,
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<CityStats[]> {
  const aggs = await getAnalyticsAggregations(bankId);
  return [...aggs.porCiudad]
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, limit);
}

/**
 * Obtiene los top N bancos con más fraudes detectados.
 *
 * ¿Qué? Ordena la agregación por banco por número de fraudes.
 * ¿Para qué? Identificar qué bancos son más objetivo de intentos de fraude.
 *
 * @param limit - Cantidad de bancos a retornar (default: 5).
 * @returns Array de los top N bancos ordenados por fraudes.
 */
export async function getTopBanksByFraud(limit: number = 5): Promise<BankAggregation[]> {
  const aggs = await getAnalyticsAggregations(ALL_BANKS_ID);
  return [...aggs.porBanco]
    .sort((a, b) => b.fraud - a.fraud)
    .slice(0, limit);
}