// ¿Qué? Gráfico de agregaciones horizontal para analíticas TriDa.
// ¿Para qué? Visualizar distribuciones por tipo, ciudad, canal y banco sin emojis ni hex sueltos.
// ¿Impacto? Reutilizado en AnalyticsPage; soporte completo de iconos Lucide como ReactNode.

import { useMemo, type ReactNode } from 'react';
import { EmptyState } from '@components/ui/EmptyState';

// ==============================================================================
// TYPES (Una sola declaración limpia)
// ==============================================================================

export interface ChartItem {
  label: string;
  count: number;
  fraud?: number;
  amount?: number;
  color?: string;
  icon?: ReactNode;
}

export interface AggregationChartProps {
  title: string;
  data: ChartItem[];
  barColor?: string;
  showFraudColumn?: boolean;
  maxItems?: number;
  emptyMessage?: string;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AggregationChart({
  title,
  data,
  barColor = '#6366F1',
  showFraudColumn = false,
  maxItems,
  emptyMessage = 'Sin datos',
  className = '',
}: AggregationChartProps) {
  const visibleData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  }, [data, maxItems]);

  const maxCount = useMemo(() => Math.max(...visibleData.map((d) => d.count), 1), [visibleData]);

  if (visibleData.length === 0) {
    return (
      <div
        className={`flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 font-sans ${className}`}
      >
        <h3 className="m-0 text-sm font-bold text-[var(--text-primary)]">{title}</h3>
        <EmptyState preset="no-data" description={emptyMessage} size="sm" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 font-sans ${className}`}
      role="figure"
      aria-label={`Gráfico: ${title}`}
    >
      <h3 className="m-0 text-sm font-bold text-[var(--text-primary)]">{title}</h3>

      <div className="flex flex-col gap-2">
        {visibleData.map((item, index) => {
          const percentage = (item.count / maxCount) * 100;
          const itemColor = item.color ?? barColor;
          const hasFraud = (item.fraud ?? 0) > 0;

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex w-full items-center gap-2.5 font-sans"
              title={`${item.label}: ${item.count.toLocaleString('es-CO')} transacciones${
                item.fraud !== undefined ? ` (${item.fraud} fraudes)` : ''
              }`}
            >
              {/* Label + Icono Lucide */}
              <span className="flex w-28 shrink-0 items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-[var(--text-secondary)]">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </span>

              {/* Barra */}
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-full rounded-full transition-[width] duration-300 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: itemColor,
                  }}
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${item.label}: ${item.count}`}
                />
              </div>

              {/* Conteo */}
              <span className="w-[45px] shrink-0 text-right text-xs font-bold tabular-nums text-[var(--text-primary)]">
                {item.count.toLocaleString('es-CO')}
              </span>

              {/* Fraudes */}
              {showFraudColumn && (
                <span
                  className={`w-[35px] shrink-0 text-right text-[11px] font-semibold tabular-nums ${
                    hasFraud ? 'text-[var(--risk-critical)]' : 'text-[var(--risk-low)]'
                  }`}
                >
                  {item.fraud ?? 0}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
