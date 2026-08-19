// ¿Qué? Constantes de navegación del sistema TriDa: menús principales, tabs y rutas.
// ¿Para qué? Centralizar la definición del Sidebar, tabs de Settings y rutas de la aplicación
//            para evitar duplicación entre Sidebar, Layout y App.
// ¿Impacto? Cualquier cambio en la navegación se hace aquí y se refleja en toda la app.

import {
  LayoutDashboard,
  Globe,
  Activity,
  Bell,
  Users,
  BarChart3,
  Settings,
  User,
  UserPlus,
  Brain,
  Lock,
  Settings as SettingsIcon,
  type LucideIcon,
} from 'lucide-react';

import type { PermissionKey } from './Permissions';

// ==============================================================================
// TYPES / INTERFACES
// ==============================================================================

export type NavItemKey =
  | 'dashboard'
  | 'map'
  | 'transactions'
  | 'alerts'
  | 'users'
  | 'analytics'
  | 'settings';

export interface NavItem {
  id: NavItemKey;
  label: string;
  icon: LucideIcon;
  path: string;
  permission?: PermissionKey;
  showAlertBadge?: boolean;
  showLiveIndicator?: boolean;
}

export type SettingsTabKey =
  | 'profile'
  | 'users'
  | 'model'
  | 'notifications'
  | 'roles'
  | 'system';

export interface SettingsTab {
  id: SettingsTabKey;
  label: string;
  icon: LucideIcon;
  permission?: PermissionKey;
}

// ==============================================================================
// NAVEGACIÓN PRINCIPAL (SIDEBAR)
// ==============================================================================


export const NAV_ITEMS: NavItem[] = [
  {
    id:         'dashboard',
    label:      'Dashboard',
    icon:       LayoutDashboard,
    path:       '/dashboard',
    permission: 'dashboard',
  },
  {
    id:                'map',
    label:             'Mapa en Vivo',
    icon:              Globe,
    path:              '/map',
    permission:        'map',
    showLiveIndicator: true,
  },
  {
    id:         'transactions',
    label:      'Transacciones',
    icon:       Activity,
    path:       '/transactions',
    permission: 'transactions',
  },
  {
    id:             'alerts',
    label:          'Alertas',
    icon:           Bell,
    path:           '/alerts',
    permission:     'alerts',
    showAlertBadge: true,
  },
  {
    id:         'users',
    label:      'Usuarios',
    icon:       Users,
    path:       '/users',
    permission: 'users',
  },
  {
    id:         'analytics',
    label:      'Analíticas',
    icon:       BarChart3,
    path:       '/analytics',
    permission: 'analytics',
  },
  {
    id:         'settings',
    label:      'Configuración',
    icon:       Settings,
    path:       '/settings',
    permission: 'settings',
  },
];

export const NAV_ITEMS_MAP: Record<NavItemKey, NavItem> = NAV_ITEMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<NavItemKey, NavItem>
);

// ==============================================================================
// TABS DE LA PÁGINA DE CONFIGURACIÓN
// ==============================================================================

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id:    'profile',
    label: 'Mi Perfil',
    icon:  User,
  },
  {
    id:         'users',
    label:      'Usuarios',
    icon:       UserPlus,
    permission: 'manageUsers',
  },
  {
    id:         'model',
    label:      'Modelo IA',
    icon:       Brain,
    permission: 'manageModel',
  },
  {
    id:    'notifications',
    label: 'Notificaciones',
    icon:  Bell,
  },
  {
    id:         'roles',
    label:      'Roles y Permisos',
    icon:       Lock,
    permission: 'manageRoles',
  },
  {
    id:    'system',
    label: 'Sistema',
    icon:  SettingsIcon,
  },
];

export const SETTINGS_TABS_MAP: Record<SettingsTabKey, SettingsTab> = SETTINGS_TABS.reduce(
  (acc, tab) => {
    acc[tab.id] = tab;
    return acc;
  },
  {} as Record<SettingsTabKey, SettingsTab>
);

// ==============================================================================
// RUTAS PÚBLICAS Y PROTEGIDAS
// ==============================================================================


export const PUBLIC_ROUTES = {
  LOGIN:           '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
} as const;


export const PROTECTED_ROUTES = {
  DASHBOARD:    '/dashboard',
  MAP:          '/map',
  TRANSACTIONS: '/transactions',
  ALERTS:       '/alerts',
  USERS:        '/users',
  ANALYTICS:    '/analytics',
  SETTINGS:     '/settings',
} as const;

export const DEFAULT_AUTHENTICATED_ROUTE = PROTECTED_ROUTES.DASHBOARD;

export const DEFAULT_LOGOUT_ROUTE = PUBLIC_ROUTES.LOGIN;

// ==============================================================================
// FUNCIONES UTILITARIAS
// ==============================================================================

/**
 * Obtiene un item de navegación por su clave.
 *
 * @param key - Clave del item de navegación.
 * @returns Item de navegación o `undefined` si no existe.
 */
export function getNavItem(key: NavItemKey): NavItem | undefined {
  return NAV_ITEMS_MAP[key];
}

/**
 * Obtiene un tab de settings por su clave.
 *
 * @param key - Clave del tab.
 * @returns Tab de settings o `undefined` si no existe.
 */
export function getSettingsTab(key: SettingsTabKey): SettingsTab | undefined {
  return SETTINGS_TABS_MAP[key];
}

/**
 * Verifica si una ruta es pública (no requiere autenticación).
 *
 * @param path - Ruta a verificar.
 * @returns `true` si la ruta es pública.
 */
export function isPublicRoute(path: string): boolean {
  return Object.values(PUBLIC_ROUTES).includes(path as never);
}

/**
 * Verifica si una ruta es protegida (requiere autenticación).
 *
 * @param path - Ruta a verificar.
 * @returns `true` si la ruta es protegida.
 */
export function isProtectedRoute(path: string): boolean {
  return Object.values(PROTECTED_ROUTES).includes(path as never);
}