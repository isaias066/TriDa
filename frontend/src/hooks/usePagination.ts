// ¿Qué? Hook genérico para gestionar paginación de arrays en tablas y listados.
// ¿Para qué? Reemplazar la lógica repetida de paginación que estaba en
//            transactions.jsx y users.jsx, y estandarizar el comportamiento
//            en toda la aplicación.
// ¿Impacto? Cualquier tabla, grid o lista puede añadir paginación con una sola
//           línea de código, sin duplicar lógica.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const DEFAULT_PAGE_SIZE = 30;

// ==============================================================================
// TYPES
// ==============================================================================

export interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
  resetOnDataChange?: boolean;
}

export interface PageRange {
  start: number;
  end: number;
  total: number;
}

export interface UsePaginationResult<T> {
  // --- Datos ---
  items: T[];

  // --- Estado ---
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;

  // --- Navegación ---
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToFirst: () => void;
  goToLast: () => void;

  // --- Estados de navegación ---
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;

  // --- Info de rango ---
  range: PageRange;
}

// ==============================================================================
// HOOK PRINCIPAL
// ==============================================================================

/**
 * Hook genérico para paginación de arrays.
 *
 * ¿Qué? Toma un array completo y lo divide en páginas manejables, exponiendo
 *        controles de navegación y estado.
 * ¿Para qué? Reemplazar la lógica repetitiva de paginación en tablas y listados.
 * ¿Impacto? Se resetea automáticamente a la página 0 cuando cambia la longitud
 *           del array (evita quedarse en página inválida al cambiar filtros).
 *
 * @param data - Array completo de items a paginar.
 * @param options - Configuración opcional del hook.
 * @returns Objeto con items de la página y controles de navegación.
 *
 * 
 */
export function usePagination<T>(
  data: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    initialPage = 0,
    resetOnDataChange = true,
  } = options;

  // ==============================================================================
  // ESTADO
  // ==============================================================================

  const [page, setPage] = useState<number>(initialPage);

  // Ref para trackear cambios en la longitud del array
  const previousLengthRef = useRef<number>(data.length);

  // ==============================================================================
  // CÁLCULOS DERIVADOS
  // ==============================================================================

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const safePage = Math.min(page, totalPages - 1);

  const items = useMemo<T[]>(() => {
    const start = safePage * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, safePage, pageSize]);

  // ==============================================================================
  // AUTO-RESET AL CAMBIAR EL DATASET
  // ==============================================================================

  useEffect(() => {
    if (!resetOnDataChange) return;

    if (previousLengthRef.current !== data.length) {
      setPage(0);
      previousLengthRef.current = data.length;
    }
  }, [data.length, resetOnDataChange]);

  // ==============================================================================
  // NAVEGACIÓN
  // ==============================================================================

  const goToPage = useCallback(
    (newPage: number): void => {
      const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
      setPage(clamped);
    },
    [totalPages]
  );

  const nextPage = useCallback((): void => {
    setPage(prev => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const previousPage = useCallback((): void => {
    setPage(prev => Math.max(prev - 1, 0));
  }, []);

  const goToFirst = useCallback((): void => {
    setPage(0);
  }, []);

  const goToLast = useCallback((): void => {
    setPage(totalPages - 1);
  }, [totalPages]);

  // ==============================================================================
  // ESTADOS DE NAVEGACIÓN
  // ==============================================================================

  const hasNextPage = safePage < totalPages - 1;
  const hasPreviousPage = safePage > 0;
  const isFirstPage = safePage === 0;
  const isLastPage = safePage === totalPages - 1;

  // ==============================================================================
  // INFO DE RANGO
  // ==============================================================================

  const range = useMemo<PageRange>(() => {
    if (totalItems === 0) {
      return { start: 0, end: 0, total: 0 };
    }

    const start = safePage * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);

    return { start, end, total: totalItems };
  }, [safePage, pageSize, totalItems]);

  // ==============================================================================
  // RESULTADO
  // ==============================================================================

  return {
    // Datos
    items,

    // Estado
    page: safePage,
    totalPages,
    totalItems,
    pageSize,

    // Navegación
    goToPage,
    nextPage,
    previousPage,
    goToFirst,
    goToLast,

    // Estados de navegación
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,

    // Info de rango
    range,
  };
}