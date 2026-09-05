// ¿Qué? Barras de distribución de alertas por nivel de riesgo para el Dashboard.
// ¿Para qué? Visualizar de forma clara cuántas alertas hay en cada nivel usando la paleta canónica de Risk.ts.
// ¿Impacto? Corrije el error de tipos TS en LevelBarProps y se sincroniza con los colores del motor de riesgo.

import {
  RISK_COLORS,
  RISK_LEVELS,
  RISK_LEVEL_ORDER,
  riskColorAlpha,
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

interface SizeConfig {
  barHeight: string;
  countSize: string;
  labelSize: string;
  gap: string;
}

// ==============================================================================
// CONSTANTES
// ==============================================================================

const SIZE_DIMENSIONS: Record<NonNullable<AlertsByLevelRingsProps['size']>, SizeConfig> = {
  sm: {
    barHeight: 'h-1.5',
    countSize: 'text-xs',
    labelSize: 'text-[10px]',
    gap: 'gap-2.5',
  },
  md: {
    barHeight: 'h-2',
    countSize: 'text-[13px]',
    labelSize: 'text-[11px]',
    gap: 'gap-3.5',
  },
  lg: {
    barHeight: 'h-2.5',
    countSize: 'text-[15px]',
    labelSize: 'text-xs',
    gap: 'gap-4',
  },
};

// ==============================================================================
// COMPONENTE PRINCIPAL
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
  const maxCount = Math.max(...RISK_LEVEL_ORDER.map((level) => counts[level] ?? 0), 1);

  return (
    <div
      className={`flex w-full flex-col font-sans ${dims.gap} ${className}`}
      role="group"
      aria-label="Distribución de alertas por nivel de riesgo"
    >
      <div className={`flex w-full flex-col ${dims.gap}`}>
        {RISK_LEVEL_ORDER.map((level) => {
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
  dims: SizeConfig; // Fix de TS: Ahora acepta el objeto genérico de dimensiones
  clickable: boolean;
  onClick: () => void;
}

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
      className={`group w-full rounded-lg px-1 py-0.5 outline-none transition-colors duration-150 ${
        clickable
          ? 'cursor-pointer hover:bg-[var(--bg-tertiary)] focus-visible:bg-[var(--bg-tertiary)]'
          : ''
      }`}
      onClick={clickable ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={clickable ? 'button' : 'group'}
      tabIndex={clickable ? 0 : undefined}
      aria-label={`${label}: ${count} alertas (${percentOfTotal}%)`}
      data-level={level}
    >
      {/* Fila superior: punto de color + etiqueta + conteo */}
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${riskColorAlpha(level, 0.45)}`,
            }}
            aria-hidden="true"
          />
          <span
            className={`truncate font-semibold uppercase tracking-wide text-[var(--text-secondary)] ${dims.labelSize}`}
          >
            {label}
          </span>
        </div>

        <div className="flex shrink-0 items-baseline gap-1.5">
          <span
            className={`font-extrabold tabular-nums leading-none ${dims.countSize}`}
            style={{ color }}
          >
            {count.toLocaleString('es-CO')}
          </span>
          <span className="text-[10px] tabular-nums text-[var(--text-tertiary)]">
            {percentOfTotal}%
          </span>
        </div>
      </div>

      {/* Pista y Relleno de Barra */}
      <div
        className={`w-full overflow-hidden rounded-full bg-[var(--bg-tertiary)] ${dims.barHeight}`}
        role="progressbar"
        aria-valuenow={count}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Proporción ${label}`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${percentOfMax}%`,
            background: `linear-gradient(90deg, ${riskColorAlpha(level, 0.75)} 0%, ${color} 100%)`,
            boxShadow: count > 0 ? `0 0 12px ${riskColorAlpha(level, 0.35)}` : 'none',
          }}
        />
      </div>
    </div>
  );
}
