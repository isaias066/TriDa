// ¿Qué? Contenido del popup de un marcador del mapa.
// ¿Para qué? Info de la TX con tema oscuro forzado (no depende de .dark del HTML).
// ¿Impacto? Se renderiza dentro del Popup de Leaflet en MapPointMarker.

import { RISK_COLORS, type RiskLevel } from '@constants/Risk';
import { formatCurrency } from '@utils/Formatters';
import type { TransactionMapPoint } from '@app-types';

export interface MapPointPopupProps {
  point: TransactionMapPoint;
  className?: string;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'blocked':
      return 'Bloqueada';
    case 'flagged':
      return 'Alertada';
    case 'pending':
      return 'Pendiente';
    default:
      return 'Aprobada';
  }
}

export function MapPointPopup({ point, className = '' }: MapPointPopupProps) {
  const color = RISK_COLORS[point.alertLevel as RiskLevel] ?? '#6366F1';
  const statusLabel = getStatusLabel(point.status);

  return (
    <div
      className={`w-[248px] select-none font-sans leading-relaxed ${className}`}
      style={{
        // Fondo oscuro forzado por si el wrapper de Leaflet falla
        background: '#0f172a',
        color: '#e2e8f0',
        borderRadius: 10,
        padding: 4,
      }}
    >
      {/* Header */}
      <div
        className="mb-2 flex items-center justify-between pb-2"
        style={{ borderBottom: '1px solid rgba(51,65,85,0.7)' }}
      >
        <span className="font-mono text-xs font-bold tracking-wide" style={{ color: '#cbd5e1' }}>
          TXID-{String(point.id).slice(0, 8).toUpperCase()}
        </span>

        <div
          className="flex items-center gap-1.5 rounded-md px-2 py-0.5"
          style={{
            background: 'rgba(2,6,23,0.6)',
            border: '1px solid rgba(51,65,85,0.8)',
          }}
        >
          <span className="text-[10px] font-bold uppercase" style={{ color: '#64748b' }}>
            Riesgo
          </span>
          <span className="text-xs font-black" style={{ color }}>
            {point.riskScore}%
          </span>
        </div>
      </div>

      {/* Filas */}
      <div className="space-y-1.5">
        <Row label="Cliente" value={point.user} />
        <Row label="Banco Emisor" value={point.bank.name} valueColor={point.bank.color} bold />
        <Row label="Operación" value={point.type} pill />
        <Row
          label="Valor transado"
          value={formatCurrency(point.amount, point.currency)}
          valueColor="#34d399"
          mono
        />
        <Row label="Ubicación" value={point.location.city} />
        <Row label="Canal de Acceso" value={String(point.channel).toUpperCase()} pill />

        <div
          className="mt-1 flex items-center justify-between pt-1.5 text-[11px]"
          style={{ borderTop: '1px solid rgba(51,65,85,0.45)' }}
        >
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>Estado</span>
          <span style={{ color, fontWeight: 700 }}>{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueColor = '#f1f5f9',
  bold = false,
  mono = false,
  pill = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
  mono?: boolean;
  pill?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[11px]">
      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{label}</span>
      <span
        className={`max-w-[150px] truncate text-right ${mono ? 'font-mono' : ''}`}
        style={{
          color: valueColor,
          fontWeight: bold ? 700 : 600,
          ...(pill
            ? {
                background: 'rgba(30,41,59,0.9)',
                borderRadius: 4,
                padding: '1px 6px',
                fontSize: 10,
              }
            : {}),
        }}
      >
        {value}
      </span>
    </div>
  );
}
