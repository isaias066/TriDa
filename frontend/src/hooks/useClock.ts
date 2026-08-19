// ¿Qué? Hook para mantener un reloj en tiempo real que se actualiza cada segundo.
// ¿Para qué? Reemplazar el código repetido en Sidebar y Dashboard que mantenían
//            un intervalo de setInterval para actualizar la hora.
// ¿Impacto? Optimiza el rendimiento al pausar automáticamente cuando la pestaña
//           está oculta, y centraliza la lógica de tiempo real de la app.

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatTime, formatDate, formatDateTime } from '@utils/Formatters';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_INTERVAL_MS = 1000;

// ==============================================================================
// TYPES
// ==============================================================================

/** Configuración opcional del hook. */
export interface UseClockOptions {
  intervalMs?: number;
  enabled?: boolean;
  pauseWhenHidden?: boolean;
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Mantiene un objeto Date actualizado en intervalos regulares.
 *
 * ¿Qué? Retorna la hora actual como objeto Date que se refresca cada segundo
 *        (o el intervalo configurado).
 * ¿Para qué? Mostrar relojes en tiempo real (Sidebar, Dashboard) o cualquier
 *            componente que necesite reaccionar al paso del tiempo.
 * ¿Impacto? Optimiza el uso de CPU pausando cuando la pestaña no está visible.
 *
 * @param options - Configuración opcional del hook.
 * @returns Objeto Date con la hora actual.
 *
 * 
 */
export function useClock(options: UseClockOptions = {}): Date {
  const {
    intervalMs = DEFAULT_INTERVAL_MS,
    enabled = true,
    pauseWhenHidden = true,
  } = options;

  const [now, setNow] = useState<Date>(() => new Date());

  const intervalRef = useRef<number | null>(null);

  /**
   * Inicia el intervalo de actualización del reloj.
   */
  const startClock = useCallback((): void => {
    setNow(new Date());

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }

    intervalRef.current = window.setInterval(() => {
      setNow(new Date());
    }, intervalMs);
  }, [intervalMs]);

  /**
   * Detiene el intervalo de actualización.
   */
  const stopClock = useCallback((): void => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ==============================================================================
  // EFECTO PRINCIPAL — Manejo del intervalo
  // ==============================================================================

  useEffect(() => {
    if (!enabled) {
      stopClock();
      return;
    }

    startClock();

    return () => stopClock();
  }, [enabled, startClock, stopClock]);

  // ==============================================================================
  // OPTIMIZACIÓN — Pausar cuando la pestaña no está visible
  // ==============================================================================

  useEffect(() => {
    if (!pauseWhenHidden || !enabled) return;

    const handleVisibilityChange = (): void => {
      if (document.hidden) {
        stopClock();
      } else {
        startClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, pauseWhenHidden, startClock, stopClock]);

  return now;
}

// ==============================================================================
// HOOK COMPLEMENTARIO — Reloj con formateo automático
// ==============================================================================

/**
 * Estructura de la hora formateada.
 */
export interface FormattedClock {
  date: Date;
  time: string;
  timeWithSeconds: string;
  date_: string;
  dateTime: string;
}

/**
 * Reloj con la hora ya formateada según el locale de Colombia.
 *
 * ¿Qué? Combina `useClock` con las funciones de `@utils/Formatters`.
 * ¿Para qué? Evitar tener que llamar a `formatTime()` en cada render del componente.
 * ¿Impacto? Reduce código repetitivo en componentes que muestran la hora.
 *
 * @param options - Configuración opcional del hook.
 * @returns Objeto con la hora formateada en múltiples formatos.
 *
 *
 */
export function useFormattedClock(options: UseClockOptions = {}): FormattedClock {
  const now = useClock(options);

  return {
    date:            now,
    time:            formatTime(now, false),
    timeWithSeconds: formatTime(now, true),
    date_:           formatDate(now),
    dateTime:        formatDateTime(now),
  };
}