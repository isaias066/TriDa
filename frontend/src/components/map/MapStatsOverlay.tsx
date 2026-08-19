// ¿Qué? Contadores flotantes que se muestran sobre el mapa.
// ¿Para qué? Reemplazar el overlay inline de transactionmap.jsx con contadores
//            de transacciones por estado (activas, críticas, altas, aprobadas).
// ¿Impacto? Se usa en TransactionMapPage, posicionado sobre el mapa con position absolute.

import type { MapStats } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

/** Props del MapStatsOverlay. */
export interface MapStatsOverlayProps {
  stats: MapStats;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

// ==============================================================================
// CONSTANTES
// ==============================================================================

const POSITION_STYLES: Record<NonNullable<MapStatsOverlayProps['position']>, React.CSSProperties> = {
  'top-left':     { top: '16px', left: '16px' },
  'top-right':    { top: '16px', right: '16px' },
  'bottom-left':  { bottom: '16px', left: '16px' },
  'bottom-right': { bottom: '16px', right: '16px' },
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function MapStatsOverlay({
  stats,
  position = 'bottom-left',
  className = '',
}: MapStatsOverlayProps) {
  const posStyle = POSITION_STYLES[position];

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:       'absolute',
    ...posStyle,
    display:        'flex',
    gap:            '8px',
    zIndex:         1000,
    pointerEvents:  'none',
    fontFamily:     'Inter, sans-serif',
  };

  const statStyle: React.CSSProperties = {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    gap:            '2px',
    padding:        '8px 14px',
    background:     'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(8px)',
    borderRadius:   '10px',
    border:         '1px solid rgba(255, 255, 255, 0.08)',
  };

  const valueStyle = (color: string): React.CSSProperties => ({
    fontSize:           '18px',
    fontWeight:         800,
    color,
    lineHeight:         1,
    fontVariantNumeric: 'tabular-nums',
  });

  const labelStyle: React.CSSProperties = {
    fontSize:      '9px',
    fontWeight:    600,
    color:         'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  // ==============================================================================
  // DATOS A MOSTRAR
  // ==============================================================================

  const items = [
    { value: stats.total,    label: 'Activas',   color: '#F3F4F6' },
    { value: stats.critical, label: 'Críticas',  color: '#EF4444' },
    { value: stats.high,     label: 'Altas',     color: '#F97316' },
    { value: stats.approved, label: 'Aprobadas', color: '#34D399' },
  ];

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`map-stats-overlay ${className}`}
      style={wrapperStyle}
      role="status"
      aria-label="Estadísticas del mapa"
    >
      {items.map(item => (
        <div key={item.label} style={statStyle}>
          <span style={valueStyle(item.color)}>
            {item.value.toLocaleString('es-CO')}
          </span>
          <span style={labelStyle}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}