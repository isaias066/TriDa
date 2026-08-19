// ¿Qué? Constantes y utilidades de roles del sistema TriDa.
// ¿Para qué? Centralizar la definición de roles, permisos y labels que se usan
//            en Sidebar, Settings, ProtectedRoute y componentes de gestión de usuarios.
// ¿Impacto? Los roles deben coincidir exactamente con los definidos en la BD
//           (constraint `chk_rol` en `usuarios_sistemas`).

// ==============================================================================
// TYPES / INTERFACES
// ==============================================================================

export type SystemRole = 'ADMINISTRADOR' | 'ANALISTA' | 'OPERADOR' | 'AUDITOR';

/** Metadatos visuales y descriptivos de cada rol. */
export interface RoleMetadata {
  id: SystemRole;
  label: string;
  shortLabel: string;
  color: string;
  description: string;
}

// ==============================================================================
// DEFINICIÓN DE ROLES
// ==============================================================================


export const ROLES: Record<SystemRole, RoleMetadata> = {
  ADMINISTRADOR: {
    id:          'ADMINISTRADOR',
    label:       'Administrador',
    shortLabel:  'Admin',
    color:       '#E040FB',
    description: 'Acceso total al sistema — configuración y gestión',
  },
  ANALISTA: {
    id:          'ANALISTA',
    label:       'Analista',
    shortLabel:  'Analista',
    color:       '#06B6D4',
    description: 'Revisar, validar y gestionar alertas de fraude',
  },
  OPERADOR: {
    id:          'OPERADOR',
    label:       'Operador',
    shortLabel:  'Operador',
    color:       '#10B981',
    description: 'Monitoreo en tiempo real — solo visualización y escalado',
  },
  AUDITOR: {
    id:          'AUDITOR',
    label:       'Auditor',
    shortLabel:  'Auditor',
    color:       '#F59E0B',
    description: 'Solo lectura de registros, reportes e historial de auditoría',
  },
};

export const ROLES_LIST: RoleMetadata[] = Object.values(ROLES);
export const VALID_ROLE_IDS: SystemRole[] = Object.keys(ROLES) as SystemRole[];

// ==============================================================================
// FUNCIONES UTILITARIAS
// ==============================================================================

/**
 * Obtiene los metadatos de un rol por su ID.
 *
 * ¿Qué? Busca el rol en la constante ROLES.
 * ¿Para qué? Mostrar color, label y descripción sin hardcodear en cada componente.
 * ¿Impacto? Retorna un fallback seguro si el rol no existe.
 *
 * @param roleId - ID del rol tal como viene de la BD.
 * @returns Metadatos del rol, o un fallback con datos por defecto.
 */
export function getRoleMetadata(roleId: string): RoleMetadata {
  const role = ROLES[roleId as SystemRole];

  if (role) return role;

  // Fallback para roles no reconocidos (no debería pasar si la BD está bien).
  return {
    id:          roleId as SystemRole,
    label:       roleId,
    shortLabel:  roleId,
    color:       '#6366F1',
    description: 'Rol no definido',
  };
}

/**
 * Obtiene el color asociado a un rol.
 *
 * @param roleId - ID del rol.
 * @returns Color HEX del rol.
 */
export function getRoleColor(roleId: string): string {
  return getRoleMetadata(roleId).color;
}

/**
 * Obtiene el label corto de un rol (para sidebar, badges).
 *
 * @param roleId - ID del rol.
 * @returns Label corto en español.
 */
export function getRoleShortLabel(roleId: string): string {
  return getRoleMetadata(roleId).shortLabel;
}

/**
 * Verifica si un rol tiene acceso de administrador.
 *
 * ¿Qué? Compara el rol con 'ADMINISTRADOR'.
 * ¿Para qué? Centralizar la lógica que estaba en ProtectedRoute, Sidebar y Settings.
 * ¿Impacto? Determina qué secciones y acciones ve cada usuario.
 *
 * @param roleId - ID del rol.
 * @returns `true` si el rol es ADMINISTRADOR.
 */
export function isAdminRole(roleId: string): boolean {
  return roleId === 'ADMINISTRADOR';
}

/**
 * Verifica si un rol es válido (existe en la BD).
 *
 * @param roleId - ID del rol a verificar.
 * @returns `true` si el rol es uno de los 4 válidos.
 */
export function isValidRole(roleId: string): roleId is SystemRole {
  return VALID_ROLE_IDS.includes(roleId as SystemRole);
}

/**
 * Verifica si un rol tiene permiso para gestionar usuarios.
 *
 * ¿Qué? Solo ADMINISTRADOR puede crear, modificar y eliminar usuarios.
 * ¿Para qué? Controlar visibilidad de tabs en Settings y acciones en tablas de usuarios.
 * ¿Impacto? Si se cambian los permisos aquí, se reflejan en todo el sistema.
 *
 * @param roleId - ID del rol.
 * @returns `true` si el rol puede gestionar usuarios.
 */
export function canManageUsers(roleId: string): boolean {
  return roleId === 'ADMINISTRADOR';
}

/**
 * Verifica si un rol tiene permiso para configurar el modelo de IA.
 *
 * @param roleId - ID del rol.
 * @returns `true` si el rol puede configurar el modelo.
 */
export function canManageModel(roleId: string): boolean {
  return roleId === 'ADMINISTRADOR';
}

/**
 * Verifica si un rol tiene permiso para validar alertas.
 *
 * ¿Qué? Solo ADMINISTRADOR y ANALISTA pueden validar alertas de fraude.
 * ¿Para qué? Controlar botones de clasificación (Fraude, Falso Positivo, etc.).
 *
 * @param roleId - ID del rol.
 * @returns `true` si el rol puede validar alertas.
 */
export function canValidateAlerts(roleId: string): boolean {
  return roleId === 'ADMINISTRADOR' || roleId === 'ANALISTA';
}