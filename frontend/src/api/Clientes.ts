// ¿Qué? Capa API para los endpoints relacionados con clientes bancarios.
// ¿Para qué? Centralizar las consultas de clientes (usuarios finales de los bancos)
//            que estaban dispersas en conexion.js y hacían fetch directo.
// ¿Impacto? Consumido por Dashboard (contador de clientes) y la página Users
//           (listado y filtrado por banco).
//
// NOTE IMPORTANTE: El backend usa dos endpoints distintos para clientes:
//   - GET /api/tareas       → Lista TODOS los clientes (sin filtro)
//   - GET /api/usuarios     → Lista clientes filtrable por banco
//
// El nombre "tareas" es un legacy confuso del backend original. Ambos endpoints
// retornan clientes bancarios (tabla `clientes` en la BD), NO usuarios del sistema.

import { get } from './Client';
import { normalizeBankClients } from '@utils/Normalizers';
import type { BankClient, BankClientRaw, SelectedBankId } from '@app-types';
import { ALL_BANKS_ID } from '@app-types';

// ==============================================================================
// ENDPOINTS
// ==============================================================================

/**
 * Obtiene todos los clientes bancarios del sistema.
 *
 * ¿Qué? Consulta el endpoint `GET /api/tareas` (nombre legacy) y normaliza la respuesta.
 * ¿Para qué? Obtener el listado completo de clientes sin filtro por banco.
 * ¿Impacto? Se usa en el Dashboard para el contador global de clientes.
 *
 * NOTE: A pesar del nombre confuso `/api/tareas`, este endpoint devuelve
 *       clientes bancarios de la tabla `clientes`. No cambiamos el nombre
 *       para no romper el backend actual.
 *
 * @returns Array de clientes bancarios normalizados.
 * @throws ApiError si la consulta falla.
 */
export async function getAllClients(): Promise<BankClient[]> {
  const raw = await get<BankClientRaw[]>('/tareas');
  return normalizeBankClients(raw);
}

/**
 * Obtiene los clientes bancarios filtrados por banco.
 *
 * ¿Qué? Consulta el endpoint `GET /api/usuarios` con filtro opcional por banco.
 * ¿Para qué? Renderizar la lista de clientes en la página Users, respetando
 *            el selector de banco global.
 * ¿Impacto? Cuando `selectedBank === 'all'`, se envía sin filtro y retorna todos.
 *           Cuando es un banco específico, filtra por el código del banco.
 *
 * NOTE: El backend recibe el parámetro como `?banco=<codigo>`. Si el valor
 *       es 'all' (constante ALL_BANKS_ID) o vacío, no se envía el parámetro.
 *
 * @param bankId - Código del banco a filtrar, o 'all' para no filtrar.
 * @returns Array de clientes bancarios normalizados.
 * @throws ApiError si la consulta falla.
 
 */
export async function getClientsByBank(
  bankId: SelectedBankId = ALL_BANKS_ID
): Promise<BankClient[]> {
  const params = bankId !== ALL_BANKS_ID ? { banco: bankId } : undefined;

  const raw = await get<BankClientRaw[]>('/usuarios', params);
  return normalizeBankClients(raw);
}

// ==============================================================================
// UTILIDADES DERIVADAS
// ==============================================================================

/**
 * Obtiene el conteo total de clientes bancarios.
 *
 * ¿Qué? Consulta ligera para obtener solo el número total de clientes.
 * ¿Para qué? Mostrar el contador en el Dashboard sin cargar toda la lista.
 * ¿Impacto? Actualmente hace la consulta completa y cuenta — cuando el backend
 *           tenga un endpoint específico `/api/clientes/count`, esta función
 *           se actualizará para usarlo.
 *
 * @returns Cantidad total de clientes.
 *
 */
export async function getClientsCount(): Promise<number> {
  const clients = await getAllClients();
  return clients.length;
}

/**
 * Obtiene el conteo de clientes activos (con `estado = true`).
 *
 * ¿Qué? Filtra los clientes retornados por su estado.
 * ¿Para qué? Mostrar solo los clientes activos en métricas del Dashboard.
 *
 * @returns Cantidad de clientes activos.
 */
export async function getActiveClientsCount(): Promise<number> {
  const clients = await getAllClients();
  return clients.filter(client => client.status === 'active').length;
}