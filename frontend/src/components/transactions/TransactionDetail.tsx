// ¿Qué? Panel de detalle de una transacción bancaria.
// ¿Para qué? Vista reutilizable en TransactionsPage / AlertsPage con score centrado.
// ¿Impacto? Número de score 100% centrado sin círculos ni arcos rotos, con colores de Risk.ts.

import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import {
  DetailGrid,
  DetailField,
  DetailDivider,
  DetailSection,
} from '@components/shared/DetailPanel';
import { RISK_COLORS, RISK_LEVELS, getRiskLevel, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatDateTime } from '@utils/Formatters';
import { cn } from '@utils/cn';
import type { Transaction } from '@app-types';

export interface TransactionDetailProps {
  transaction: Transaction;
  showScoreRing?: boolean;
  scoreRingSize?: 'sm' | 'md' | 'lg' | 'xl';
  showTechnicalInfo?: boolean;
  riskLevel?: RiskLevel;
  className?: string;
}

function resolveFraudPresentation(isFraud: boolean | null | undefined): {
  label: string;
  color: string;
} {
  if (isFraud === true) {
    return { label: 'Sí — Confirmado', color: RISK_COLORS.critical };
  }
  if (isFraud === false) {
    return { label: 'No — Descartado / falso positivo', color: RISK_COLORS.low };
  }
  return { label: 'Pendiente de validación', color: 'var(--text-secondary)' };
}

export function TransactionDetail({
  transaction,
  showScoreRing = true,
  showTechnicalInfo = true,
  riskLevel,
  className = '',
}: TransactionDetailProps) {
  const score = Math.min(100, Math.max(0, Number(transaction.riskScore) || 0));
  const level = riskLevel ?? getRiskLevel(score);
  const fraud = resolveFraudPresentation(transaction.isFraud);

  return (
    <div className={cn('transaction-detail font-sans', className)}>
      {/* Score de Riesgo Centrado (Sin círculos) */}
      {showScoreRing && <RiskScoreHero score={score} level={level} />}

      {/* Información principal */}
      <DetailSection title="Información de la transacción">
        <DetailGrid columns={2}>
          <DetailField label="Usuario" value={transaction.user} />
          <DetailField label="Cuenta" value={transaction.account} />
          <DetailField label="Banco" value={<BankBadge bank={transaction.bank} />} />
          <DetailField label="Tipo" value={transaction.type} />
          <DetailField
            label="Monto"
            value={
              <span className="text-base font-extrabold tabular-nums text-[var(--text-primary)]">
                {formatCurrency(transaction.amount, transaction.currency)}
              </span>
            }
          />
          <DetailField label="Riesgo" value={<RiskBadge score={score} mode="both" />} />
        </DetailGrid>
      </DetailSection>

      <DetailDivider />

      {/* Ubicación y Dispositivo */}
      <DetailSection title="Ubicación y dispositivo">
        <DetailGrid columns={2}>
          <DetailField label="Ciudad" value={transaction.location?.city ?? '—'} />
          <DetailField
            label="Canal"
            value={
              <span className="uppercase tracking-wide text-[var(--text-primary)]">
                {transaction.channel ?? '—'}
              </span>
            }
          />
          <DetailField label="Dispositivo" value={transaction.device?.type ?? '—'} />
          <DetailField
            label="Estado"
            value={<StatusBadge type="transaction" status={transaction.status} />}
          />
        </DetailGrid>
      </DetailSection>

      <DetailDivider />

      {/* Verificación */}
      <DetailSection title="Verificación">
        <DetailGrid columns={2}>
          <DetailField
            label="¿Fraude confirmado?"
            value={
              <span className="font-bold" style={{ color: fraud.color }}>
                {fraud.label}
              </span>
            }
          />
          <DetailField label="Fecha y hora" value={formatDateTime(transaction.timestamp)} />
        </DetailGrid>
      </DetailSection>

      {/* Información Técnica Opcional */}
      {showTechnicalInfo && (
        <>
          <DetailDivider />
          <DetailSection title="Información técnica">
            <DetailGrid columns={2}>
              <DetailField
                label="Latencia"
                value={
                  transaction.processingTime != null ? `${transaction.processingTime} ms` : '—'
                }
              />
              <DetailField label="Moneda" value={transaction.currency ?? '—'} />
              <DetailField
                label="ID transacción"
                value={
                  <span className="font-mono text-[11px] text-[var(--text-secondary)]">
                    {transaction.id}
                  </span>
                }
              />
              <DetailField
                label="Nivel resuelto"
                value={
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: RISK_COLORS[level] }}
                  >
                    {RISK_LEVELS[level].label}
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

// ==============================================================================
// SUB-COMPONENTE — RiskScoreHero (Centrado, limpio y estético)
// ==============================================================================

function RiskScoreHero({ score, level }: { score: number; level: RiskLevel }) {
  const color = RISK_COLORS[level];
  const meta = RISK_LEVELS[level];

  return (
    <div
      className="mb-5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-5 text-center font-sans"
      data-risk-level={level}
    >
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">
        Score de Riesgo
      </span>

      {/* Porcentaje grande 100% centrado */}
      <div className="my-1.5 flex items-baseline justify-center gap-0.5">
        <span
          className="text-5xl font-black tabular-nums leading-none tracking-tight"
          style={{ color }}
        >
          {Math.round(score)}
        </span>
        <span className="text-xl font-bold" style={{ color }}>
          %
        </span>
      </div>

      {/* Nivel de criticidad + descripción */}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <span
          className="rounded-md px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            color,
            backgroundColor: `${color}1F`,
            border: `1px solid ${color}40`,
          }}
        >
          {meta.label}
        </span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">{meta.description}</span>
      </div>

      {/* Medidor horizontal proporcionado */}
      <div
        className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-[var(--bg-secondary)]"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Riesgo ${score}%`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}
