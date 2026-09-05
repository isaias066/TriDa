// ¿Qué? Contenido del panel de detalle de una alerta de fraude.
// ¿Para qué? Vista reutilizable en AlertsPage y Dashboard (click en alerta reciente).
// ¿Impacto? Score centrado sin círculo; colores y fraude desde Risk.ts.

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
import type { Alert } from '@app-types';

export interface AlertDetailProps {
  alert: Alert;
  /** Muestra el bloque de score centrado (antes era ScoreRing). */
  showScoreRing?: boolean;
  /** @deprecated Sin efecto; se conserva por compatibilidad de API. */
  scoreRingSize?: 'sm' | 'md' | 'lg' | 'xl';
  showFactors?: boolean;
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
    return { label: 'No — Descartado', color: RISK_COLORS.low };
  }
  return { label: 'Pendiente', color: 'var(--text-secondary)' };
}

function resolveLevel(alert: Alert, explicit?: RiskLevel): RiskLevel {
  if (explicit) return explicit;

  const raw = String(alert.alertLevel ?? '').toLowerCase();
  if (raw === 'critical' || raw === 'high' || raw === 'medium' || raw === 'low') {
    return raw;
  }

  // Fallback por score si el level viene en ES u otro formato
  const fromEs = String(alert.alertLevel ?? '').toUpperCase();
  if (fromEs.includes('CRIT')) return 'critical';
  if (fromEs.includes('ALT') || fromEs === 'HIGH') return 'high';
  if (fromEs.includes('MED')) return 'medium';
  if (fromEs.includes('BAJ') || fromEs === 'LOW') return 'low';

  return getRiskLevel(Number(alert.riskScore) || 0);
}

export function AlertDetail({
  alert,
  showScoreRing = true,
  showFactors = true,
  riskLevel,
  className = '',
}: AlertDetailProps) {
  const score = Math.min(100, Math.max(0, Number(alert.riskScore) || 0));
  const level = resolveLevel(alert, riskLevel);
  const fraud = resolveFraudPresentation(alert.isFraud);

  return (
    <div className={cn('alert-detail font-sans', className)}>
      {showScoreRing && <RiskScoreHero score={score} level={level} />}

      <DetailSection title="Información de la alerta">
        <DetailGrid columns={2}>
          <DetailField label="Usuario" value={alert.user ?? '—'} />
          <DetailField label="Cuenta" value={alert.account ?? '—'} />
          <DetailField label="Banco" value={<BankBadge bank={alert.bank} />} />
          <DetailField label="Tipo" value={alert.type ?? '—'} />
          <DetailField
            label="Monto"
            value={
              <span className="text-base font-extrabold tabular-nums text-[var(--text-primary)]">
                {formatCurrency(alert.amount)}
              </span>
            }
          />
          <DetailField label="Riesgo" value={<RiskBadge score={score} mode="both" />} />
          <DetailField label="Ciudad" value={alert.location?.city ?? '—'} />
          <DetailField
            label="Canal"
            value={
              <span className="uppercase tracking-wide text-[var(--text-primary)]">
                {alert.channel ?? '—'}
              </span>
            }
          />
          <DetailField label="Dispositivo" value={alert.device?.type ?? '—'} />
          <DetailField
            label="Estado"
            value={<StatusBadge type="transaction" status={alert.status} />}
          />
          <DetailField
            label="¿Fraude?"
            value={
              <span className="font-bold" style={{ color: fraud.color }}>
                {fraud.label}
              </span>
            }
          />
          <DetailField label="Fecha" value={formatDateTime(alert.timestamp)} />
        </DetailGrid>
      </DetailSection>

      {showFactors && alert.factors && (
        <>
          <DetailDivider />
          <DetailSection title="Factores sospechosos">
            <p className="m-0 mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              {alert.factors}
            </p>
          </DetailSection>
        </>
      )}
    </div>
  );
}

// ==============================================================================
// RiskScoreHero — score centrado (misma UX que TransactionDetail)
// ==============================================================================

function RiskScoreHero({ score, level }: { score: number; level: RiskLevel }) {
  const color = RISK_COLORS[level];
  const meta = RISK_LEVELS[level];

  return (
    <div
      className="mb-5 flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-5 text-center"
      data-risk-level={level}
    >
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-tertiary)]">
        Score de riesgo
      </span>

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
