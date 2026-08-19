// ¿Qué? Componente Toggle (switch on/off) reutilizable con label y accesibilidad.
// ¿Para qué? Reemplazar los múltiples toggles inline de Settings que controlan
//            notificaciones, bloqueo automático, MFA, whitelist, etc.
// ¿Impacto? Todos los switches del sistema usan este componente, garantizando
//           consistencia visual y accesibilidad (keyboard, ARIA).

import { useId, type ReactNode } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

export type ToggleSize = 'sm' | 'md' | 'lg';

export type ToggleVariant = 'primary' | 'success' | 'danger';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  size?: ToggleSize;
  variant?: ToggleVariant;
  labelPosition?: 'left' | 'right';
  id?: string;
  className?: string;
}

// ==============================================================================
// DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_DIMENSIONS: Record<ToggleSize, {
  trackWidth:  string;
  trackHeight: string;
  thumbSize:   string;
  thumbOffset: string;
  labelSize:   string;
  descSize:    string;
}> = {
  sm: {
    trackWidth:  '30px',
    trackHeight: '16px',
    thumbSize:   '12px',
    thumbOffset: '14px',
    labelSize:   '12px',
    descSize:    '10px',
  },
  md: {
    trackWidth:  '38px',
    trackHeight: '20px',
    thumbSize:   '14px',
    thumbOffset: '18px',
    labelSize:   '13px',
    descSize:    '11px',
  },
  lg: {
    trackWidth:  '48px',
    trackHeight: '26px',
    thumbSize:   '20px',
    thumbOffset: '22px',
    labelSize:   '14px',
    descSize:    '12px',
  },
};

// ==============================================================================
// COLORES POR VARIANTE
// ==============================================================================

const VARIANT_COLORS: Record<ToggleVariant, string> = {
  primary: '#6366F1',
  success: '#34D399',
  danger:  '#EF4444',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Toggle({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  size = 'md',
  variant = 'primary',
  labelPosition = 'right',
  id: providedId,
  className = '',
}: ToggleProps) {
  const generatedId = useId();
  const toggleId = providedId ?? generatedId;
  const descriptionId = description ? `${toggleId}-description` : undefined;

  const dims = SIZE_DIMENSIONS[size];
  const activeColor = VARIANT_COLORS[variant];

  // ==============================================================================
  // HANDLER
  // ==============================================================================

  const handleClick = (): void => {
    if (disabled) return;
    onChange(!checked);
  };

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (disabled) return;
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onChange(!checked);
    }
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     description ? 'flex-start' : 'center',
    justifyContent: 'space-between',
    gap:            '12px',
    fontFamily:     'Inter, sans-serif',
    cursor:         disabled ? 'not-allowed' : 'pointer',
    opacity:        disabled ? 0.5 : 1,
    flexDirection:  labelPosition === 'left' ? 'row-reverse' : 'row',
  };

  const labelGroupStyle: React.CSSProperties = {
    display:       'flex',
    alignItems:    description ? 'flex-start' : 'center',
    gap:           '10px',
    flex:          1,
    minWidth:      0,
  };

  const iconStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    color:      'var(--text-secondary)',
    flexShrink: 0,
    marginTop:  description ? '2px' : 0,
  };

  const textGroupStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    minWidth:      0,
    flex:          1,
  };

  const labelStyle: React.CSSProperties = {
    fontSize:   dims.labelSize,
    fontWeight: 600,
    color:      'var(--text-primary)',
    lineHeight: 1.3,
    userSelect: 'none',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize:   dims.descSize,
    color:      'var(--text-tertiary)',
    lineHeight: 1.4,
    userSelect: 'none',
  };

  const trackStyle: React.CSSProperties = {
    position:     'relative',
    width:        dims.trackWidth,
    height:       dims.trackHeight,
    background:   checked ? activeColor : 'var(--border)',
    borderRadius: '999px',
    transition:   'background 0.2s ease',
    flexShrink:   0,
  };

  const thumbStyle: React.CSSProperties = {
    position:     'absolute',
    top:          '50%',
    left:         checked ? dims.thumbOffset : '2px',
    transform:    'translateY(-50%)',
    width:        dims.thumbSize,
    height:       dims.thumbSize,
    background:   '#FFFFFF',
    borderRadius: '50%',
    boxShadow:    '0 1px 3px rgba(0, 0, 0, 0.3)',
    transition:   'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`ui-toggle ${className}`}
      style={wrapperStyle}
      onClick={handleClick}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-describedby={descriptionId}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      id={toggleId}
    >
      {(label || description || icon) && (
        <div style={labelGroupStyle}>
          {icon && <span style={iconStyle}>{icon}</span>}
          <div style={textGroupStyle}>
            {label && <span style={labelStyle}>{label}</span>}
            {description && (
              <span id={descriptionId} style={descriptionStyle}>
                {description}
              </span>
            )}
          </div>
        </div>
      )}

      <div style={trackStyle}>
        <div style={thumbStyle} />
      </div>
    </div>
  );
}