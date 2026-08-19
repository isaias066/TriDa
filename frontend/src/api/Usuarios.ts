// ¿Qué? Capa API unificada para operaciones relacionadas con usuarios (del sistema
//        y clientes bancarios), evitando confusión con los nombres del backend.
// ¿Para qué? Servir como punto único de entrada cuando un componente necesita
//            operar con usuarios sin recordar si son "system users" o "bank clients".
// ¿Impacto? Consumido por Settings (tab de Usuarios) y por hooks relacionados.
//           Re-exporta funciones de Auth.ts y Clientes.ts para conveniencia.

// ==============================================================================
// RE-EXPORTACIÓN DE FUNCIONES YA DEFINIDAS
// ==============================================================================
// Estas funciones YA existen en otros archivos. Se re-exportan aquí para que
// los componentes puedan importar TODO lo relacionado a "usuarios" desde un
// solo lugar (@api/Usuarios), simplificando los imports.

// --- Usuarios INTERNOS del sistema (Admin, Analista, Operador, Auditor) ---
export {
  getSystemUsers,
  register as createSystemUser,
} from './Auth';

// --- CLIENTES bancarios (usuarios finales de los bancos) ---
export {
  getAllClients,
  getClientsByBank,
  getClientsCount,
  getActiveClientsCount,
} from './Clientes';

// ==============================================================================
// HELPERS DERIVADOS PARA USUARIOS DEL SISTEMA
// ==============================================================================

import { getSystemUsers } from './Auth';
import type { SystemUser } from '@app-types';
import type { SystemRole } from '@constants/Roles';

/**
 * Obtiene el conteo de usuarios del sistema.
 *
 * ¿Qué? Consulta ligera para métricas.
 * ¿Para qué? Mostrar en Settings el total de usuarios registrados.
 *
 * @returns Cantidad total de usuarios del sistema.
 */
export async function getSystemUsersCount(): Promise<number> {
  const users = await getSystemUsers();
  return users.length;
}

/**
 * Obtiene el conteo de usuarios del sistema por rol.
 *
 * ¿Qué? Agrupa y cuenta usuarios por rol asignado.
 * ¿Para qué? Mostrar distribución de roles en Settings o Analytics interno.
 *
 * @returns Objeto con conteos por rol.
 *
 */
export async function getSystemUsersCountByRole(): Promise<Record<SystemRole, number>> {
  const users = await getSystemUsers();

  const counts: Record<SystemRole, number> = {
    ADMINISTRADOR: 0,
    ANALISTA:      0,
    OPERADOR:      0,
    AUDITOR:       0,
  };

  for (const user of users) {
    if (user.role in counts) {
      counts[user.role]++;
    }
  }

  return counts;
}

/**
 * Obtiene el conteo de usuarios activos vs inactivos.
 *
 * @returns Objeto con `active` e `inactive`.
 *
 */
export async function getSystemUsersStatusCount(): Promise<{
  active:   number;
  inactive: number;
}> {
  const users = await getSystemUsers();

  return {
    active:   users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
  };
}

/**
 * Filtra usuarios del sistema por rol específico.
 *
 * @param role - Rol a filtrar.
 * @returns Array de usuarios que tienen el rol indicado.
 */
export async function getSystemUsersByRole(role: SystemRole): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter(user => user.role === role);
}

/**
 * Obtiene solo los usuarios activos del sistema.
 *
 * ¿Qué? Filtra los usuarios con `status === 'active'`.
 * ¿Para qué? Mostrar solo usuarios que pueden hacer login actualmente.
 *
 * @returns Array de usuarios activos.
 */
export async function getActiveSystemUsers(): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter(user => user.status === 'active');
}

/**
 * Obtiene los usuarios del sistema que nunca han hecho login.
 *
 * ¿Qué? Filtra los usuarios con `lastLogin === null`.
 * ¿Para qué? Identificar usuarios pendientes de activación o inactivos
 *            que nunca ingresaron al sistema.
 *
 * @returns Array de usuarios sin acceso previo.
 */
export async function getSystemUsersNeverLogged(): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter(user => user.lastLogin === null);
}