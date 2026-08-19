// ¿Qué? Contenido del panel de detalle de una alerta de fraude.
// ¿Para qué? Extraer la vista de detalle que se repite o puede reutilizarse
//            en AlertsPage (panel lateral) y DashboardPage (click en alerta reciente).
// ¿Impacto? Cualquier lugar que muestre el detalle de una alerta usa este componente.

import { ScoreRing } from '@components/shared/ScoreRing';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import {
  DetailGrid,
  DetailField,
  DetailDivider,
  DetailSection,
} from '@components/shared/DetailPanel';
import { formatCurrency, formatDateTime } from '@utils/Formatters';
import type { Alert } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AlertDetailProps {
  alert: Alert;
  showScoreRing?: boolean;
  scoreRingSize?: 'sm' | 'md' | 'lg' | 'xl';
  showFactors?: boolean;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AlertDetail({
  alert,
  showScoreRing = true,
  scoreRingSize = 'lg',
  showFactors = true,
  className = '',
}: AlertDetailProps) {

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const ringContainerStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'center',
    marginBottom:   '20px',
  };

  const fraudIndicatorStyle: React.CSSProperties = {
    color:      alert.isFraud ? '#EF4444' : '#34D399',
    fontWeight: 700,
  };

  const factorsTextStyle: React.CSSProperties = {
    fontSize:   '12px',
    color:      'var(--text-secondary)',
    lineHeight: 1.5,
    marginTop:  '6px',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className={`alert-detail ${className}`}>
      {/* Score Ring grande centrado */}
      {showScoreRing && (
        <div style={ringContainerStyle}>
          <ScoreRing
            score={alert.riskScore}
            size={scoreRingSize}
          />
        </div>
      )}

      {/* Grid de campos */}
      <DetailGrid columns={2}>
        <DetailField label="Usuario" value={alert.user} />
        <DetailField label="Cuenta" value={alert.account} />
        <DetailField
          label="Banco"
          value={<BankBadge bank={alert.bank} />}
        />
        <DetailField label="Tipo" value={alert.type} />
        <DetailField
          label="Monto"
          value={formatCurrency(alert.amount)}
          valueStyle={{ fontSize: '16px', fontWeight: 800 }}
        />
        <DetailField
          label="Riesgo"
          value={<RiskBadge score={alert.riskScore} mode="both" />}
        />
        <DetailField label="Ciudad" value={alert.location.city} />
        <DetailField label="Canal" value={alert.channel} />
        <DetailField label="Dispositivo" value={alert.device.type} />
        <DetailField
          label="Estado"
          value={<StatusBadge type="transaction" status={alert.status} />}
        />
        <DetailField
          label="¿Fraude?"
          value={
            <span style={fraudIndicatorStyle}>
              {alert.isFraud ? 'Sí' : 'No'}
            </span>
          }
        />
        <DetailField
          label="Fecha"
          value={formatDateTime(alert.timestamp)}
        />
      </DetailGrid>

      {/* Factores sospechosos */}
      {showFactors && alert.factors && (
        <>
          <DetailDivider />
          <DetailSection title="Factores sospechosos">
            <p style={factorsTextStyle}>{alert.factors}</p>
          </DetailSection>
        </>
      )}
    </div>
  );
}