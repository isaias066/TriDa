// ¿Qué? Chip seleccionable para filtros con contador y color personalizable.
// ¿Para qué? Reemplazar los múltiples chips de filtro dispersos en Alerts,
//            Transactions y otras páginas con estilos y comportamientos distintos.
// ¿Impacto? Todos los filtros por chip del sistema usan este componente,
//           garantizando consistencia visual y comportamiento uniforme.

import type { ReactNode } from 'react';
import { X } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type FilterChipSize = 'sm' | 'md' | 'lg';

export interface FilterChipProps {
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  count?: number;
  color?: string;
  icon?: ReactNode;
  size?: FilterChipSize;
  disabled?: boolean;
  className?: string;
}

// ==============================================================================
// DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_STYLES: Record<FilterChipSize, {
  padding:    string;
  fontSize:   string;
  height:     string;
  gap:        string;
  countSize:  string;
  iconSize:   number;
  removeSize: number;
}> = {
  sm: {
    padding:    '4px 10px',
    fontSize:   '11px',
    height:     '24px',
    gap:        '6px',
    countSize:  '10px',
    iconSize:   11,
    removeSize: 10,
  },
  md: {
    padding:    '6px 12px',
    fontSize:   '12px',
    height:     '28px',
    gap:        '8px',
    countSize:  '11px',
    iconSize:   13,
    removeSize: 11,
  },
  lg: {
    padding:    '8px 16px',
    fontSize:   '13px',
    height:     '34px',
    gap:        '10px',
    countSize:  '12px',
    iconSize:   15,
    removeSize: 13,
  },
};

// ==============================================================================
// HELPERS
// ==============================================================================

function hexToRgba(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >>  8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function FilterChip({
  label,
  active = false,
  onClick,
  onRemove,
  count,
  color = '#6366F1',
  icon,
  size = 'md',
  disabled = false,
  className = '',
}: FilterChipProps) {
  const dims = SIZE_STYLES[size];

  // ==============================================================================
  // ESTILOS DINÁMICOS SEGÚN ESTADO
  // ==============================================================================

  const activeBackground = hexToRgba(color, 0.15);
  const activeBorder     = hexToRgba(color, 0.35);
  const activeText       = color;

  const inactiveBackground = 'transparent';
  const inactiveBorder     = 'var(--border)';
  const inactiveText       = 'var(--text-secondary)';

  const chipStyle: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            dims.gap,
    padding:        dims.padding,
    height:         dims.height,
    fontSize:       dims.fontSize,
    fontFamily:     'Inter, sans-serif',
    fontWeight:     active ? 700 : 500,
    color:          disabled ? 'var(--text-tertiary)' : active ? activeText : inactiveText,
    background:     disabled ? 'transparent' : active ? activeBackground : inactiveBackground,
    border:         `1px solid ${disabled ? 'var(--border)' : active ? activeBorder : inactiveBorder}`,
    borderRadius:   '20px',
    cursor:         disabled ? 'not-allowed' : onClick ? 'pointer' : 'default',
    opacity:        disabled ? 0.5 : 1,
    transition:     'all 0.15s ease',
    userSelect:     'none',
    whiteSpace:     'nowrap',
    outline:        'none',
  };

  const iconStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    flexShrink: 0,
  };

  const labelStyle: React.CSSProperties = {
    lineHeight: 1,
  };

  const countStyle: React.CSSProperties = {
    fontSize:    dims.countSize,
    fontWeight:  700,
    padding:     '2px 6px',
    borderRadius: '10px',
    background:   active ? hexToRgba(color, 0.3) : 'var(--bg-tertiary)',
    color:        active ? activeText : 'var(--text-secondary)',
    minWidth:     '18px',
    textAlign:    'center',
    lineHeight:   1,
    fontVariantNumeric: 'tabular-nums',
  };

  const removeButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '2px',
    background:     'transparent',
    border:         'none',
    borderRadius:   '50%',
    color:          active ? activeText : inactiveText,
    cursor:         'pointer',
    transition:     'background 0.15s ease',
    marginLeft:     '-4px',
    marginRight:    '-4px',
  };

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleClick = (): void => {
    if (disabled) return;
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent): void => {
    e.stopPropagation(); // Evitar disparar onClick del chip
    if (disabled) return;
    onRemove?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`filter-chip ${active ? 'filter-chip-active' : ''} ${className}`}
      style={chipStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-pressed={onClick ? active : undefined}
      aria-disabled={disabled}
    >
      {icon && <span style={iconStyle}>{icon}</span>}
      <span style={labelStyle}>{label}</span>
      {typeof count === 'number' && <span style={countStyle}>{count}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          style={removeButtonStyle}
          aria-label={`Remover ${typeof label === 'string' ? label : 'filtro'}`}
          disabled={disabled}
        >
          <X size={dims.removeSize} />
        </button>
      )}
    </div>
  );
}