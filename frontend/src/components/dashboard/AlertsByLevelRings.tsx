// ¿Qué? Barras de distribución de alertas por nivel de riesgo.
// ¿Para qué? Mostrar de forma clara y comparable cuántas alertas hay en cada
//            criticidad (crítico, alto, medio, bajo) dentro del Dashboard.
// ¿Impacto? Se usa en DashboardPage; mantiene la misma API pública para no
//           romper imports existentes (AlertsByLevelRings).

import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
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

const SIZE_DIMENSIONS: Record<
  NonNullable<AlertsByLevelRingsProps['size']>,
  {
    barHeight: string;
    countSize: string;
    labelSize: string;
    gap: string;
    trackRadius: string;
  }
> = {
  sm: {
    barHeight: '6px',
    countSize: '12px',
    labelSize: '10px',
    gap: '10px',
    trackRadius: '9999px',
  },
  md: {
    barHeight: '8px',
    countSize: '13px',
    labelSize: '11px',
    gap: '14px',
    trackRadius: '9999px',
  },
  lg: {
    barHeight: '10px',
    countSize: '15px',
    labelSize: '12px',
    gap: '16px',
    trackRadius: '9999px',
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
  const maxCount = Math.max(...LEVEL_ORDER.map((level) => counts[level] ?? 0), 1);

  return (
    <div
      className={`alerts-by-level-bars flex w-full flex-col font-sans ${className}`}
      style={{ gap: dims.gap }}
      role="group"
      aria-label="Distribución de alertas por nivel de riesgo"
    >
      <div className="flex w-full flex-col" style={{ gap: dims.gap }}>
        {LEVEL_ORDER.map((level) => {
          const count = counts[level] ?? 0;
          const color = RISK_COLORS[level];
          const label = RISK_LEVELS[level].label;
          const percentOfMax = Math.round((count / maxCount) * 100);
          const percentOfTotal = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <LevelBar
              key={level}
              level={level}
              count={count}
              color={color}
              label={label}
              percentOfMax={percentOfMax}
              percentOfTotal={percentOfTotal}
              dims={dims}
              clickable={isClickable}
              onClick={() => onLevelClick?.(level)}
            />
          );
        })}
      </div>

      {showTotal && (
        <div className="mt-1 flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="text-xs font-medium text-[var(--text-tertiary)]">Total</span>
          <span className="text-xs font-bold tabular-nums text-[var(--text-secondary)]">
            {total.toLocaleString('es-CO')} alertas
          </span>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — LevelBar
// ==============================================================================

interface LevelBarProps {
  level: RiskLevel;
  count: number;
  color: string;
  label: string;
  percentOfMax: number;
  percentOfTotal: number;
  dims: (typeof SIZE_DIMENSIONS)['md'];
  clickable: boolean;
  onClick: () => void;
}

/**
 * Fila de nivel: label + conteo + barra proporcional al máximo del grupo.
 */
function LevelBar({
  level,
  count,
  color,
  label,
  percentOfMax,
  percentOfTotal,
  dims,
  clickable,
  onClick,
}: LevelBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!clickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`level-bar level-bar-${level} group w-full rounded-lg outline-none transition-colors duration-150 ${
        clickable
          ? 'cursor-pointer hover:bg-[var(--bg-tertiary)] focus-visible:bg-[var(--bg-tertiary)]'
          : ''
      }`}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : 'group'}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${label}: ${count} alertas (${percentOfTotal}%)`}
    >
      {/* Fila superior: label + count */}
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
            aria-hidden="true"
          />
          <span
            className="truncate font-semibold uppercase tracking-wide text-[var(--text-secondary)]"
            style={{ fontSize: dims.labelSize }}
          >
            {label}
          </span>
        </div>

        <div className="flex shrink-0 items-baseline gap-1.5">
          <span
            className="font-extrabold tabular-nums leading-none"
            style={{ fontSize: dims.countSize, color }}
          >
            {count.toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] tabular-nums text-[var(--text-tertiary)]">
            {percentOfTotal}%
          </span>
        </div>
      </div>

      {/* Track + fill */}
      <div
        className="w-full overflow-hidden bg-[var(--bg-tertiary)]"
        style={{
          height: dims.barHeight,
          borderRadius: dims.trackRadius,
        }}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Proporción ${label}`}
      >
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{
            width: `${percentOfMax}%`,
            borderRadius: dims.trackRadius,
            background: `linear-gradient(90deg, ${color}CC 0%, ${color} 100%)`,
            boxShadow: count > 0 ? `0 0 10px ${color}40` : 'none',
          }}
        />
      </div>
    </div>
  );
}