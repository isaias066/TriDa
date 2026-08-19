// ¿Qué? Capa API para todos los endpoints relacionados con transacciones bancarias.
// ¿Para qué? Centralizar las consultas de transacciones que estaban duplicadas
//            en 6+ componentes del proyecto (Alerts, Analytics, Dashboard, Layout,
//            Sidebar, Transactions).
// ¿Impacto? Es el endpoint más consultado del sistema — cualquier cambio afecta
//           a la mayoría de páginas del dashboard.

import { get } from './Client';
import { normalizeTransactions } from '@utils/Normalizers';
import type { Transaction, TransactionRaw, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene todas las transacciones, opcionalmente filtradas por banco.
 *
 * ¿Qué? Consulta el endpoint `GET /api/transacciones` con filtro opcional.
 * ¿Para qué? Reemplaza `getTransacciones()` de `services/conexion.js` y todos
 *            los fetch directos dispersos en el proyecto.
 * ¿Impacto? Es la fuente única de verdad para todas las transacciones del sistema.
 *
 * NOTE: El backend recibe el filtro como `?banco=<codigo>`. Si el valor es 'all'
 *       o no se especifica, retorna todas las transacciones sin filtrar.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para no filtrar.
 * @returns Array de transacciones normalizadas.
 * @throws ApiError si la consulta falla.
 */
export async function getTransactions(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Transaction[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<TransactionRaw[]>('/transacciones', params);
  return normalizeTransactions(raw);
}

// ==============================================================================
// FUNCIONES DERIVADAS (contadores y métricas)
// ==============================================================================

/**
 * Obtiene el conteo total de transacciones filtradas por banco.
 *
 * ¿Qué? Consulta ligera para métricas del Dashboard y Sidebar.
 * ¿Para qué? Mostrar el número de transacciones sin necesidad de renderizar
 *            toda la lista.
 * ¿Impacto? Actualmente hace la consulta completa y cuenta el array.
 *           Cuando el backend tenga endpoint `/api/transacciones/count`,
 *           esta función se actualizará para usarlo.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad total de transacciones.
 */
export async function getTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.length;
}

/**
 * Obtiene el conteo de transacciones bloqueadas por el sistema.
 *
 * ¿Qué? Filtra las transacciones con estado 'blocked'.
 * ¿Para qué? Mostrar el indicador de "Transacciones bloqueadas" en el Dashboard.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad de transacciones bloqueadas.
 */
export async function getBlockedTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter(tx => tx.status === 'blocked').length;
}

/**
 * Obtiene el conteo de transacciones confirmadas como fraude real.
 *
 * ¿Qué? Filtra las transacciones donde `isFraud === true`.
 * ¿Para qué? Métrica clave para el reporte de efectividad del modelo IA.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad de fraudes confirmados.
 */
export async function getFraudTransactionsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter(tx => tx.isFraud).length;
}

/**
 * Calcula el monto total procesado (suma de todos los amounts).
 *
 * ¿Qué? Suma el campo `amount` de todas las transacciones filtradas.
 * ¿Para qué? Mostrar el volumen total de operaciones en el Dashboard.
 * ¿Impacto? El valor retornado está en COP por defecto (o la moneda predominante).
 *
 * NOTE: Para reportes multi-moneda se debería agrupar por currency.
 *       Actualmente asume moneda uniforme.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Monto total como número.
 */
export async function getTotalAmount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

/**
 * Cuenta las alertas críticas y altas para el badge del Sidebar.
 *
 * ¿Qué? Filtra las transacciones con nivel de riesgo 'critical' o 'high'.
 * ¿Para qué? Mostrar el número en el badge rojo del ítem "Alertas" del Sidebar.
 * ¿Impacto? Reemplaza el fetch directo que estaba duplicado en Layout y Sidebar.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad de transacciones con alerta crítica o alta.
 */
export async function getCriticalAlertsCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const transactions = await getTransactions(bankId);
  return transactions.filter(
    tx => tx.alertLevel === 'critical' || tx.alertLevel === 'high'
  ).length;
}