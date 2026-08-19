// ¿Qué? Capa API para los endpoints de estadísticas del Dashboard principal.
// ¿Para qué? Centralizar la consulta de métricas resumidas que se muestran
//            en los cards del Dashboard, evitando cálculos manuales en frontend.
// ¿Impacto? Consumido exclusivamente por DashboardPage y sus sub-componentes.
//           Cambios aquí afectan solo al Dashboard principal.

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

/**
 * Normaliza la respuesta raw del endpoint de dashboard stats.
 *
 * ¿Qué? Convierte los campos flexibles del backend a la estructura estable
 *        DashboardStats con nombres consistentes en camelCase.
 * ¿Para qué? Manejar las variaciones de nombres de campo del backend
 *            (`total_transacciones` vs `total`, etc.) en un solo lugar.
 */
function normalizeDashboardStats(raw: DashboardStatsRaw): DashboardStats {
  const total = raw.total_transacciones ?? raw.total ?? 0;
  const totalBlocked = raw.total_bloqueadas ?? raw.blk ?? 0;
  const totalFrauds = raw.total_fraudes ?? 0;

  const alertsByLevel: Record<AlertCriticality, number> = {
    low:      0,
    medium:   0,
    high:     raw.total_altas ?? raw.high ?? 0,
    critical: raw.total_criticas ?? raw.crit ?? 0,
  };

  const fraudRate = total > 0 ? (totalFrauds / total) * 100 : 0;

  return {
    totalTransactions: total,
    totalClients:      raw.total_clientes ?? 0,
    totalFrauds,
    totalBlocked,
    totalAmount:       raw.monto_total ?? 0,
    fraudRate:         Number(fraudRate.toFixed(1)),
    alertsByLevel,
  };
}

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene las estadísticas generales del Dashboard.
 *
 * ¿Qué? Consulta el endpoint `GET /api/dashboard/stats` y normaliza la respuesta.
 * ¿Para qué? Reemplaza `getDashboardStats()` de `services/conexion.js` y
 *            los cálculos manuales que hacía `dashboards.jsx` con arrays
 *            de transacciones.
 * ¿Impacto? Es la fuente única de verdad para las métricas del Dashboard.
 *           El cálculo lo hace el backend (mucho más eficiente que hacerlo
 *           en el frontend con miles de registros).
 *
 * @param bankId - Código del banco a filtrar, o 'all' para métricas globales.
 * @returns Estadísticas normalizadas del Dashboard.
 * @throws ApiError si la consulta falla.
 *
 */
export async function getDashboardStats(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<DashboardStats> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<DashboardStatsRaw>('/dashboard/stats', params);
  return normalizeDashboardStats(raw);
}

// ==============================================================================
// FUNCIÓN COMPUESTA (para carga inicial optimizada)
// ==============================================================================

/**
 * Payload completo del Dashboard con stats + alertas recientes.
 * Combina dos llamadas separadas en una única estructura para conveniencia.
 */
export interface DashboardData {
  stats:        DashboardStats;
  recentAlerts: RecentAlert[];
}

/**
 * Obtiene toda la data necesaria para el Dashboard en paralelo.
 *
 * ¿Qué? Ejecuta dos requests en paralelo (stats + alertas recientes) y
 *        retorna un objeto único con ambos resultados.
 * ¿Para qué? Optimizar la carga inicial del Dashboard evitando peticiones
 *            secuenciales. Un solo `await` en lugar de dos.
 * ¿Impacto? Reduce el TTFB (Time To First Byte) del Dashboard a la mitad
 *           en la mayoría de casos.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con stats y alertas recientes.
 *
 */
export async function getDashboardData(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<DashboardData> {
  const [stats, recentAlerts] = await Promise.all([
    getDashboardStats(bankId),
    getRecentAlerts(bankId),
  ]);

  return { stats, recentAlerts };
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

/**
 * Obtiene solo el monto total procesado (utilidad rápida).
 *
 * ¿Qué? Extrae `totalAmount` de las stats del Dashboard.
 * ¿Para qué? Cuando un componente solo necesita el monto (ej. card específico).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Monto total procesado.
 */
export async function getTotalProcessedAmount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const stats = await getDashboardStats(bankId);
  return stats.totalAmount;
}

/**
 * Obtiene solo la tasa de fraude (utilidad rápida).
 *
 * ¿Qué? Extrae `fraudRate` de las stats del Dashboard.
 * ¿Para qué? Cuando un componente solo necesita el porcentaje (ej. indicador).
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Tasa de fraude en porcentaje (0-100).
 */
export async function getFraudRate(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const stats = await getDashboardStats(bankId);
  return stats.fraudRate;
}