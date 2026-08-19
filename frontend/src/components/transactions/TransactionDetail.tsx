// ¿Qué? Contenido del panel de detalle de una transacción bancaria.
// ¿Para qué? Extraer la vista de detalle que se usa en TransactionsPage (panel lateral)
//            y potencialmente en AlertsPage o modales de detalle.
// ¿Impacto? Cualquier lugar que muestre el detalle de una transacción usa este componente.

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
import type { Transaction } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface TransactionDetailProps {
  transaction: Transaction;
  showScoreRing?: boolean;
  scoreRingSize?: 'sm' | 'md' | 'lg' | 'xl';
  showTechnicalInfo?: boolean;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function TransactionDetail({
  transaction,
  showScoreRing = true,
  scoreRingSize = 'lg',
  showTechnicalInfo = true,
  className = '',
}: TransactionDetailProps) {

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const ringContainerStyle: React.CSSProperties = {
    display:        'flex',
    justifyContent: 'center',
    marginBottom:   '20px',
  };

  const fraudIndicatorStyle: React.CSSProperties = {
    color:      transaction.isFraud ? '#EF4444' : '#34D399',
    fontWeight: 700,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className={`transaction-detail ${className}`}>
      {/* Score Ring grande centrado */}
      {showScoreRing && (
        <div style={ringContainerStyle}>
          <ScoreRing
            score={transaction.riskScore}
            size={scoreRingSize}
          />
        </div>
      )}

      {/* Información principal */}
      <DetailSection title="Información de la transacción">
        <DetailGrid columns={2}>
          <DetailField label="Usuario" value={transaction.user} />
          <DetailField label="Cuenta" value={transaction.account} />
          <DetailField
            label="Banco"
            value={<BankBadge bank={transaction.bank} />}
          />
          <DetailField label="Tipo" value={transaction.type} />
          <DetailField
            label="Monto"
            value={formatCurrency(transaction.amount, transaction.currency)}
            valueStyle={{ fontSize: '16px', fontWeight: 800 }}
          />
          <DetailField
            label="Riesgo"
            value={<RiskBadge score={transaction.riskScore} mode="both" />}
          />
        </DetailGrid>
      </DetailSection>

      <DetailDivider />

      {/* Ubicación y canal */}
      <DetailSection title="Ubicación y dispositivo">
        <DetailGrid columns={2}>
          <DetailField label="Ciudad" value={transaction.location.city} />
          <DetailField label="Canal" value={transaction.channel} />
          <DetailField label="Dispositivo" value={transaction.device.type} />
          <DetailField
            label="Estado"
            value={<StatusBadge type="transaction" status={transaction.status} />}
          />
        </DetailGrid>
      </DetailSection>

      <DetailDivider />

      {/* Verificación y fecha */}
      <DetailSection title="Verificación">
        <DetailGrid columns={2}>
          <DetailField
            label="¿Fraude confirmado?"
            value={
              <span style={fraudIndicatorStyle}>
                {transaction.isFraud ? 'Sí — Confirmado' : 'No — Sin confirmar'}
              </span>
            }
          />
          <DetailField
            label="Fecha y hora"
            value={formatDateTime(transaction.timestamp)}
          />
        </DetailGrid>
      </DetailSection>

      {/* Información técnica (opcional) */}
      {showTechnicalInfo && (
        <>
          <DetailDivider />
          <DetailSection title="Información técnica">
            <DetailGrid columns={2}>
              <DetailField
                label="Latencia"
                value={`${transaction.processingTime} ms`}
              />
              <DetailField label="Moneda" value={transaction.currency} />
              <DetailField
                label="ID transacción"
                value={
                  <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    {transaction.id}
                  </span>
                }
              />
            </DetailGrid>
          </DetailSection>
        </>
      )}
    </div>
  );
}