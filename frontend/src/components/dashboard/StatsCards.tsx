// ¿Qué? Card individual con ícono, valor grande y label descriptivo para métricas del Dashboard.
// ¿Para qué? Reemplazar las cards inline del dashboards.jsx que tenían estilos
//            duplicados con colores hardcoded.
// ¿Impacto? Se usa en el StatsCardsGrid del Dashboard para mostrar métricas clave
//           como total de transacciones, fraudes detectados, monto total, etc.

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type StatsCardVariant =
  | 'primary'   
  | 'success'   
  | 'warning'   
  | 'danger'    
  | 'info';    
  
export interface StatsCardProps {
  icon: LucideIcon;
  value: ReactNode;
  label: string;
  variant?: StatsCardVariant;
  subtitle?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}

// ==============================================================================
// COLORES POR VARIANTE
// ==============================================================================

const VARIANT_COLORS: Record<StatsCardVariant, string> = {
  primary: '#6366F1',
  success: '#34D399',
  warning: '#FBBF24',
  danger:  '#EF4444',
  info:    '#06B6D4',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================


export function StatsCard({
  icon: Icon,
  value,
  label,
  variant = 'primary',
  subtitle,
  trend,
  animated = false,
  onClick,
  className = '',
}: StatsCardProps) {
  const color = VARIANT_COLORS[variant];
  const isClickable = Boolean(onClick);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const cardStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '14px',
    padding:        '16px',
    background:     'var(--bg-secondary)',
    border:         '1px solid var(--border)',
    borderRadius:   '12px',
    cursor:         isClickable ? 'pointer' : 'default',
    transition:     'transform 0.15s ease, border-color 0.15s ease, background 0.15s ease',
    fontFamily:     'Inter, sans-serif',
    minHeight:      '80px',
    outline:        'none',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '44px',
    height:         '44px',
    borderRadius:   '10px',
    background:     `${color}18`,
    color:          color,
    flexShrink:     0,
    animation:      animated ? 'stats-card-pulse 2s ease-in-out infinite' : 'none',
  };

  const contentStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    flex:          1,
    minWidth:      0,
  };

  const valueRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'baseline',
    gap:        '8px',
    flexWrap:   'wrap',
  };

  const valueStyle: React.CSSProperties = {
    fontSize:      '18px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    lineHeight:    1.2,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
    overflow:      'hidden',
    textOverflow:  'ellipsis',
    whiteSpace:    'nowrap',
  };

  const trendStyle: React.CSSProperties = {
    fontSize:   '11px',
    fontWeight: 700,
    color:      trend?.isPositive ? '#34D399' : '#EF4444',
    padding:    '2px 6px',
    background: trend?.isPositive
      ? 'rgba(52, 211, 153, 0.15)'
      : 'rgba(239, 68, 68, 0.15)',
    borderRadius: '4px',
    whiteSpace:   'nowrap',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:      '11px',
    color:         'var(--text-tertiary)',
    fontWeight:    500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight:    1.3,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize:   '10px',
    color:      'var(--text-tertiary)',
    marginTop:  '2px',
    lineHeight: 1.3,
    fontWeight: 400,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`stats-card stats-card-${variant} ${isClickable ? 'stats-card-clickable' : ''} ${className}`}
      style={cardStyle}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : 'group'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={typeof value === 'string' ? `${label}: ${value}` : label}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        }
      }}
    >
      {/* Ícono */}
      <div style={iconWrapperStyle} aria-hidden="true">
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Contenido */}
      <div style={contentStyle}>
        <div style={valueRowStyle}>
          <span style={valueStyle}>{value}</span>
          {trend && (
            <span style={trendStyle} aria-label={`Tendencia: ${trend.value}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>

        <span style={labelStyle}>{label}</span>

        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
      </div>

      {/* Animación de pulse (solo si animated=true) */}
      {animated && (
        <style>{`
          @keyframes stats-card-pulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.6; }
          }
        `}</style>
      )}
    </div>
  );
}