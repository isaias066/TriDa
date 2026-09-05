// ¿Qué? Card de métrica del Dashboard (ícono, valor, label).
// ¿Para qué? Métricas clave con acentos de color coherentes con Risk.ts.
// ¿Impacto? StatsCardsGrid / DashboardPage.

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { RISK_COLORS, riskColorAlpha, type RiskLevel } from '@constants/Risk';
import { cn } from '@utils/cn';

/** Variantes UI genéricas + alias directos a niveles de riesgo. */
export type StatsCardVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | RiskLevel; // low | medium | high | critical

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

/** Mapa único: variantes semánticas → hex (las de riesgo delegan en RISK_COLORS). */
const VARIANT_COLORS: Record<StatsCardVariant, string> = {
  primary: '#6366F1',
  info: '#06B6D4',
  // Semánticas alineadas a Risk
  success: RISK_COLORS.low,
  warning: RISK_COLORS.medium,
  danger: RISK_COLORS.critical,
  // Alias directos de riesgo (usar estos en cards de alertas)
  low: RISK_COLORS.low,
  medium: RISK_COLORS.medium,
  high: RISK_COLORS.high,
  critical: RISK_COLORS.critical,
};

function resolveAccent(variant: StatsCardVariant): string {
  return VARIANT_COLORS[variant] ?? VARIANT_COLORS.primary;
}

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
  const color = resolveAccent(variant);
  const isClickable = Boolean(onClick);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (!isClickable) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-[80px] items-center gap-3.5 rounded-xl border border-[var(--border)]',
        'bg-[var(--bg-secondary)] p-4 font-sans outline-none transition-all duration-150',
        isClickable &&
          'cursor-pointer hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-500/40',
        className,
      )}
      style={
        isClickable ? ({ ['--stats-accent' as string]: color } as React.CSSProperties) : undefined
      }
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={(e) => {
        if (isClickable) e.currentTarget.style.borderColor = `${color}66`;
      }}
      onMouseLeave={(e) => {
        if (isClickable) e.currentTarget.style.borderColor = '';
      }}
      role={isClickable ? 'button' : 'group'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={typeof value === 'string' ? `${label}: ${value}` : label}
      data-variant={variant}
    >
      {/* Ícono */}
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]',
          animated && 'animate-pulse',
        )}
        style={{ backgroundColor: `${color}18`, color }}
        aria-hidden="true"
      >
        <Icon size={20} strokeWidth={1.8} />
      </div>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="truncate text-lg font-extrabold tabular-nums leading-tight tracking-tight text-[var(--text-primary)]">
            {value}
          </span>

          {trend && (
            <span
              className="whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-bold"
              style={{
                color: trend.isPositive ? RISK_COLORS.low : RISK_COLORS.critical,
                backgroundColor: trend.isPositive
                  ? riskColorAlpha('low', 0.15)
                  : riskColorAlpha('critical', 0.15),
              }}
              aria-label={`Tendencia: ${trend.value}`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>

        <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </span>

        {subtitle && (
          <span className="mt-0.5 text-[10px] font-normal leading-snug text-[var(--text-tertiary)]">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
