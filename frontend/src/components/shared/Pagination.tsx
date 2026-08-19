// ¿Qué? Componente de paginación completo con navegación, info de rango y números de página.
// ¿Para qué? Reemplazar los controles de paginación inline que estaban en Transactions
//            y Users con implementaciones distintas.
// ¿Impacto? Todas las tablas y listados paginados usan este componente,
//           garantizando consistencia visual y accesibilidad completa.

import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@components/ui/Button';

// ==============================================================================
// TYPES
// ==============================================================================

export type PaginationMode = 'compact' | 'full' | 'numbers';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  mode?: PaginationMode;
  maxVisiblePages?: number;
  showFirstLast?: boolean;
  showRangeInfo?: boolean;
  centered?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function getPageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible: number
): (number | 'ellipsis')[] {
  if (totalPages <= maxVisible + 2) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | 'ellipsis')[] = [];
  const half = Math.floor(maxVisible / 2);

  pages.push(0);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages - 2, currentPage + half);

  if (currentPage <= half) {
    end = maxVisible - 1;
  }
  if (currentPage >= totalPages - 1 - half) {
    start = totalPages - maxVisible;
  }

  if (start > 1) {
    pages.push('ellipsis');
  }

  for (let i = start; i <= end; i++) {
    if (i > 0 && i < totalPages - 1) {
      pages.push(i);
    }
  }

  if (end < totalPages - 2) {
    pages.push('ellipsis');
  }

  if (totalPages > 1) {
    pages.push(totalPages - 1);
  }

  return pages;
}

function getRangeText(
  page: number,
  pageSize: number,
  totalItems: number
): string {
  if (totalItems === 0) return 'Sin resultados';

  const start = page * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalItems);
  return `Mostrando ${start.toLocaleString('es-CO')}-${end.toLocaleString('es-CO')} de ${totalItems.toLocaleString('es-CO')}`;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Pagination({
  page,
  totalPages,
  totalItems = 0,
  pageSize = 30,
  onPageChange,
  mode = 'full',
  maxVisiblePages = 5,
  showFirstLast = true,
  showRangeInfo = true,
  centered = false,
  className = '',
}: PaginationProps) {
  const hasNextPage = page < totalPages - 1;
  const hasPreviousPage = page > 0;
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages, maxVisiblePages),
    [page, totalPages, maxVisiblePages]
  );

  const rangeText = useMemo(
    () => getRangeText(page, pageSize, totalItems),
    [page, pageSize, totalItems]
  );

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const goToPage = (newPage: number): void => {
    const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
    if (clamped !== page) {
      onPageChange(clamped);
    }
  };

  const goToFirst = (): void => goToPage(0);
  const goToLast = (): void => goToPage(totalPages - 1);
  const goToPrevious = (): void => goToPage(page - 1);
  const goToNext = (): void => goToPage(page + 1);

  // ==============================================================================
  // NO RENDERIZAR SI NO HAY DATOS
  // ==============================================================================

  if (totalPages <= 1 && !showRangeInfo) return null;

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: centered ? 'center' : 'space-between',
    gap:            '16px',
    padding:        '16px 0',
    flexWrap:       'wrap',
    fontFamily:     'Inter, sans-serif',
  };

  const controlsStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
  };

  const rangeStyle: React.CSSProperties = {
    fontSize:   '12px',
    color:      'var(--text-tertiary)',
    fontWeight: 500,
  };

  const currentPageStyle: React.CSSProperties = {
    fontSize:    '12px',
    color:       'var(--text-secondary)',
    fontWeight:  600,
    padding:     '0 8px',
  };

  const numberButtonStyle = (isActive: boolean): React.CSSProperties => ({
    minWidth:     '32px',
    height:       '32px',
    padding:      '0 8px',
    fontSize:     '12px',
    fontWeight:   isActive ? 700 : 500,
    color:        isActive ? '#FFFFFF' : 'var(--text-secondary)',
    background:   isActive ? '#6366F1' : 'transparent',
    border:       `1px solid ${isActive ? '#6366F1' : 'var(--border)'}`,
    borderRadius: '6px',
    cursor:       'pointer',
    transition:   'all 0.15s ease',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontFamily:   'Inter, sans-serif',
  });

  const ellipsisStyle: React.CSSProperties = {
    padding:  '0 4px',
    color:    'var(--text-tertiary)',
    fontSize: '12px',
  };

  // ==============================================================================
  // RENDER SEGÚN MODO
  // ==============================================================================

  if (mode === 'compact') {
    return (
      <nav
        aria-label="Paginación"
        className={`pagination pagination-compact ${className}`}
        style={wrapperStyle}
      >
        {showRangeInfo && <span style={rangeStyle}>{rangeText}</span>}

        <div style={controlsStyle}>
          <Button
            size="sm"
            variant="ghost"
            onClick={goToPrevious}
            disabled={!hasPreviousPage}
            leftIcon={<ChevronLeft size={14} />}
            aria-label="Página anterior"
          >
            Anterior
          </Button>

          <span style={currentPageStyle}>
            Página {page + 1} de {totalPages}
          </span>

          <Button
            size="sm"
            variant="ghost"
            onClick={goToNext}
            disabled={!hasNextPage}
            rightIcon={<ChevronRight size={14} />}
            aria-label="Página siguiente"
          >
            Siguiente
          </Button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Paginación"
      className={`pagination pagination-${mode} ${className}`}
      style={wrapperStyle}
    >
      {showRangeInfo && <span style={rangeStyle}>{rangeText}</span>}

      <div style={controlsStyle}>
        {/* Botón Primera Página */}
        {showFirstLast && (
          <button
            type="button"
            onClick={goToFirst}
            disabled={isFirstPage}
            style={{
              ...numberButtonStyle(false),
              opacity: isFirstPage ? 0.4 : 1,
              cursor: isFirstPage ? 'not-allowed' : 'pointer',
            }}
            aria-label="Ir a la primera página"
            title="Primera página"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Botón Anterior */}
        <button
          type="button"
          onClick={goToPrevious}
          disabled={!hasPreviousPage}
          style={{
            ...numberButtonStyle(false),
            opacity: !hasPreviousPage ? 0.4 : 1,
            cursor: !hasPreviousPage ? 'not-allowed' : 'pointer',
          }}
          aria-label="Página anterior"
          title="Anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Números de página */}
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} style={ellipsisStyle} aria-hidden="true">
                …
              </span>
            );
          }

          const isActive = pageNum === page;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => goToPage(pageNum)}
              style={numberButtonStyle(isActive)}
              aria-label={`Página ${pageNum + 1}${isActive ? ' (actual)' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum + 1}
            </button>
          );
        })}

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={goToNext}
          disabled={!hasNextPage}
          style={{
            ...numberButtonStyle(false),
            opacity: !hasNextPage ? 0.4 : 1,
            cursor: !hasNextPage ? 'not-allowed' : 'pointer',
          }}
          aria-label="Página siguiente"
          title="Siguiente"
        >
          <ChevronRight size={14} />
        </button>

        {/* Botón Última Página */}
        {showFirstLast && (
          <button
            type="button"
            onClick={goToLast}
            disabled={isLastPage}
            style={{
              ...numberButtonStyle(false),
              opacity: isLastPage ? 0.4 : 1,
              cursor: isLastPage ? 'not-allowed' : 'pointer',
            }}
            aria-label="Ir a la última página"
            title="Última página"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </nav>
  );
}