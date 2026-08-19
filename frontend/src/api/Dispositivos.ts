// ¿Qué? Capa API para todos los endpoints relacionados con dispositivos registrados.
// ¿Para qué? Centralizar las consultas de dispositivos que usan los clientes
//            para realizar transacciones (móviles, computadoras, POS, ATMs).
// ¿Impacto? Consumido principalmente por la página Users (listado y agrupación
//           por cliente) y para análisis de riesgo por dispositivo.

import { get } from './Client';
import { normalizeDevices } from '@utils/Normalizers';
import type {
  Device,
  DeviceRaw,
  DeviceCategory,
  DevicesByClient,
  DeviceStats,
  SelectedBankId,
} from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// ENDPOINTS PRINCIPALES
// ==============================================================================

/**
 * Obtiene todos los dispositivos registrados, opcionalmente filtrados por banco.
 *
 * ¿Qué? Consulta el endpoint `GET /api/dispositivos` y normaliza la respuesta.
 * ¿Para qué? Reemplaza `getDispositivos()` de `services/conexion.js` y
 *            centraliza la consulta con normalización estable.
 * ¿Impacto? Fuente única de verdad para todos los dispositivos del sistema.
 *
 * NOTE: El backend recibe el filtro como `?banco=<codigo>`. Si el valor es 'all'
 *       o no se especifica, retorna todos los dispositivos.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para no filtrar.
 * @returns Array de dispositivos normalizados.
 * @throws ApiError si la consulta falla.
 */
export async function getDevices(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Device[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<DeviceRaw[]>('/dispositivos', params);
  return normalizeDevices(raw);
}

// ==============================================================================
// FUNCIONES DERIVADAS (agrupación y conteo)
// ==============================================================================

/**
 * Obtiene el conteo total de dispositivos.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Cantidad total de dispositivos.
 */
export async function getDevicesCount(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<number> {
  const devices = await getDevices(bankId);
  return devices.length;
}

/**
 * Agrupa los dispositivos por ID de cliente.
 *
 * ¿Qué? Retorna un Map<clientId, Device[]> para acceso eficiente.
 * ¿Para qué? Renderizar los dispositivos dentro de la card de cada cliente
 *            en la página Users al expandir un cliente.
 * ¿Impacto? Reemplaza la lógica que estaba en `users.jsx`:
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Map donde la clave es el ID del cliente y el valor es un array de sus dispositivos.
 *
 */
export async function getDevicesByClient(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<DevicesByClient> {
  const devices = await getDevices(bankId);
  const grouped: DevicesByClient = new Map();

  for (const device of devices) {
    const list = grouped.get(device.clientId) ?? [];
    list.push(device);
    grouped.set(device.clientId, list);
  }

  return grouped;
}

/**
 * Obtiene el conteo de dispositivos por categoría.
 *
 * ¿Qué? Agrupa y cuenta dispositivos por tipo (mobile, desktop, tablet, etc.).
 * ¿Para qué? Renderizar gráficos de distribución en Analytics.
 * ¿Impacto? Retorna un objeto con todas las categorías, incluso las vacías.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con conteos por categoría.
 */
export async function getDevicesCountByCategory(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Record<DeviceCategory, number>> {
  const devices = await getDevices(bankId);

  const counts: Record<DeviceCategory, number> = {
    mobile:  0,
    desktop: 0,
    tablet:  0,
    pos:     0,
    atm:     0,
    unknown: 0,
  };

  for (const device of devices) {
    counts[device.category]++;
  }

  return counts;
}

/**
 * Obtiene estadísticas completas de dispositivos.
 *
 * ¿Qué? Consulta única que retorna todas las métricas de dispositivos.
 * ¿Para qué? Renderizar cards de estadísticas en Analytics con una sola llamada
 *            en lugar de múltiples consultas separadas.
 * ¿Impacto? Optimiza el consumo de red y evita renders parciales.
 *
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Objeto con `total`, `byCategory` y `uniqueClients`.
 */
export async function getDeviceStats(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<DeviceStats> {
  const devices = await getDevices(bankId);

  const byCategory: Record<DeviceCategory, number> = {
    mobile:  0,
    desktop: 0,
    tablet:  0,
    pos:     0,
    atm:     0,
    unknown: 0,
  };

  const uniqueClientIds = new Set<number>();

  for (const device of devices) {
    byCategory[device.category]++;
    uniqueClientIds.add(device.clientId);
  }

  return {
    total:         devices.length,
    byCategory,
    uniqueClients: uniqueClientIds.size,
  };
}

/**
 * Obtiene los dispositivos filtrados por categoría específica.
 *
 * ¿Qué? Filtra los dispositivos por tipo (móvil, desktop, etc.).
 * ¿Para qué? Renderizar vistas filtradas por tipo en Users.
 *
 * @param category - Categoría a filtrar.
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de dispositivos de la categoría indicada.
 */
export async function getDevicesByCategory(
  category: DeviceCategory,
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Device[]> {
  const devices = await getDevices(bankId);
  return devices.filter(device => device.category === category);
}

/**
 * Detecta dispositivos nuevos (menos de N días desde su primer uso).
 *
 * ¿Qué? Filtra los dispositivos registrados recientemente.
 * ¿Para qué? Alertar sobre dispositivos nuevos que pueden ser sospechosos
 *            en análisis de fraude.
 *
 * @param daysThreshold - Días desde el primer uso para considerar "nuevo" (default: 7).
 * @param bankId - Código del banco a filtrar, o 'all'.
 * @returns Array de dispositivos nuevos.
 */
export async function getNewDevices(
  daysThreshold: number = 7,
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<Device[]> {
  const devices = await getDevices(bankId);
  const now = Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

  return devices.filter(device => {
    if (!device.firstUsedAt) return false;
    const firstUse = new Date(device.firstUsedAt).getTime();
    return (now - firstUse) < thresholdMs;
  });
}