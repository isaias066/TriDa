// ¿Qué? Hook que sincroniza un estado de React con localStorage de forma reactiva.
// ¿Para qué? Persistir preferencias del usuario (tema, filtros, layout) entre sesiones
//            y sincronizar cambios entre pestañas abiertas del navegador.
// ¿Impacto? Simplifica la persistencia y evita el patrón repetitivo de leer/escribir
//           localStorage manualmente en cada contexto o componente.

import { useCallback, useEffect, useState } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

/** Función setter con misma API que `useState`. */
export type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export interface UseLocalStorageOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
  syncAcrossTabs?: boolean;
}

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Verifica si localStorage está disponible.
 *
 * ¿Qué? Intenta escribir y leer un valor de prueba.
 * ¿Para qué? Manejar el caso de navegadores con localStorage deshabilitado
 *            (ej: Safari en modo incógnito estricto).
 * ¿Impacto? Si retorna false, el hook opera solo en memoria (sin persistencia).
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__trida_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lee un valor de localStorage y lo deserializa.
 *
 * @param key - Clave a leer.
 * @param deserialize - Función de deserialización.
 * @param fallback - Valor a retornar si no existe o falla.
 * @returns Valor deserializado o fallback.
 */
function readFromStorage<T>(
  key: string,
  deserialize: (value: string) => T,
  fallback: T
): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return deserialize(raw);
  } catch {
    return fallback;
  }
}

/**
 * Escribe un valor en localStorage tras serializarlo.
 *
 * @param key - Clave a escribir.
 * @param value - Valor a guardar.
 * @param serialize - Función de serialización.
 */
function writeToStorage<T>(
  key: string,
  value: T,
  serialize: (value: T) => string
): void {
  try {
    localStorage.setItem(key, serialize(value));
  } catch {
    // Silenciar errores (quota excedida, localStorage bloqueado, etc.)
  }
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Sincroniza un estado con localStorage de forma reactiva.
 *
 * ¿Qué? API idéntica a `useState` pero el valor se persiste en localStorage
 *        y se sincroniza entre pestañas abiertas.
 * ¿Para qué? Persistir preferencias de UI, filtros de tablas, configuración,
 *            sin necesidad de escribir manualmente `localStorage.setItem`.
 * ¿Impacto? Los cambios se propagan automáticamente a otras pestañas del navegador
 *           (mediante el evento `storage` del navegador).
 *
 * @param key - Clave única en localStorage.
 * @param initialValue - Valor inicial si no hay nada guardado.
 * @param options - Opciones de serialización y sincronización.
 * @returns Tupla `[value, setValue]` similar a `useState`.
 *
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, SetValue<T>] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse as (value: string) => T,
    syncAcrossTabs = true,
  } = options;

  // Verificar disponibilidad de localStorage una sola vez
  const storageAvailable = isLocalStorageAvailable();

  // Estado inicial: leer de localStorage o usar el valor inicial
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) return initialValue;
    return readFromStorage(key, deserialize, initialValue);
  });

  const setValue: SetValue<T> = useCallback(
    (value) => {
      setStoredValue(prev => {
        const nextValue =
          typeof value === 'function'
            ? (value as (prev: T) => T)(prev)
            : value;

        if (storageAvailable) {
          writeToStorage(key, nextValue, serialize);
        }

        return nextValue;
      });
    },
    [key, serialize, storageAvailable]
  );

  // ==============================================================================
  // SINCRONIZACIÓN ENTRE PESTAÑAS
  // ==============================================================================

  useEffect(() => {
    if (!storageAvailable || !syncAcrossTabs) return;

    /**
     * Handler del evento 'storage' del navegador.
     *
     * ¿Qué? Se dispara cuando OTRA pestaña modifica localStorage.
     * ¿Para qué? Mantener sincronizadas todas las pestañas abiertas.
     * ¿Impacto? Si el usuario cambia el tema en una pestaña, todas se actualizan.
     *
     * NOTE: Este evento NO se dispara en la pestaña que hizo el cambio.
     */
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== key) return;

      // Si el valor fue eliminado, restaurar el inicial
      if (event.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      // Deserializar el nuevo valor y actualizarlo
      try {
        const newValue = deserialize(event.newValue);
        setStoredValue(newValue);
      } catch {
        // Si el valor es inválido, ignorar
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue, deserialize, storageAvailable, syncAcrossTabs]);

  return [storedValue, setValue];
}