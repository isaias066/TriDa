// ¿Qué? Capa API para el endpoint de bancos del sistema TriDa.
// ¿Para qué? Centralizar la consulta al catálogo de bancos monitoreados,
//            que estaba dispersa en context.js, settings.jsx y conexion.js.
// ¿Impacto? Consumido por BankContext (carga inicial), Settings (modal de
//           nuevo usuario) y filtros globales del sistema.

import { get } from './Client';
import { normalizeBanks } from '@utils/Normalizers';
import type { Bank, BankRaw } from '@app-types';

// ==============================================================================
// ENDPOINTS
// ==============================================================================

/**
 * Obtiene el catálogo completo de bancos monitoreados por el sistema.
 *
 * ¿Qué? Consulta el endpoint `GET /api/bancos` y normaliza la respuesta.
 * ¿Para qué? Cargar la lista de bancos en el BankContext al iniciar la app,
 *            y en formularios donde se debe seleccionar un banco.
 * ¿Impacto? Los 12 bancos iniciales de la BD se cargan aquí. Cualquier banco
 *           agregado por el equipo aparecerá automáticamente sin cambios en frontend.
 *
 * NOTE: Este endpoint NO requiere autenticación — es público para poder
 *       mostrar el selector de bancos en la pantalla de login.
 *
 * @returns Array de bancos normalizados con estructura estable.
 * @throws ApiError si el backend no responde.
 */
export async function getBanks(): Promise<Bank[]> {
  const raw = await get<BankRaw[]>('/bancos', undefined, { skipAuth: true });
  return normalizeBanks(raw);
}