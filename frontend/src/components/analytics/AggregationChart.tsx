// ¿Qué? Gráfico de barras horizontal para mostrar agregaciones de datos.
// ¿Para qué? Reemplazar los 4 gráficos inline de analytics.jsx que tenían
//            markup casi idéntico pero con datos diferentes.
// ¿Impacto? Se usa 4 veces en AnalyticsPage: por tipo, por ciudad, por canal
//           y por banco. Un solo componente tipado y reutilizable.

import { useMemo } from 'react';
import { EmptyState } from '@components/ui/EmptyState';

// ==============================================================================
// TYPES
// ==============================================================================

/** Estructura de un item del gráfico. */
export interface ChartItem {
  label: string;
  count: number;
  fraud?: number;
  amount?: number;
  color?: string;
  icon?: string;
}

/** Props del AggregationChart. */
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

  // ==============================================================================
  // DATOS PROCESADOS
  // ==============================================================================

  const visibleData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return maxItems ? sorted.slice(0, maxItems) : sorted;
  }, [data, maxItems]);

  const maxCount = useMemo(
    () => Math.max(...visibleData.map(d => d.count), 1),
    [visibleData]
  );

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '12px',
    padding:       '16px',
    fontFamily:    'Inter, sans-serif',
    display:       'flex',
    flexDirection: 'column',
    gap:           '14px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:   '14px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
  };

  const rowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '10px',
    width:      '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:     '12px',
    fontWeight:   500,
    color:        'var(--text-secondary)',
    width:        '120px',
    flexShrink:   0,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
    display:      'flex',
    alignItems:   'center',
    gap:          '4px',
  };

  const barTrackStyle: React.CSSProperties = {
    flex:         1,
    height:       '8px',
    background:   'var(--bg-tertiary)',
    borderRadius: '4px',
    overflow:     'hidden',
  };

  const countStyle: React.CSSProperties = {
    fontSize:           '12px',
    fontWeight:         700,
    color:              'var(--text-primary)',
    width:              '45px',
    textAlign:          'right',
    fontVariantNumeric: 'tabular-nums',
    flexShrink:         0,
  };

  const fraudStyle = (hasFraud: boolean): React.CSSProperties => ({
    fontSize:           '11px',
    fontWeight:         600,
    color:              hasFraud ? '#EF4444' : '#34D399',
    width:              '35px',
    textAlign:          'right',
    fontVariantNumeric: 'tabular-nums',
    flexShrink:         0,
  });

  const listStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '8px',
  };

  // ==============================================================================
  // RENDER — VACÍO
  // ==============================================================================

  if (visibleData.length === 0) {
    return (
      <div className={`aggregation-chart ${className}`} style={wrapperStyle}>
        <h3 style={titleStyle}>{title}</h3>
        <EmptyState
          preset="no-data"
          description={emptyMessage}
          size="sm"
        />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — GRÁFICO
  // ==============================================================================

  return (
    <div
      className={`aggregation-chart ${className}`}
      style={wrapperStyle}
      role="figure"
      aria-label={`Gráfico: ${title}`}
    >
      <h3 style={titleStyle}>{title}</h3>

      <div style={listStyle}>
        {visibleData.map((item) => {
          const percentage = (item.count / maxCount) * 100;
          const itemColor = item.color ?? barColor;
          const hasFraud = (item.fraud ?? 0) > 0;

          return (
            <div
              key={item.label}
              style={rowStyle}
              title={`${item.label}: ${item.count.toLocaleString('es-CO')} transacciones${
                item.fraud !== undefined ? ` (${item.fraud} fraudes)` : ''
              }`}
            >
              {/* Label */}
              <span style={labelStyle}>
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </span>

              {/* Barra */}
              <div style={barTrackStyle}>
                <div
                  style={{
                    height:       '100%',
                    width:        `${percentage}%`,
                    background:   itemColor,
                    borderRadius: '4px',
                    transition:   'width 0.3s ease',
                  }}
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${item.label}: ${item.count}`}
                />
              </div>

              {/* Conteo */}
              <span style={countStyle}>
                {item.count.toLocaleString('es-CO')}
              </span>

              {/* Fraudes (opcional) */}
              {showFraudColumn && (
                <span style={fraudStyle(hasFraud)}>
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