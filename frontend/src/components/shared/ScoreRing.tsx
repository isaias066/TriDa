// ¿Qué? Círculo SVG animado que muestra un score de riesgo.
// ¿Para qué? Indicador reutilizable de score en detalle TX, dashboard, alertas y analytics.
// ¿Impacto? Se adapta al tema (track) y a Risk.ts (color); sin hex de negocio hardcodeados.

import type { ReactNode } from 'react';
import { RISK_COLORS, getRiskLevel, type RiskLevel } from '@constants/Risk';
import { formatRiskScore } from '@utils/Formatters';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

export type ScoreRingSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ScoreRingProps {
  /** Score 0–100 (se clampea). */
  score: number;
  size?: ScoreRingSize;
  /** Si se omite, se deriva del score vía getRiskLevel. */
  level?: RiskLevel;
  /** Override opcional; por defecto RISK_COLORS[level]. */
  color?: string;
  /** Color del track; por defecto token de borde del tema. */
  trackColor?: string;
  showScore?: boolean;
  scoreFormat?: 'percent' | 'raw' | 'compact';
  strokeWidth?: number;
  animate?: boolean;
  animationDuration?: number;
  children?: ReactNode;
  className?: string;
}

// ==============================================================================
// SIZE CONFIG (solo layout, no colores de negocio)
// ==============================================================================

const SIZE_CONFIG: Record<
  ScoreRingSize,
  {
    wrapper: string;
    fontSize: string;
    fontWeight: string;
    defaultStroke: number;
  }
> = {
  sm: {
    wrapper: 'h-12 w-12',
    fontSize: 'text-[11px]',
    fontWeight: 'font-bold',
    defaultStroke: 5,
  },
  md: {
    wrapper: 'h-20 w-20',
    fontSize: 'text-base',
    fontWeight: 'font-bold',
    defaultStroke: 7,
  },
  lg: {
    wrapper: 'h-[120px] w-[120px]',
    fontSize: 'text-[22px]',
    fontWeight: 'font-extrabold',
    defaultStroke: 8,
  },
  xl: {
    wrapper: 'h-[180px] w-[180px]',
    fontSize: 'text-[32px]',
    fontWeight: 'font-extrabold',
    defaultStroke: 10,
  },
};

// ==============================================================================
// HELPERS
// ==============================================================================

function clampScore(score: number): number {
  if (Number.isNaN(score) || !Number.isFinite(score)) return 0;
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

/**
 * Color del arco: override explícito → level explícito → level desde score.
 * Nunca inventa hex locales.
 */
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
  trackColor,
  showScore = true,
  scoreFormat = 'percent',
  strokeWidth,
  animate = true,
  animationDuration = 800,
  children,
  className = '',
}: ScoreRingProps) {
  const config = SIZE_CONFIG[size];
  const clampedScore = clampScore(score);
  const resolvedLevel = level ?? getRiskLevel(clampedScore);
  const finalColor = resolveColor(clampedScore, level, color);
  const stroke = strokeWidth ?? config.defaultStroke;

  // Track adaptable al tema (claro/oscuro) salvo override
  const resolvedTrack = trackColor ?? 'color-mix(in srgb, var(--border) 85%, transparent)';

  const VIEW_BOX = 36;
  const RADIUS = (VIEW_BOX - stroke) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100);

  const PATH = `M ${VIEW_BOX / 2} ${stroke / 2}
                a ${RADIUS} ${RADIUS} 0 0 1 0 ${VIEW_BOX - stroke}
                a ${RADIUS} ${RADIUS} 0 0 1 0 -${VIEW_BOX - stroke}`;

  return (
    <div
      className={cn('relative inline-flex shrink-0', config.wrapper, className)}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score de riesgo: ${formatScore(clampedScore, scoreFormat)} (${resolvedLevel})`}
      data-risk-level={resolvedLevel}
    >
      <svg
        viewBox={`0 0 ${VIEW_BOX} ${VIEW_BOX}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        {/* Track — sigue el tema */}
        <path d={PATH} fill="none" stroke={resolvedTrack} strokeWidth={stroke} />
        {/* Progreso — color desde Risk (o override) */}
        <path
          d={PATH}
          fill="none"
          stroke={finalColor}
          strokeWidth={stroke}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{
            transition: animate ? `stroke-dashoffset ${animationDuration}ms ease-out` : 'none',
          }}
        />
      </svg>

      {(showScore || children) && (
        <div
          className={cn(
            'absolute inset-0 flex select-none items-center justify-center',
            'font-sans leading-none',
            config.fontSize,
            config.fontWeight,
          )}
          style={{ color: finalColor }}
        >
          {children ?? formatScore(clampedScore, scoreFormat)}
        </div>
      )}
    </div>
  );
}
