// ¿Qué? Grid responsivo para organizar las métricas del Dashboard.
// ¿Para qué? Muestra métricas clave con variantes alineadas a los niveles de riesgo de Risk.ts.
// ¿Impacto? Utiliza variantes 'critical', 'high', 'low', 'info' alineadas a la paleta oficial.

import { DollarSign, AlertTriangle, Ban, ShieldCheck, Zap, Clock } from 'lucide-react';
import { StatsCard } from './StatsCards';
import type { DashboardStats } from '@app-types';
import { formatCurrency, formatPercent, formatNumber } from '@utils/Formatters';

export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLive?: boolean;
  transactionsPerSecond?: number;
  latencyMs?: number;
  liveStatusLabel?: string;
  onFraudClick?: () => void;
  onBlockedClick?: () => void;
  className?: string;
}

export function StatsCardsGrid({
  stats,
  isLive = false,
  transactionsPerSecond = 0,
  latencyMs = 0,
  liveStatusLabel = 'Sistema pausado',
  onFraudClick,
  onBlockedClick,
  className = '',
}: StatsCardsGridProps) {
  const fraudDisplay =
    stats.totalFrauds > 0
      ? `${formatNumber(stats.totalFrauds)} (${formatPercent(stats.fraudRate, 1)})`
      : '0';

  const tpsDisplay = isLive ? transactionsPerSecond.toFixed(1) : '0.0';
  const latencyDisplay = isLive ? `${Math.round(latencyMs)} ms` : '— ms';

  return (
    <div
      className={`grid w-full grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 ${className}`}
      role="region"
      aria-label="Métricas principales del sistema"
    >
      {/* 1. Monto total procesado */}
      <StatsCard
        icon={DollarSign}
        value={formatCurrency(stats.totalAmount)}
        label="Monto total"
        variant="info"
      />

      {/* 2. Fraudes detectados */}
      <StatsCard
        icon={AlertTriangle}
        value={fraudDisplay}
        label="Fraudes detectados"
        variant="critical"
        animated={stats.totalFrauds > 0}
        onClick={onFraudClick}
      />

      {/* 3. Transacciones bloqueadas */}
      <StatsCard
        icon={Ban}
        value={formatNumber(stats.totalBlocked)}
        label="Bloqueadas"
        variant="high"
        onClick={onBlockedClick}
      />

      {/* 4. Estado del Motor Antifraude */}
      <StatsCard
        icon={ShieldCheck}
        value="Activo"
        label="Motor Antifraude"
        variant="low"
        subtitle="7 factores ponderados"
      />

      {/* 5. TPS real */}
      <StatsCard
        icon={Zap}
        value={tpsDisplay}
        label="TXN/seg"
        variant={isLive ? 'medium' : 'primary'}
        animated={isLive}
        subtitle={liveStatusLabel}
      />

      {/* 6. Latencia real del motor */}
      <StatsCard
        icon={Clock}
        value={latencyDisplay}
        label="Latencia motor"
        variant={isLive ? 'info' : 'primary'}
        animated={isLive}
        subtitle={isLive ? 'Tiempo de procesamiento' : 'Sin actividad'}
      />
    </div>
  );
}
