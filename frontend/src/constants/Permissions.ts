// ¿Qué? Constantes y utilidades de permisos granulares del sistema TriDa.
// ¿Para qué? Centralizar los permisos que controlan qué secciones y acciones
//            puede ver o ejecutar cada rol del sistema (ADMINISTRADOR, ANALISTA, OPERADOR, AUDITOR).
// ¿Impacto? Los permisos aquí definidos se usan en Settings (tab de Roles), Sidebar
//           (menús visibles) y en botones de acción a lo largo de la aplicación.

import type { SystemRole } from './Roles';

// ==============================================================================
// TYPES / INTERFACES
// ==============================================================================


export type PermissionKey =
  | 'dashboard'
  | 'map'
  | 'transactions'
  | 'alerts'
  | 'users'
  | 'analytics'
  | 'settings'
  | 'export'
  | 'manageUsers'
  | 'manageRoles'
  | 'assignBanks'
  | 'manageModel';

export type RolePermissions = Record<PermissionKey, boolean>;

export interface PermissionMetadata {
  label: string;
  category: 'section' | 'action';
  description?: string;
}

// ==============================================================================
// DEFINICIÓN DE PERMISOS
// ==============================================================================

export const PERMISSIONS: Record<PermissionKey, PermissionMetadata> = {
  dashboard: {
    label:       'Dashboard',
    category:    'section',
    description: 'Ver el panel principal con métricas y alertas recientes',
  },
  map: {
    label:       'Mapa en Vivo',
    category:    'section',
    description: 'Ver transacciones en tiempo real sobre el mapa mundial',
  },
  transactions: {
    label:       'Transacciones',
    category:    'section',
    description: 'Ver historial completo de transacciones del sistema',
  },
  alerts: {
    label:       'Alertas',
    category:    'section',
    description: 'Ver y gestionar alertas de fraude detectadas',
  },
  users: {
    label:       'Usuarios',
    category:    'section',
    description: 'Ver clientes bancarios y sus dispositivos registrados',
  },
  analytics: {
    label:       'Analíticas',
    category:    'section',
    description: 'Ver métricas de efectividad del modelo de IA',
  },
  settings: {
    label:       'Configuración',
    category:    'section',
    description: 'Ver el panel de configuración del sistema',
  },

  // Acciones
  export: {
    label:       'Exportar',
    category:    'action',
    description: 'Exportar reportes en CSV, PDF u otros formatos',
  },
  manageUsers: {
    label:       'Gestionar Usuarios',
    category:    'action',
    description: 'Crear, modificar y eliminar cuentas de usuarios del sistema',
  },
  manageRoles: {
    label:       'Gestionar Roles',
    category:    'action',
    description: 'Configurar los permisos asignados a cada rol',
  },
  assignBanks: {
    label:       'Asignar Bancos',
    category:    'action',
    description: 'Asignar bancos a usuarios y gestionar sus accesos',
  },
  manageModel: {
    label:       'Configurar Modelo IA',
    category:    'action',
    description: 'Modificar umbrales, sensibilidad y parámetros del modelo',
  },
};

export const PERMISSION_KEYS: PermissionKey[] = Object.keys(PERMISSIONS) as PermissionKey[];

export const SECTION_PERMISSIONS: PermissionKey[] = PERMISSION_KEYS
  .filter(key => PERMISSIONS[key].category === 'section');

export const ACTION_PERMISSIONS: PermissionKey[] = PERMISSION_KEYS
  .filter(key => PERMISSIONS[key].category === 'action');

// ==============================================================================
// PERMISOS POR DEFECTO POR ROL
// ==============================================================================

export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, RolePermissions> = {
  ADMINISTRADOR: {
    dashboard:    true,
    map:          true,
    transactions: true,
    alerts:       true,
    users:        true,
    analytics:    true,
    settings:     true,
    export:       true,
    manageUsers:  true,
    manageRoles:  true,
    assignBanks:  true,
    manageModel:  true,
  },
  ANALISTA: {
    dashboard:    true,
    map:          true,
    transactions: true,
    alerts:       true,
    users:        true,
    analytics:    true,
    settings:     false,
    export:       true,
    manageUsers:  false,
    manageRoles:  false,
    assignBanks:  false,
    manageModel:  false,
  },
  OPERADOR: {
    dashboard:    true,
    map:          true,
    transactions: true,
    alerts:       true,
    users:        false,
    analytics:    false,
    settings:     false,
    export:       false,
    manageUsers:  false,
    manageRoles:  false,
    assignBanks:  false,
    manageModel:  false,
  },
  AUDITOR: {
    dashboard:    true,
    map:          false,
    transactions: true,
    alerts:       true,
    users:        false,
    analytics:    true,
    settings:     false,
    export:       true,
    manageUsers:  false,
    manageRoles:  false,
    assignBanks:  false,
    manageModel:  false,
  },
};

// ==============================================================================
// FUNCIONES UTILITARIAS
// ==============================================================================

/**
 * Verifica si un rol tiene un permiso específico.
 *
 * ¿Qué? Consulta la matriz de permisos por defecto.
 * ¿Para qué? Determinar dinámicamente si un usuario puede ver una sección
 *            o ejecutar una acción según su rol.
 * ¿Impacto? Se usa en Sidebar (para ocultar items), en botones (para deshabilitarlos)
 *           y en rutas (para redirigir si no tiene acceso).
 *
 * @param role - Rol del usuario (viene de AuthContext).
 * @param permission - Permiso que se quiere verificar.
 * @returns `true` si el rol tiene el permiso, `false` en caso contrario.
 */
export function hasPermission(role: SystemRole, permission: PermissionKey): boolean {
  return DEFAULT_ROLE_PERMISSIONS[role]?.[permission] ?? false;
}

/**
 * Obtiene todos los permisos asignados a un rol.
 *
 * @param role - Rol del usuario.
 * @returns Objeto con todos los permisos y sus valores booleanos.
 */
export function getPermissionsForRole(role: SystemRole): RolePermissions {
  return DEFAULT_ROLE_PERMISSIONS[role] ?? {} as RolePermissions;
}

/**
 * Obtiene solo los permisos de sección activos para un rol.
 *
 * ¿Qué? Filtra los permisos por categoría "section" y retorna solo los activos.
 * ¿Para qué? Determinar qué items del Sidebar debe ver el usuario.
 *
 * @param role - Rol del usuario.
 * @returns Array de claves de secciones a las que tiene acceso.
 */
export function getAllowedSections(role: SystemRole): PermissionKey[] {
  const permissions = getPermissionsForRole(role);
  return SECTION_PERMISSIONS.filter(key => permissions[key]);
}

/**
 * Genera una matriz de permisos vacía (todo en `false`).
 *
 * ¿Qué? Crea un objeto con todas las claves de permisos en `false`.
 * ¿Para qué? Inicializar formularios de configuración de roles.
 *
 * @returns Objeto con todos los permisos deshabilitados.
 */
export function createEmptyPermissions(): RolePermissions {
  return PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as RolePermissions);
}