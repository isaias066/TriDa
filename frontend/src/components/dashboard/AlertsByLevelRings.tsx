// ¿Qué? Grid de 4 anillos que muestran la distribución de alertas por nivel de riesgo.
// ¿Para qué? Reemplazar el bloque float-risk de dashboards.jsx que renderizaba
//            los 4 rings con conteo de alertas por criticidad.
// ¿Impacto? Se usa exclusivamente en DashboardPage para mostrar de un vistazo
//           cuántas alertas hay en cada nivel.

import {
  RISK_COLORS,
  RISK_LEVELS,
  type RiskLevel,
} from '@constants/Risk';
import type { AlertCriticality } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AlertsByLevelRingsProps {
  counts: Record<AlertCriticality, number>;
  onLevelClick?: (level: RiskLevel) => void;
  size?: 'sm' | 'md' | 'lg';
  showTotal?: boolean;
  className?: string;
}

// ==============================================================================
// CONSTANTES
// ==============================================================================

const LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const SIZE_DIMENSIONS: Record<NonNullable<AlertsByLevelRingsProps['size']>, {
  ringSize:     string;
  borderWidth:  string;
  countSize:    string;
  labelSize:    string;
  gap:          string;
}> = {
  sm: {
    ringSize:    '48px',
    borderWidth: '3px',
    countSize:   '14px',
    labelSize:   '9px',
    gap:         '12px',
  },
  md: {
    ringSize:    '64px',
    borderWidth: '3px',
    countSize:   '18px',
    labelSize:   '10px',
    gap:         '16px',
  },
  lg: {
    ringSize:    '80px',
    borderWidth: '4px',
    countSize:   '22px',
    labelSize:   '11px',
    gap:         '20px',
  },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================


export function AlertsByLevelRings({
  counts,
  onLevelClick,
  size = 'md',
  showTotal = false,
  className = '',
}: AlertsByLevelRingsProps) {
  const dims = SIZE_DIMENSIONS[size];
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const isClickable = Boolean(onLevelClick);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           dims.gap,
    fontFamily:    'Inter, sans-serif',
  };

  const gridStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            dims.gap,
    flexWrap:       'wrap',
  };

  const totalStyle: React.CSSProperties = {
    fontSize:   '12px',
    color:      'var(--text-tertiary)',
    fontWeight: 500,
    textAlign:  'center',
  };

  const totalValueStyle: React.CSSProperties = {
    fontWeight:         700,
    color:              'var(--text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`alerts-by-level-rings ${className}`}
      style={wrapperStyle}
      role="group"
      aria-label="Distribución de alertas por nivel de riesgo"
    >
      <div style={gridStyle}>
        {LEVEL_ORDER.map((level) => {
          const count = counts[level] ?? 0;
          const color = RISK_COLORS[level];
          const label = RISK_LEVELS[level].label;

          return (
            <LevelRing
              key={level}
              level={level}
              count={count}
              color={color}
              label={label}
              dims={dims}
              clickable={isClickable}
              onClick={() => onLevelClick?.(level)}
            />
          );
        })}
      </div>

      {showTotal && (
        <span style={totalStyle}>
          Total: <span style={totalValueStyle}>{total.toLocaleString('es-CO')}</span> alertas
        </span>
      )}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — LevelRing
// ==============================================================================

interface LevelRingProps {
  level: RiskLevel;
  count: number;
  color: string;
  label: string;
  dims: typeof SIZE_DIMENSIONS['md'];
  clickable: boolean;
  onClick: () => void;
}

/**
 * Anillo individual con conteo y label.
 */
function LevelRing({
  level,
  count,
  color,
  label,
  dims,
  clickable,
  onClick,
}: LevelRingProps) {

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const itemStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '6px',
    cursor:        clickable ? 'pointer' : 'default',
    transition:    'transform 0.15s ease',
    outline:       'none',
  };

  const ringStyle: React.CSSProperties = {
    width:          dims.ringSize,
    height:         dims.ringSize,
    borderRadius:   '50%',
    border:         `${dims.borderWidth} solid ${color}`,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    background:     `${color}08`,
    transition:     'transform 0.15s ease, box-shadow 0.15s ease',
  };

  const countStyle: React.CSSProperties = {
    fontSize:           dims.countSize,
    fontWeight:         800,
    color:              color,
    lineHeight:        1,
    fontVariantNumeric: 'tabular-nums',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:      dims.labelSize,
    color:         'var(--text-tertiary)',
    fontWeight:    600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign:     'center',
    lineHeight:    1.2,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`level-ring level-ring-${level}`}
      style={itemStyle}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : 'group'}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${label}: ${count} alertas`}
      onMouseEnter={(e) => {
        if (clickable) {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
          const ring = e.currentTarget.querySelector<HTMLElement>('.ring-circle');
          if (ring) ring.style.boxShadow = `0 0 12px ${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          const ring = e.currentTarget.querySelector<HTMLElement>('.ring-circle');
          if (ring) ring.style.boxShadow = 'none';
        }
      }}
    >
      <div className="ring-circle" style={ringStyle}>
        <span style={countStyle}>{count}</span>
      </div>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}