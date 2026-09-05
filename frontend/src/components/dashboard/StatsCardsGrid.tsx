// ¿Qué? Grid responsivo para organizar las métricas del Dashboard.
// ¿Para qué? Muestra métricas clave con variantes alineadas a los niveles de riesgo de Risk.ts.
// ¿Impacto? Utiliza variantes 'critical', 'high', 'low', 'info' alineadas a la paleta oficial.

import { DollarSign, AlertTriangle, Ban, ShieldCheck, Zap } from 'lucide-react';
import { StatsCard } from './StatsCards';
import type { DashboardStats } from '@app-types';
import { formatCurrency, formatPercent, formatNumber } from '@utils/Formatters';

export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLive?: boolean;
  transactionsPerSecond?: number;
  onFraudClick?: () => void;
  onBlockedClick?: () => void;
  className?: string;
}

export function StatsCardsGrid({
  stats,
  isLive = false,
  transactionsPerSecond = 0,
  onFraudClick,
  onBlockedClick,
  className = '',
}: StatsCardsGridProps) {
  const fraudDisplay =
    stats.totalFrauds > 0
      ? `${formatNumber(stats.totalFrauds)} (${formatPercent(stats.fraudRate, 1)})`
      : '0';

  const tpsDisplay = isLive ? formatNumber(transactionsPerSecond) : '0';

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

      {/* 2. Fraudes detectados (Variante de riesgo Crítico) */}
      <StatsCard
        icon={AlertTriangle}
        value={fraudDisplay}
        label="Fraudes detectados"
        variant="critical"
        animated={stats.totalFrauds > 0}
        onClick={onFraudClick}
      />

      {/* 3. Transacciones bloqueadas (Variante de riesgo Alto) */}
      <StatsCard
        icon={Ban}
        value={formatNumber(stats.totalBlocked)}
        label="Bloqueadas"
        variant="high"
        onClick={onBlockedClick}
      />

      {/* 4. Estado del Motor Antifraude (Verídico - Nivel Bajo / Seguro) */}
      <StatsCard
        icon={ShieldCheck}
        value="Activo"
        label="Motor Antifraude"
        variant="low"
        subtitle="7 factores ponderados"
      />

      {/* 5. Transacciones por segundo */}
      <StatsCard
        icon={Zap}
        value={tpsDisplay}
        label="TXN/seg"
        variant={isLive ? 'medium' : 'primary'}
        animated={isLive}
        subtitle={isLive ? 'Simulado en vivo' : 'Sistema pausado'}
      />
    </div>
  );
}
