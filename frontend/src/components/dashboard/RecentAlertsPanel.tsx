// ¿Qué? Panel lateral que muestra las alertas más recientes del sistema.
// ¿Para qué? Reemplazar el bloque float-alerts de dashboards.jsx que renderizaba
//            las alertas recientes con markup inline y estilos duplicados.
// ¿Impacto? Se usa exclusivamente en DashboardPage para dar visibilidad rápida
//           a las últimas transacciones sospechosas detectadas por el modelo IA.

import { AlertTriangle, ChevronRight, Radio } from 'lucide-react';
import type { RecentAlert } from '@app-types';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatTime } from '@utils/Formatters';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';

// ==============================================================================
// TYPES
// ==============================================================================

export interface RecentAlertsPanelProps {
  alerts: RecentAlert[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  onAlertClick?: (alert: RecentAlert) => void;
  title?: string;
  isLive?: boolean;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function RecentAlertsPanel({
  alerts,
  loading = false,
  maxItems = 20,
  onViewAll,
  onAlertClick,
  title = 'Alertas recientes',
  isLive = false,
  className = '',
}: RecentAlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxItems);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const panelStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '12px',
    fontFamily:    'Inter, sans-serif',
    overflow:      'hidden',
    minHeight:     '300px',
    maxHeight:     '600px',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '12px',
    padding:        '16px',
    borderBottom:   '1px solid var(--border)',
    flexShrink:     0,
  };

  const headerLeftStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flex:       1,
  };

  const headerIconStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    color:      'var(--text-secondary)',
  };

  const headerTitleStyle: React.CSSProperties = {
    fontSize:   '13px',
    fontWeight: 700,
    color:      'var(--text-primary)',
  };

  const countBadgeStyle: React.CSSProperties = {
    fontSize:       '10px',
    fontWeight:     700,
    color:          '#818CF8',
    background:     'rgba(99, 102, 241, 0.15)',
    padding:        '3px 8px',
    borderRadius:   '10px',
    fontVariantNumeric: 'tabular-nums',
  };

  const liveIndicatorStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '4px',
    fontSize:   '10px',
    fontWeight: 600,
    color:      '#34D399',
  };

  const liveDotStyle: React.CSSProperties = {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#34D399',
    animation:    'recent-alerts-pulse 2s ease-in-out infinite',
  };

  const listStyle: React.CSSProperties = {
    flex:       1,
    overflowY:  'auto',
    overflowX:  'hidden',
    padding:    '4px 0',
  };

  const footerStyle: React.CSSProperties = {
    padding:    '12px 16px',
    borderTop:  '1px solid var(--border)',
    flexShrink: 0,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`recent-alerts-panel ${className}`}
      style={panelStyle}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLeftStyle}>
          <span style={headerIconStyle}>
            <AlertTriangle size={15} strokeWidth={2} />
          </span>
          <span style={headerTitleStyle}>{title}</span>
          <span style={countBadgeStyle}>{alerts.length}</span>
        </div>

        {isLive && (
          <div style={liveIndicatorStyle} aria-label="Datos en tiempo real">
            <span style={liveDotStyle} />
            <Radio size={10} />
          </div>
        )}
      </div>

      {/* Lista de alertas */}
      <div style={listStyle}>
        {loading ? (
          <div style={{ padding: '40px 20px' }}>
            <Spinner label="Cargando alertas..." centered />
          </div>
        ) : visibleAlerts.length === 0 ? (
          <EmptyState
            preset="no-alerts"
            size="sm"
          />
        ) : (
          visibleAlerts.map((alert, index) => (
            <RecentAlertItem
              key={`${alert.id}-${index}`}
              alert={alert}
              onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
            />
          ))
        )}
      </div>

      {/* Footer con "Ver todas" */}
      {onViewAll && !loading && visibleAlerts.length > 0 && (
        <div style={footerStyle}>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            rightIcon={<ChevronRight size={14} />}
            onClick={onViewAll}
          >
            Ver todas las alertas
          </Button>
        </div>
      )}

      <style>{`
        @keyframes recent-alerts-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — RecentAlertItem
// ==============================================================================

interface RecentAlertItemProps {
  alert: RecentAlert;
  onClick?: () => void;
}

/**
 * Item individual de alerta reciente.
 */
function RecentAlertItem({ alert, onClick }: RecentAlertItemProps) {
  const level = alert.level as RiskLevel;
  const color = alert.color || RISK_COLORS[level] || 'var(--text-tertiary)';
  const levelLabel = RISK_LEVELS[level]?.label ?? level;
  const isClickable = Boolean(onClick);

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const itemStyle: React.CSSProperties = {
    display:     'flex',
    alignItems:  'flex-start',
    gap:         '10px',
    padding:     '10px 16px',
    cursor:      isClickable ? 'pointer' : 'default',
    transition:  'background 0.15s ease',
    borderLeft:  'none',
  };

  const dotStyle: React.CSSProperties = {
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   color,
    flexShrink:   0,
    marginTop:    '5px',
    boxShadow:    `0 0 6px ${color}40`,
  };

  const contentStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '3px',
    flex:          1,
    minWidth:      0,
  };

  const row1Style: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    gap:            '8px',
  };

  const idStyle: React.CSSProperties = {
    fontSize:           '11px',
    fontWeight:         700,
    color:              'var(--text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    fontFamily:         'ui-monospace, monospace',
  };

  const timeStyle: React.CSSProperties = {
    fontSize:           '10px',
    color:              'var(--text-tertiary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace:         'nowrap',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize:     '12px',
    color:        'var(--text-secondary)',
    lineHeight:   1.4,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const row3Style: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flexWrap:   'wrap',
  };

  const amountStyle: React.CSSProperties = {
    fontSize:           '11px',
    fontWeight:         700,
    color:              'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
  };

  const levelStyle: React.CSSProperties = {
    fontSize:      '9px',
    fontWeight:    700,
    color:         color,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const originStyle: React.CSSProperties = {
    fontSize:  '10px',
    color:     'var(--text-tertiary)',
  };

  // ==============================================================================
  // FORMATEO
  // ==============================================================================

  const alertId = alert.id ? `#${String(alert.id).padStart(4, '0')}` : '';
  const alertTime = formatTime(alert.timestamp);

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className="recent-alert-item"
      style={itemStyle}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`Alerta ${alertId}: ${alert.description}`}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {/* Dot de color */}
      <span style={dotStyle} aria-hidden="true" />

      {/* Contenido */}
      <div style={contentStyle}>
        {/* Fila 1: ID + hora */}
        <div style={row1Style}>
          <span style={idStyle}>{alertId}</span>
          <span style={timeStyle}>{alertTime}</span>
        </div>

        {/* Fila 2: Descripción */}
        <span style={descriptionStyle} title={alert.description}>
          {alert.description}
        </span>

        {/* Fila 3: Monto + origen + nivel */}
        <div style={row3Style}>
          {alert.amount !== null && alert.amount !== undefined && (
            <span style={amountStyle}>{formatCurrency(alert.amount)}</span>
          )}
          {alert.origin && (
            <>
              <span style={originStyle}>·</span>
              <span style={originStyle}>{alert.origin}</span>
            </>
          )}
          <span style={levelStyle}>{levelLabel.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}