// ¿Qué? Tabla genérica reutilizable con sort, selección, estados de carga y rendering personalizable.
// ¿Para qué? Reemplazar las tablas dispersas en Transactions, Users y Settings
//            que tenían implementaciones diferentes de sort y render.
// ¿Impacto? Todas las tablas del sistema usan este componente, garantizando
//           consistencia visual, accesibilidad y comportamiento uniforme.

import { useMemo, type ReactNode, type CSSProperties } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';

// ==============================================================================
// TYPES
// ==============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  field: keyof T | string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  label: ReactNode;
  render: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  sortAccessor?: (item: T) => string | number | Date | null | undefined;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
  headerStyle?: CSSProperties;
  cellStyle?: CSSProperties;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (item: T, index: number) => string | number;
  sort?: SortConfig<T>;
  onSortChange?: (sort: SortConfig<T>) => void;
  onRowClick?: (item: T, index: number) => void;
  selectedRow?: T | null;
  isRowSelected?: (item: T) => boolean;
  loading?: boolean;
  emptyMessage?: string;
  emptyComponent?: ReactNode;
  getRowClassName?: (item: T, index: number) => string;
  getRowStyle?: (item: T, index: number) => CSSProperties;
  bordered?: boolean;
  hoverable?: boolean;
  autoSort?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function sortData<T>(
  data: T[],
  sort: SortConfig<T>,
  columns: DataTableColumn<T>[]
): T[] {
  const column = columns.find((col) => col.key === sort.field);
  if (!column) return data;

  const accessor = column.sortAccessor ?? ((item: T) => (item as Record<string, unknown>)[sort.field as string]);
  const modifier = sort.direction === 'asc' ? 1 : -1;

  return [...data].sort((a, b) => {
    const aVal = accessor(a);
    const bVal = accessor(b);

    // Nulls al final
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal instanceof Date && bVal instanceof Date) {
      return (aVal.getTime() - bVal.getTime()) * modifier;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return (aVal - bVal) * modifier;
    }

    return String(aVal).localeCompare(String(bVal), 'es', {
      numeric: true,
      sensitivity: 'base',
    }) * modifier;
  });
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  sort,
  onSortChange,
  onRowClick,
  selectedRow,
  isRowSelected,
  loading = false,
  emptyMessage,
  emptyComponent,
  getRowClassName,
  getRowStyle,
  bordered = true,
  hoverable = true,
  autoSort = false,
  className = '',
}: DataTableProps<T>) {

  // ==============================================================================
  // ORDENAMIENTO
  // ==============================================================================

  const sortedData = useMemo(() => {
    if (!autoSort || !sort) return data;
    return sortData(data, sort, columns);
  }, [data, sort, columns, autoSort]);

  const handleSort = (columnKey: string): void => {
    if (!onSortChange) return;

    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    if (sort?.field === columnKey) {
      onSortChange({
        field: columnKey,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({
        field: columnKey,
        direction: 'desc',
      });
    }
  };

  // ==============================================================================
  // SELECCIÓN
  // ==============================================================================

  const checkIsSelected = (item: T): boolean => {
    if (isRowSelected) return isRowSelected(item);
    if (selectedRow) return item === selectedRow;
    return false;
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: CSSProperties = {
    width:     '100%',
    overflowX: 'auto',
    borderRadius: '8px',
    border:    bordered ? '1px solid var(--border)' : 'none',
    background: 'var(--bg-secondary)',
  };

  const tableStyle: CSSProperties = {
    width:          '100%',
    borderCollapse: 'collapse',
    fontFamily:     'Inter, sans-serif',
    fontSize:       '13px',
  };

  const headerStyle: CSSProperties = {
    background:  'var(--bg-tertiary)',
    borderBottom: bordered ? '1px solid var(--border)' : 'none',
  };

  const thBaseStyle = (col: DataTableColumn<T>): CSSProperties => ({
    padding:     '12px 16px',
    textAlign:   col.align ?? 'left',
    fontWeight:  700,
    fontSize:    '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color:       'var(--text-secondary)',
    userSelect:  'none',
    cursor:      col.sortable ? 'pointer' : 'default',
    whiteSpace:  'nowrap',
    width:       col.width,
    minWidth:    col.minWidth,
    ...col.headerStyle,
  });

  const trBaseStyle = (isSelected: boolean, isClickable: boolean): CSSProperties => ({
    background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
    cursor:     isClickable ? 'pointer' : 'default',
    transition: 'background 0.15s ease',
    borderBottom: bordered ? '1px solid var(--border)' : 'none',
  });

  const tdBaseStyle = (col: DataTableColumn<T>): CSSProperties => ({
    padding:   '12px 16px',
    textAlign: col.align ?? 'left',
    color:     'var(--text-primary)',
    ...col.cellStyle,
  });

  const sortIconStyle: CSSProperties = {
    display:    'inline-flex',
    alignItems: 'center',
    marginLeft: '6px',
    verticalAlign: 'middle',
  };

  const headerContentStyle = (col: DataTableColumn<T>): CSSProperties => ({
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start',
    gap:            '4px',
    width:          '100%',
  });

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading) {
    return (
      <div style={wrapperStyle} className={`data-table data-table-loading ${className}`}>
        <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
          <Spinner size="lg" label="Cargando datos..." centered />
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDER — EMPTY STATE
  // ==============================================================================

  if (data.length === 0) {
    return (
      <div style={wrapperStyle} className={`data-table data-table-empty ${className}`}>
        <div style={{ padding: '40px 20px' }}>
          {emptyComponent ?? (
            <EmptyState
              preset="no-data"
              description={emptyMessage ?? 'No hay datos para mostrar.'}
            />
          )}
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDER — TABLA
  // ==============================================================================

  return (
    <div style={wrapperStyle} className={`data-table ${className}`}>
      <table style={tableStyle}>
        {/* HEADER */}
        <thead style={headerStyle}>
          <tr>
            {columns.map((col) => {
              const isSorted = sort?.field === col.key;
              const sortDirection = isSorted ? sort.direction : null;

              return (
                <th
                  key={col.key}
                  style={thBaseStyle(col)}
                  className={col.headerClassName}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={
                    isSorted
                      ? sortDirection === 'asc' ? 'ascending' : 'descending'
                      : col.sortable ? 'none' : undefined
                  }
                  role={col.sortable ? 'button' : undefined}
                  tabIndex={col.sortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(col.key);
                    }
                  }}
                >
                  <span style={headerContentStyle(col)}>
                    {col.label}
                    {col.sortable && (
                      <span style={sortIconStyle}>
                        {sortDirection === 'asc' && <ArrowUp size={11} />}
                        {sortDirection === 'desc' && <ArrowDown size={11} />}
                        {!sortDirection && <ArrowUpDown size={11} style={{ opacity: 0.4 }} />}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {sortedData.map((item, index) => {
            const isSelected = checkIsSelected(item);
            const isClickable = Boolean(onRowClick);
            const rowKey = getRowKey(item, index);
            const customClass = getRowClassName?.(item, index) ?? '';
            const customStyle = getRowStyle?.(item, index) ?? {};

            return (
              <tr
                key={rowKey}
                style={{
                  ...trBaseStyle(isSelected, isClickable),
                  ...customStyle,
                }}
                className={`data-table-row ${hoverable ? 'data-table-row-hoverable' : ''} ${isSelected ? 'data-table-row-selected' : ''} ${customClass}`}
                onClick={() => onRowClick?.(item, index)}
                onMouseEnter={(e) => {
                  if (hoverable && !isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hoverable && !isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
                aria-selected={isSelected}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={tdBaseStyle(col)}
                    className={col.cellClassName}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}