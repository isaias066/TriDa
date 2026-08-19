// ¿Qué? Hook para detectar clicks fuera de un elemento (o grupo de elementos).
// ¿Para qué? Cerrar automáticamente dropdowns, modales, popovers y menús contextuales
//            cuando el usuario hace click fuera de ellos.
// ¿Impacto? Reemplaza la lógica que estaba inline en sidebar.jsx y elimina la
//           duplicación futura al crear más dropdowns.

import { useEffect, useRef, type RefObject } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

/** Eventos del DOM que pueden disparar el callback. */
type ClickOutsideEvent = MouseEvent | TouchEvent;

/** Configuración opcional del hook. */
export interface UseClickOutsideOptions {
  enabled?: boolean;
  closeOnEscape?: boolean;
  additionalRefs?: RefObject<HTMLElement | null>[];
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Detecta clicks fuera de un elemento y ejecuta un callback.
 *
 * ¿Qué? Escucha eventos globales de mousedown, touchstart y keydown para
 *        detectar cuando el usuario interactúa fuera del elemento referenciado.
 * ¿Para qué? Reemplaza la lógica repetitiva de cerrar dropdowns/modales.
 * ¿Impacto? Debe recibir una ref válida — si es null, el hook no hace nada.
 *
 * @param onClickOutside - Función a ejecutar cuando se detecta click afuera.
 * @param options - Configuración opcional del hook.
 * @returns Ref para adjuntar al elemento a monitorear.
 *
 */

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  onClickOutside: (event: ClickOutsideEvent) => void,
  options: UseClickOutsideOptions = {}
): RefObject<T | null> {
  const {
    enabled = true,
    closeOnEscape = true,
    additionalRefs = [],
  } = options;

  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    /**
     * Verifica si el evento ocurrió dentro del elemento monitoreado
     * o de las referencias adicionales.
     */
    const isInsideAnyRef = (target: Node): boolean => {
      if (ref.current && ref.current.contains(target)) return true;

      for (const additionalRef of additionalRefs) {
        if (additionalRef.current && additionalRef.current.contains(target)) {
          return true;
        }
      }

      return false;
    };

    /**
     * Handler para eventos de mouse y touch.
     */
    const handleClick = (event: ClickOutsideEvent): void => {
      const target = event.target as Node | null;
      if (!target) return;
      if (isInsideAnyRef(target)) return;

      onClickOutside(event);
    };

    /**
     * Handler para tecla Escape (opcional).
     */
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClickOutside(event as unknown as ClickOutsideEvent);
      }
    };

    // Registrar listeners globales
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    if (closeOnEscape) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup al desmontar o cambiar dependencias
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);

      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [enabled, closeOnEscape, onClickOutside, additionalRefs]);

  return ref;
}