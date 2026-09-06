// ¿Qué? Capa API unificada para operaciones relacionadas con usuarios (del sistema
//        y clientes bancarios), evitando confusión con los nombres del backend.
// ¿Para qué? Servir como punto único de entrada cuando un componente necesita
//            operar con usuarios sin recordar si son "system users" o "bank clients".
// ¿Impacto? Consumido por Settings (tab de Usuarios) y por hooks relacionados.
//           Re-exporta funciones de Auth.ts y Clientes.ts para conveniencia.
// --- Usuarios INTERNOS del sistema (Admin, Analista, Operador, Auditor) ---
export { getSystemUsers, register as createSystemUser } from './Auth';

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
import { patch } from './Client';

export async function getSystemUsersCount(): Promise<number> {
  const users = await getSystemUsers();
  return users.length;
}

export async function getSystemUsersCountByRole(): Promise<Record<SystemRole, number>> {
  const users = await getSystemUsers();

  const counts: Record<SystemRole, number> = {
    ADMINISTRADOR: 0,
    ANALISTA: 0,
    OPERADOR: 0,
    AUDITOR: 0,
  };

  for (const user of users) {
    if (user.role in counts) {
      counts[user.role]++;
    }
  }

  return counts;
}

export async function getSystemUsersStatusCount(): Promise<{
  active: number;
  inactive: number;
}> {
  const users = await getSystemUsers();

  return {
    active: users.filter((u) => u.status === 'active').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
  };
}

export async function getSystemUsersByRole(role: SystemRole): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter((user) => user.role === role);
}

export async function getActiveSystemUsers(): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter((user) => user.status === 'active');
}

export async function getSystemUsersNeverLogged(): Promise<SystemUser[]> {
  const users = await getSystemUsers();
  return users.filter((user) => user.lastLogin === null);
}

export async function updateSystemUserStatus(idUsuario: number, active: boolean): Promise<any> {
  // El backend espera el payload { estado: boolean } según users.schemas.ts
  return patch(`/users/${idUsuario}/status`, { estado: active });
}

export async function updateSystemUserRole(idUsuario: number, role: string): Promise<any> {
  // El backend espera el payload { rol: string } según users.schemas.ts
  return patch(`/users/${idUsuario}/role`, { rol: role });
}
