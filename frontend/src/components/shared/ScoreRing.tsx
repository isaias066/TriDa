// ¿Qué? Círculo SVG animado que muestra un score de riesgo de forma visual.
// ¿Para qué? Reemplazar los múltiples anillos SVG inline que estaban en Alerts,
//            Analytics y otros componentes con markup duplicado.
// ¿Impacto? Todos los indicadores circulares de score usan este componente,
//           garantizando consistencia visual y comportamiento uniforme.

import type { ReactNode } from 'react';
import {
  RISK_COLORS,
  type RiskLevel,
} from '@constants/Risk';
import { getRiskLevel } from '@utils/Risk';
import { formatRiskScore } from '@utils/Formatters';

// ==============================================================================
// TYPES
// ==============================================================================

export type ScoreRingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ScoreRingProps {
  score: number;
  size?: ScoreRingSize;
  level?: RiskLevel;
  color?: string;
  showScore?: boolean;
  scoreFormat?: 'percent' | 'raw' | 'compact';
  strokeWidth?: number;
  animate?: boolean;
  animationDuration?: number;
  children?: ReactNode;
  className?: string;
}

// ==============================================================================
// DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_DIMENSIONS: Record<ScoreRingSize, {
  size:         number;
  fontSize:     string;
  fontWeight:   number;
}> = {
  sm: {
    size:       48,
    fontSize:   '11px',
    fontWeight: 700,
  },
  md: {
    size:       80,
    fontSize:   '16px',
    fontWeight: 700,
  },
  lg: {
    size:       120,
    fontSize:   '22px',
    fontWeight: 800,
  },
  xl: {
    size:       180,
    fontSize:   '32px',
    fontWeight: 800,
  },
};

// ==============================================================================
// HELPERS
// ==============================================================================

function clampScore(score: number): number {
  if (isNaN(score)) return 0;
  return Math.max(0, Math.min(100, score));
}

function formatScore(score: number, format: NonNullable<ScoreRingProps['scoreFormat']>): string {
  const clamped = clampScore(score);
  switch (format) {
    case 'raw':
      return String(Math.round(clamped));
    case 'compact':
      return `${Math.round(clamped)}%`;
    case 'percent':
    default:
      return formatRiskScore(clamped);
  }
}

function resolveColor(score: number, level?: RiskLevel, color?: string): string {
  if (color) return color;
  const finalLevel = level ?? getRiskLevel(score);
  return RISK_COLORS[finalLevel];
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ScoreRing({
  score,
  size = 'md',
  level,
  color,
  showScore = true,
  scoreFormat = 'percent',
  strokeWidth = 8,
  animate = true,
  animationDuration = 800,
  children,
  className = '',
}: ScoreRingProps) {
  const dims = SIZE_DIMENSIONS[size];
  const clampedScore = clampScore(score);
  const finalColor = resolveColor(clampedScore, level, color);

  // ==============================================================================
  // CÁLCULOS DEL SVG
  // ==============================================================================

  const VIEW_BOX = 36;
  const RADIUS   = (VIEW_BOX - strokeWidth) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const PATH = `M ${VIEW_BOX / 2} ${strokeWidth / 2}
                a ${RADIUS} ${RADIUS} 0 0 1 0 ${VIEW_BOX - strokeWidth}
                a ${RADIUS} ${RADIUS} 0 0 1 0 -${VIEW_BOX - strokeWidth}`;

  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:   'relative',
    display:    'inline-flex',
    width:      `${dims.size}px`,
    height:     `${dims.size}px`,
    flexShrink: 0,
  };

  const svgStyle: React.CSSProperties = {
    width:     '100%',
    height:    '100%',
    transform: 'rotate(-90deg)', 
  };

  const foregroundStyle: React.CSSProperties = {
    fill:              'none',
    stroke:            finalColor,
    strokeWidth,
    strokeDasharray:   CIRCUMFERENCE,
    strokeDashoffset:  dashOffset,
    strokeLinecap:     'round',
    transition:        animate ? `stroke-dashoffset ${animationDuration}ms ease-out` : 'none',
  };

  const backgroundStyle: React.CSSProperties = {
    fill:        'none',
    stroke:      'rgba(255, 255, 255, 0.08)',
    strokeWidth,
  };

  const centerStyle: React.CSSProperties = {
    position:       'absolute',
    top:            0,
    left:           0,
    width:          '100%',
    height:         '100%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       dims.fontSize,
    fontWeight:     dims.fontWeight,
    color:          finalColor,
    fontFamily:     'Inter, sans-serif',
    userSelect:     'none',
    lineHeight:     1,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`score-ring score-ring-${size} ${className}`}
      style={wrapperStyle}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score de riesgo: ${formatScore(clampedScore, scoreFormat)}`}
    >
      <svg viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`} style={svgStyle}>
        {/* Círculo de fondo (siempre visible) */}
        <path d={PATH} style={backgroundStyle} />
        {/* Círculo animado con el score */}
        <path d={PATH} style={foregroundStyle} />
      </svg>

      {(showScore || children) && (
        <div style={centerStyle}>
          {children ? children : formatScore(clampedScore, scoreFormat)}
        </div>
      )}
    </div>
  );
}