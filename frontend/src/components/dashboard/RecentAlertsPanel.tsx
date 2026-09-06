// ¿Qué? Panel lateral que muestra las alertas más recientes del sistema.
// ¿Para qué? Mostrar alertas recientes resolviendo el color real según criticidad.
// ¿Impacto? Se usa en DashboardPage; garantiza rojo en CRÍTICO, naranja en ALTO, etc.

import { AlertTriangle, ChevronRight, Radio } from 'lucide-react';
import type { RecentAlert } from '@app-types';
import { RISK_COLORS, RISK_LEVELS, getRiskLevel, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatTime } from '@utils/Formatters';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';

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
// HELPER DE NORMALIZACIÓN (PRIORIZA TEXTO DE CRITICIDAD SOBRE SCORE)
// ==============================================================================

function normalizeRiskLevel(rawLevel?: string, score?: number): RiskLevel {
  const str = String(rawLevel || '')
    .toUpperCase()
    .trim();

  // 1. Prioridad total al texto de criticidad que viene de la BD
  if (str.includes('CRIT') || str === 'CRITICAL') return 'critical';
  if (str.includes('ALT') || str === 'HIGH') return 'high';
  if (str.includes('MED') || str === 'MEDIUM') return 'medium';
  if (str.includes('BAJ') || str === 'LOW') return 'low';

  // 2. Solo si no hay texto válido, evalúa el score si es > 0
  if (typeof score === 'number' && !isNaN(score) && score > 0) {
    return getRiskLevel(score);
  }

  return 'low';
}

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export function RecentAlertsPanel({
  alerts,
  loading = false,
  maxItems = 15, // Actualizado a 15 por defecto
  onViewAll,
  onAlertClick,
  title = 'Alertas recientes',
  isLive = false,
  className = '',
}: RecentAlertsPanelProps) {
  const visibleAlerts = alerts.slice(0, maxItems);

  return (
    <div
      className={`flex min-h-[300px] max-h-[600px] w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] font-sans ${className}`}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] p-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center text-[var(--text-secondary)]">
            <AlertTriangle size={15} strokeWidth={2} />
          </span>
          <span className="text-[13px] font-bold text-[var(--text-primary)]">{title}</span>
          <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-indigo-400">
            {alerts.length}
          </span>
        </div>

        {isLive && (
          <div
            className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400"
            aria-label="Datos en tiempo real"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <Radio size={10} />
          </div>
        )}
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {loading ? (
          <div className="p-10">
            <Spinner label="Cargando alertas..." centered />
          </div>
        ) : visibleAlerts.length === 0 ? (
          <EmptyState preset="no-alerts" size="sm" />
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

      {/* Footer */}
      {onViewAll && !loading && visibleAlerts.length > 0 && (
        <div className="shrink-0 border-t border-[var(--border)] p-3">
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

function RecentAlertItem({ alert, onClick }: RecentAlertItemProps) {
  // Conversión segura pasando por 'unknown' primero para cumplir reglas estrictas de TS
  const rawAlert = alert as unknown as Record<string, unknown>;
  const rawScore =
    typeof rawAlert.score === 'number'
      ? rawAlert.score
      : typeof rawAlert.riskScore === 'number'
        ? rawAlert.riskScore
        : undefined;

  // Normalizar nivel considerando primero la cadena 'CRÍTICO', 'ALTO', etc.
  const level = normalizeRiskLevel(alert.level, rawScore);
  const color = RISK_COLORS[level];
  const levelLabel = RISK_LEVELS[level]?.label ?? level;
  const isClickable = Boolean(onClick);

  const alertId = alert.id ? `#${String(alert.id).padStart(4, '0')}` : '';
  const alertTime = formatTime(alert.timestamp);

  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-2.5 transition-colors duration-150 ${
        isClickable ? 'cursor-pointer hover:bg-[var(--bg-tertiary)]' : ''
      }`}
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
    >
      {/* Dot de color exacto según el nivel */}
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}80`,
        }}
        aria-hidden="true"
      />

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Fila 1: ID + hora */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-bold tabular-nums text-[var(--text-secondary)]">
            {alertId}
          </span>
          <span className="whitespace-nowrap text-[10px] tabular-nums text-[var(--text-tertiary)]">
            {alertTime}
          </span>
        </div>

        {/* Fila 2: Descripción */}
        <span className="truncate text-xs text-[var(--text-secondary)]" title={alert.description}>
          {alert.description}
        </span>

        {/* Fila 3: Monto + origen + nivel */}
        <div className="flex flex-wrap items-center gap-2">
          {alert.amount !== null && alert.amount !== undefined && (
            <span className="text-[11px] font-bold tabular-nums text-[var(--text-primary)]">
              {formatCurrency(alert.amount)}
            </span>
          )}
          {alert.origin && (
            <>
              <span className="text-[10px] text-[var(--text-tertiary)]">·</span>
              <span className="text-[10px] text-[var(--text-tertiary)]">{alert.origin}</span>
            </>
          )}

          {/* Label de criticidad con su color dinámico correspondiente */}
          <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color }}>
            {levelLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
