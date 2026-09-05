// ¿Qué? Hook personalizado para gestionar las preferencias de notificaciones por usuario.
// ¿Para qué? Persistir las opciones de pop-ups en localStorage con fallbacks por rol.
// ¿Impacto? Consumido por NotificationsTab y emisores de alertas emergentes.

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import {
  getDefaultPrefsForRole,
  mergeNotificationPrefs,
  storageKeyForUser,
  type NotificationChannel,
  type NotificationPreferences,
} from '@constants/Notifications';
import type { RiskLevel } from '@constants/Risk';

function readStored(userId: string | number, role: Parameters<typeof getDefaultPrefsForRole>[0]) {
  const defaults = getDefaultPrefsForRole(role);
  try {
    const raw = localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return mergeNotificationPrefs(defaults, parsed);
  } catch {
    return defaults;
  }
}

export function useNotificationPrefs() {
  const { user, isAuthenticated } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    getDefaultPrefsForRole(user?.rol),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setPrefs(getDefaultPrefsForRole(null));
      setHydrated(true);
      return;
    }
    setPrefs(readStored(user.id, user.rol));
    setHydrated(true);
  }, [isAuthenticated, user]);

  const persist = useCallback(
    (next: NotificationPreferences) => {
      setPrefs(next);
      if (user?.id != null) {
        localStorage.setItem(storageKeyForUser(user.id), JSON.stringify(next));
      }
    },
    [user?.id],
  );

  const setChannel = useCallback(
    (channel: NotificationChannel, enabled: boolean) => {
      persist(mergeNotificationPrefs(prefs, { channels: { [channel]: enabled } }));
    },
    [persist, prefs],
  );

  const setLevel = useCallback(
    (level: RiskLevel, enabled: boolean) => {
      persist(mergeNotificationPrefs(prefs, { levels: { [level]: enabled } }));
    },
    [persist, prefs],
  );

  const resetToRoleDefaults = useCallback(() => {
    const defaults = getDefaultPrefsForRole(user?.rol);
    persist(defaults);
  }, [persist, user?.rol]);

  return {
    prefs,
    hydrated,
    setChannel,
    setLevel,
    resetToRoleDefaults,
    setPrefs: persist,
  };
}
