// ¿Qué? Componente de badge (etiqueta pequeña) reutilizable con variantes y tamaños.
// ¿Para qué? Estandarizar las etiquetas visuales que se usan para mostrar estados,
//            niveles, contadores y clasificaciones en toda la aplicación.
// ¿Impacto? Es la base para RiskBadge, BankBadge, StatusBadge y otros badges
//           especializados que se crearán después.

import type { HTMLAttributes, ReactNode } from 'react';

// ==============================================================================
// TYPES
// ==============================================================================

export type BadgeVariant =
  | 'default'   
  | 'primary'   
  | 'success'   
  | 'warning'   
  | 'danger'    
  | 'info'      
  | 'custom'; 

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: string;
  icon?: ReactNode;
  pulse?: boolean;
  rounded?: boolean;
  children: ReactNode;
}

// ==============================================================================
// COLORES POR VARIANTE
// ==============================================================================


const VARIANT_COLORS: Record<Exclude<BadgeVariant, 'custom'>, {
  bg: string;
  text: string;
  border: string;
}> = {
  default: {
    bg:     'rgba(156, 163, 175, 0.15)',
    text:   '#9CA3AF',
    border: 'rgba(156, 163, 175, 0.3)',
  },
  primary: {
    bg:     'rgba(99, 102, 241, 0.15)',
    text:   '#818CF8',
    border: 'rgba(99, 102, 241, 0.3)',
  },
  success: {
    bg:     'rgba(52, 211, 153, 0.15)',
    text:   '#34D399',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  warning: {
    bg:     'rgba(251, 191, 36, 0.15)',
    text:   '#FBBF24',
    border: 'rgba(251, 191, 36, 0.3)',
  },
  danger: {
    bg:     'rgba(239, 68, 68, 0.15)',
    text:   '#EF4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  info: {
    bg:     'rgba(6, 182, 212, 0.15)',
    text:   '#06B6D4',
    border: 'rgba(6, 182, 212, 0.3)',
  },
};

// ==============================================================================
// ESTILOS POR TAMAÑO
// ==============================================================================

const SIZE_STYLES: Record<BadgeSize, {
  padding:  string;
  fontSize: string;
  gap:      string;
  height:   string;
  dotSize:  string;
}> = {
  sm: {
    padding:  '2px 6px',
    fontSize: '10px',
    gap:      '4px',
    height:   '18px',
    dotSize:  '5px',
  },
  md: {
    padding:  '4px 10px',
    fontSize: '11px',
    gap:      '6px',
    height:   '22px',
    dotSize:  '6px',
  },
  lg: {
    padding:  '6px 14px',
    fontSize: '13px',
    gap:      '8px',
    height:   '28px',
    dotSize:  '8px',
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

function getBadgeColors(variant: BadgeVariant, customColor?: string) {
  if (variant === 'custom' && customColor) {
    return {
      bg:     hexToRgba(customColor, 0.15),
      text:   customColor,
      border: hexToRgba(customColor, 0.3),
    };
  }

  const key = variant === 'custom' ? 'default' : variant;
  return VARIANT_COLORS[key];
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Badge({
  variant = 'default',
  size = 'md',
  color,
  icon,
  pulse = false,
  rounded = false,
  children,
  style,
  className = '',
  ...rest
}: BadgeProps) {
  const colors = getBadgeColors(variant, color);
  const sizeStyle = SIZE_STYLES[size];

  const badgeStyle: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        sizeStyle.padding,
    fontSize:       sizeStyle.fontSize,
    fontWeight:     700,
    fontFamily:     'Inter, sans-serif',
    lineHeight:     1,
    height:         sizeStyle.height,
    gap:            sizeStyle.gap,
    background:     colors.bg,
    color:          colors.text,
    border:         `1px solid ${colors.border}`,
    borderRadius:   rounded ? '999px' : '6px',
    whiteSpace:     'nowrap',
    userSelect:     'none',
    ...style,
  };

  const dotStyle: React.CSSProperties = {
    width:        sizeStyle.dotSize,
    height:       sizeStyle.dotSize,
    borderRadius: '50%',
    background:   colors.text,
    animation:    'badge-pulse 1.5s ease-in-out infinite',
    flexShrink:   0,
  };

  return (
    <span
      className={`ui-badge ${className}`}
      style={badgeStyle}
      {...rest}
    >
      {pulse && <span style={dotStyle} aria-hidden="true" />}
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}

      {pulse && (
        <style>{`
          @keyframes badge-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50%      { opacity: 0.5; transform: scale(1.3); }
          }
        `}</style>
      )}
    </span>
  );
}