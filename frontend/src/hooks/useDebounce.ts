// ¿Qué? Hook para retrasar la actualización de un valor hasta que pase un tiempo
//        determinado sin cambios (patrón "debounce").
// ¿Para qué? Optimizar operaciones costosas como búsquedas en tablas grandes,
//            llamadas a APIs de autocompletado y filtros en tiempo real.
// ¿Impacto? Reduce drásticamente el número de operaciones ejecutadas mientras
//           el usuario escribe, mejorando rendimiento y UX.

import { useCallback, useEffect, useRef, useState } from 'react';

// ==============================================================================
// CONSTANTES
// ==============================================================================

export const DEFAULT_DEBOUNCE_DELAY = 300;

// ==============================================================================
// HOOK PRINCIPAL — Debounce de valores
// ==============================================================================

/**
 * Retrasa la actualización de un valor hasta que pase un tiempo sin cambios.
 *
 * ¿Qué? Retorna una copia del valor original que solo se actualiza después
 *        de que el valor original deja de cambiar por el delay especificado.
 * ¿Para qué? Ejemplo típico: campo de búsqueda que dispara un fetch al backend.
 *            Sin debounce, cada tecla dispararía una request. Con debounce,
 *            se dispara solo cuando el usuario deja de escribir.
 * ¿Impacto? Ahorra requests innecesarios y renders costosos.
 *
 * @param value - Valor a "debouncear".
 * @param delay - Tiempo en ms sin cambios antes de actualizar. Default: 300ms.
 * @returns Valor debounced (actualizado con retraso).
 *
 *
 */
export function useDebounce<T>(
  value: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Crear el timer que actualizará el valor debounced
    const timerId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancela el timer si el valor cambia antes de que se cumpla el delay
    return () => {
      window.clearTimeout(timerId);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ==============================================================================
// HOOK COMPLEMENTARIO — Debounce de callbacks
// ==============================================================================

/**
 * Retorna una versión debounced de un callback.
 *
 * ¿Qué? Envuelve una función para que se ejecute solo después de que pase
 *        el delay sin ser llamada nuevamente.
 * ¿Para qué? Cuando se necesita debouncear una acción imperativa (no un valor).
 * ¿Impacto? Útil para handlers de scroll, resize o eventos rápidos.
 *
 * @param callback - Función a debouncear.
 * @param delay - Tiempo en ms sin llamadas antes de ejecutar. Default: 300ms.
 * @returns Función debounced que puede llamarse igual que la original.
 *
 */

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number = DEFAULT_DEBOUNCE_DELAY
): (...args: TArgs) => void {
  const timerRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Mantener la referencia al callback actualizada sin causar re-renders
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: TArgs) => {
      // Cancelar cualquier timer previo
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      // Programar nueva ejecución
      timerRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay]
  );
}