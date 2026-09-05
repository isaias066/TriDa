// ¿Qué? Defaults y reglas de notificaciones in-app por rol.
// ¿Para qué? Preferencias de avisos emergentes en pantalla según criticidad y rol.
// ¿Impacto? Settings (NotificationsTab) y emisor de toasts del sistema.

import type { SystemRole } from '@constants/Roles';
import type { RiskLevel } from '@constants/Risk';

export type NotificationChannel = 'push';

export interface NotificationPreferences {
  channels: {
    push: boolean; // Habilita/deshabilita pop-ups emergentes en pantalla
  };
  levels: Record<RiskLevel, boolean>;
}

/** Preferencias de fábrica si no hay sesión. */
export const NOTIFICATION_PREFS_FALLBACK: NotificationPreferences = {
  channels: { push: true },
  levels: { critical: true, high: true, medium: false, low: false },
};

/**
 * Defaults iniciales por rol (configurables por el usuario).
 */
export const ROLE_NOTIFICATION_DEFAULTS: Record<SystemRole, NotificationPreferences> = {
  ADMINISTRADOR: {
    channels: { push: true },
    levels: { critical: true, high: true, medium: true, low: false },
  },
  ANALISTA: {
    channels: { push: true },
    levels: { critical: true, high: true, medium: true, low: false },
  },
  OPERADOR: {
    channels: { push: true },
    levels: { critical: true, high: true, medium: false, low: false },
  },
  AUDITOR: {
    channels: { push: true },
    levels: { critical: true, high: false, medium: false, low: false },
  },
};

export function storageKeyForUser(userId: string | number): string {
  return `trida:notification-prefs:${userId}`;
}

export function getDefaultPrefsForRole(role?: SystemRole | null): NotificationPreferences {
  if (!role) return structuredClone(NOTIFICATION_PREFS_FALLBACK);
  return structuredClone(ROLE_NOTIFICATION_DEFAULTS[role] ?? NOTIFICATION_PREFS_FALLBACK);
}

export function mergeNotificationPrefs(
  base: NotificationPreferences,
  partial?: Partial<{
    channels: Partial<Record<NotificationChannel, boolean>>;
    levels: Partial<Record<RiskLevel, boolean>>;
  }>,
): NotificationPreferences {
  return {
    channels: { ...base.channels, ...partial?.channels },
    levels: { ...base.levels, ...partial?.levels },
  };
}

/** Determina si una alerta de cierto nivel debe emitir un Pop-up emergente. */
export function shouldNotifyLevel(prefs: NotificationPreferences, level: RiskLevel): boolean {
  return Boolean(prefs.channels.push && prefs.levels[level]);
}
