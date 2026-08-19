// ¿Qué? Capa API para todos los endpoints relacionados con alertas de fraude.
// ¿Para qué? Centralizar las consultas de alertas que estaban dispersas en alerts.jsx,
//            dashboards.jsx y conexion.js, aplicando normalización consistente.
// ¿Impacto? Consumido por AlertsPage (lista principal), DashboardPage (alertas
//           recientes) y Sidebar (contador de alertas críticas).

import { get } from './Client';
import { normalizeAlerts, normalizeRecentAlerts } from '@utils/Normalizers';
import type {
  Alert,
  AlertRaw,
  RecentAlert,
  AlertCriticality,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene todas las alertas del sistema, opcionalmente filtradas por banco.
 *
 * ¿Qué? Consulta el endpoint `GET /api/alertas` y normaliza la respuesta.
 * ¿Para qué? Reemplaza `getAlertas()` de `services/conexion.js` y el fetch directo
 *            de `alerts.jsx`.
 * ¿Impacto? Fuente única de verdad para el módulo de Alertas.
 *
 * NOTE: Actualmente el backend NO filtra por banco en este endpoint (ignora el
 *       parámetro). Se envía igualmente para que funcione automáticamente cuando
 *       el backend se actualice.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para no filtrar.
 * @returns Array de alertas normalizadas con estructura completa.
 * @throws ApiError si la consulta falla.
 *
 */
export async function getAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Alert[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<AlertRaw[]>('/alertas', params);
  return normalizeAlerts(raw);
}

/**
 * Obtiene las alertas recientes en formato simplificado para el Dashboard.
 *
 * ¿Qué? Consulta el endpoint `GET /api/dashboard/alertas-recientes`.
 * ¿Para qué? Renderizar el panel "Alertas Recientes" del Dashboard con datos
 *            mínimos (menos payload que la lista completa).
 * ¿Impacto? Se llama al cargar el Dashboard y al cambiar el banco seleccionado.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de alertas simplificadas para el panel del Dashboard.
 *
 */
export async function getRecentAlerts(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<RecentAlert[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<AlertRaw[]>('/dashboard/alertas-recientes', params);
  return normalizeRecentAlerts(raw);
}

// ==============================================================================
// FUNCIONES DERIVADAS (contadores por nivel)
// ==============================================================================

/**
 * Obtiene el conteo total de alertas.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad total de alertas.
 */
export async function getAlertsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const alerts = await getAlerts(bankId);
  return alerts.length;
}

/**
 * Obtiene el conteo de alertas filtrado por nivel de criticidad.
 *
 * ¿Qué? Filtra las alertas por el `alertLevel` indicado y las cuenta.
 * ¿Para qué? Mostrar chips de resumen en el header de AlertsPage
 *            (ej. "Críticas: 5", "Altas: 12", etc.).
 *
 * @param level - Nivel de criticidad a contar.
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad de alertas del nivel indicado.
 *
 */
export async function getAlertsCountByLevel(
  level: AlertCriticality,
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const alerts = await getAlerts(bankId);
  return alerts.filter(alert => alert.alertLevel === level).length;
}

/**
 * Obtiene el conteo desglosado de alertas por nivel.
 *
 * ¿Qué? Retorna un objeto con conteos por cada nivel de criticidad.
 * ¿Para qué? Renderizar múltiples contadores en una sola consulta,
 *            evitando llamar 4 veces a `getAlertsCountByLevel()`.
 * ¿Impacto? Consulta única al backend en lugar de 4 separadas.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con conteos por nivel: { low, medium, high, critical }.
 */
export async function getAlertsCountsByLevel(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Record<AlertCriticality, number>> {
  const alerts = await getAlerts(bankId);

  return {
    low:      alerts.filter(a => a.alertLevel === 'low').length,
    medium:   alerts.filter(a => a.alertLevel === 'medium').length,
    high:     alerts.filter(a => a.alertLevel === 'high').length,
    critical: alerts.filter(a => a.alertLevel === 'critical').length,
  };
}

/**
 * Obtiene el conteo de alertas activas (no resueltas ni descartadas).
 *
 * ¿Qué? Filtra las alertas con `alertStatus === 'active'`.
 * ¿Para qué? Mostrar en el badge del Sidebar solo alertas que requieren atención.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad de alertas activas.
 */
export async function getActiveAlertsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const alerts = await getAlerts(bankId);
  return alerts.filter(alert => alert.alertStatus === 'active').length;
}