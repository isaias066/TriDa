// ¿Qué? Contenido del popup que aparece al hacer click en un marcador del mapa.
// ¿Para qué? Reemplazar el markup inline que estaba dentro de cada <Popup> en
//            transactionmap.jsx con un componente tipado y reutilizable.
// ¿Impacto? Se usa dentro de MapPointMarker para mostrar info de la transacción.

import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import { formatCurrency } from '@utils/Formatters';
import type { TransactionMapPoint } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface MapPointPopupProps {
  point: TransactionMapPoint;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Obtiene el label de estado legible en español.
 */
function getStatusLabel(status: string): string {
  switch (status) {
    case 'blocked': return '🚫 Bloqueada';
    case 'flagged': return '⚠️ Marcada';
    case 'pending': return '⏱ Pendiente';
    default:        return '✅ Aprobada';
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function MapPointPopup({ point, className = '' }: MapPointPopupProps) {
  const color = RISK_COLORS[point.alertLevel as RiskLevel] ?? '#6366F1';

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    fontFamily:    'Inter, sans-serif',
    fontSize:      '12px',
    minWidth:      '220px',
    maxWidth:      '280px',
    padding:       '4px',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '8px',
    paddingBottom:  '8px',
    marginBottom:   '8px',
    borderBottom:   '1px solid rgba(0,0,0,0.1)',
  };

  const idStyle: React.CSSProperties = {
    fontFamily:  'monospace',
    fontWeight:  700,
    fontSize:    '12px',
    color:       '#1F2937',
  };

  const scoreStyle: React.CSSProperties = {
    fontWeight:  800,
    fontSize:    '13px',
    color:       color,
  };

  const rowStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'center',
    gap:            '12px',
    padding:        '3px 0',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:   '11px',
    color:      '#6B7280',
    fontWeight: 500,
  };

  const valueStyle: React.CSSProperties = {
    fontSize:   '11px',
    fontWeight: 600,
    color:      '#1F2937',
    textAlign:  'right',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className={`map-point-popup ${className}`} style={wrapperStyle}>
      {/* Header: ID + Score */}
      <div style={headerStyle}>
        <span style={idStyle}>{point.id}</span>
        <span style={scoreStyle}>{point.riskScore}%</span>
      </div>

      {/* Filas de datos */}
      <div style={rowStyle}>
        <span style={labelStyle}>Usuario</span>
        <span style={valueStyle}>{point.user}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Banco</span>
        <span style={{ ...valueStyle, color: point.bank.color }}>
          {point.bank.name}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Tipo</span>
        <span style={valueStyle}>{point.type}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Monto</span>
        <span style={{ ...valueStyle, fontFamily: 'monospace' }}>
          {formatCurrency(point.amount, point.currency)}
        </span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Ciudad</span>
        <span style={valueStyle}>{point.location.city}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Canal</span>
        <span style={valueStyle}>{point.channel}</span>
      </div>

      <div style={rowStyle}>
        <span style={labelStyle}>Estado</span>
        <span style={{ ...valueStyle, color }}>
          {getStatusLabel(point.status)}
        </span>
      </div>
    </div>
  );
}