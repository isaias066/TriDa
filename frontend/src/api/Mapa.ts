// ¿Qué? Capa API para los endpoints del mapa geográfico de transacciones.
// ¿Para qué? Centralizar las consultas de ubicaciones y estadísticas geográficas
//            que se muestran en TransactionMapPage.
// ¿Impacto? Consumido exclusivamente por TransactionMapPage. Filtra automáticamente
//           los puntos con coordenadas inválidas antes de retornarlos.

import { get } from './Client';
import type {
  MapStats,
  MapStatsRaw,
  TransactionMapPoint,
  TransactionRaw,
  SelectedBankId,
} from '@app-types';
import {
  ALL_BANKS_ID,
  DEFAULT_BANK_COLOR,
  hasValidCoordinates,
} from '@app-types';
import { getRiskLevel, mapTransactionStatusRaw } from '@utils/Risk';

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Convierte un valor a número seguro con fallback.
 */
function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(n) ? fallback : n;
}

/**
 * Normaliza las estadísticas del mapa desde el backend.
 *
 * ¿Qué? Convierte los múltiples nombres de campo posibles a `MapStats`.
 * ¿Para qué? Manejar en un solo lugar las variaciones del backend.
 */
function normalizeMapStats(raw: MapStatsRaw): MapStats {
  return {
    total:    toNumber(raw.total_transacciones ?? raw.total, 0),
    critical: toNumber(raw.total_criticas ?? raw.crit, 0),
    high:     toNumber(raw.total_altas ?? raw.high, 0),
    approved: toNumber(raw.total_aprobadas ?? raw.app, 0),
    blocked:  toNumber(raw.total_bloqueadas ?? raw.blk, 0),
  };
}

/**
 * Convierte una transacción raw en un punto del mapa.
 *
 * ¿Qué? Toma los campos relevantes para el mapa y garantiza coordenadas válidas.
 * ¿Para qué? El mapa solo necesita un subset de los campos de la transacción
 *            completa, con coordenadas como `number` (no `null`).
 * ¿Impacto? Esta función NO valida coordenadas — asume que ya fueron filtradas
 *           antes de llamarla.
 */
function toMapPoint(raw: TransactionRaw): TransactionMapPoint {
  const score = toNumber(raw.score_riesgo, 0);
  const level = getRiskLevel(score);

  return {
    id:         String(raw.id_transaccion),
    riskScore:  score,
    alertLevel: level,
    status:     mapTransactionStatusRaw(raw.estado_transaccion),
    user:       raw.cliente ?? raw.nombre_completo ?? 'Desconocido',
    type:       raw.tipo_transaccion ?? 'Sin tipo',
    amount:     toNumber(raw.monto, 0),
    currency:   raw.moneda ?? 'COP',
    channel:    raw.canal ?? 'web',
    bank: {
      name:  raw.banco ?? 'Sin banco',
      color: raw.banco_color ?? raw.color_banco ?? DEFAULT_BANK_COLOR,
    },
    location: {
      city:      raw.ciudad ?? 'Desconocida',
      latitude:  toNumber(raw.latitud, 0),
      longitude: toNumber(raw.longitud, 0),
    },
  };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene las estadísticas geográficas del sistema.
 *
 * ¿Qué? Consulta el endpoint `GET /api/mapa/stats` y normaliza la respuesta.
 * ¿Para qué? Renderizar los contadores overlay que se muestran encima del mapa
 *            (Total, Críticas, Altas, Aprobadas, Bloqueadas).
 * ¿Impacto? Se llama al cargar TransactionMapPage y al cambiar el banco.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para stats globales.
 * @returns Estadísticas normalizadas del mapa.
 *
 */
export async function getMapStats(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<MapStats> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<MapStatsRaw>('/mapa/stats', params);
  return normalizeMapStats(raw);
}

/**
 * Obtiene los puntos geográficos para renderizar en el mapa.
 *
 * ¿Qué? Consulta el endpoint `GET /api/mapa/ubicaciones`, valida coordenadas
 *        y convierte cada transacción a `TransactionMapPoint`.
 * ¿Para qué? Renderizar los marcadores en el mapa con toda la info necesaria
 *            para el popup (usuario, monto, riesgo, banco, etc.).
 * ¿Impacto? Filtra automáticamente los puntos con coordenadas inválidas
 *           (lat/lng NULL, 0/0, o fuera de rango).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de puntos válidos para renderizar en el mapa.
 *
 */
export async function getMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<TransactionMapPoint[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<TransactionRaw[]>('/mapa/ubicaciones', params);

  return (raw ?? [])
    .filter(item => hasValidCoordinates(item.latitud, item.longitud))
    .map(toMapPoint);
}

// ==============================================================================
// FUNCIÓN COMPUESTA (carga paralela optimizada)
// ==============================================================================

/**
 * Payload completo del Mapa con stats + puntos geográficos.
 */
export interface MapData {
  stats:  MapStats;
  points: TransactionMapPoint[];
}

/**
 * Obtiene toda la data del mapa en paralelo.
 *
 * ¿Qué? Ejecuta las 2 requests principales del mapa en paralelo con `Promise.all`.
 * ¿Para qué? Optimizar la carga inicial de TransactionMapPage evitando
 *            peticiones secuenciales.
 * ¿Impacto? Reduce el tiempo de carga del mapa a la mitad típicamente.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con stats y puntos del mapa.
 *
 */
export async function getMapData(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<MapData> {
  const [stats, points] = await Promise.all([
    getMapStats(bankId),
    getMapPoints(bankId),
  ]);

  return { stats, points };
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

/**
 * Obtiene solo los puntos críticos y altos del mapa.
 *
 * ¿Qué? Filtra los puntos por nivel de riesgo alto o crítico.
 * ¿Para qué? Renderizar una vista simplificada del mapa que solo muestre
 *            las alertas más importantes (útil para el modo "solo críticos").
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de puntos con nivel crítico o alto.
 */
export async function getCriticalMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<TransactionMapPoint[]> {
  const points = await getMapPoints(bankId);
  return points.filter(
    point => point.alertLevel === 'critical' || point.alertLevel === 'high'
  );
}

/**
 * Obtiene solo los puntos bloqueados del mapa.
 *
 * ¿Qué? Filtra los puntos por estado 'blocked'.
 * ¿Para qué? Vista específica de transacciones bloqueadas por el sistema.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de puntos con estado bloqueado.
 */
export async function getBlockedMapPoints(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<TransactionMapPoint[]> {
  const points = await getMapPoints(bankId);
  return points.filter(point => point.status === 'blocked');
}

/**
 * Obtiene los N puntos más recientes del mapa.
 *
 * ¿Qué? Retorna los primeros N puntos (asumiendo que el backend los ordena
 *        cronológicamente descendente).
 * ¿Para qué? Renderizar animaciones de "pulso" solo para las transacciones
 *            más recientes (efecto visual en tiempo real).
 *
 * @param limit - Cantidad de puntos a retornar (default: 6).
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de los puntos más recientes.
 */
export async function getRecentMapPoints(
  limit: number = 6,
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<TransactionMapPoint[]> {
  const points = await getMapPoints(bankId);
  return points.slice(0, limit);
}