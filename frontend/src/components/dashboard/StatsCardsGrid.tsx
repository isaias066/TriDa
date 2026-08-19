// ¿Qué? Grid responsivo que organiza las StatsCards del Dashboard.
// ¿Para qué? Encapsular la composición de las 6 cards de métricas principales
//            con los datos del hook useDashboardData.
// ¿Impacto? Se usa exclusivamente en DashboardPage. Recibe los datos ya
//           procesados y los renderiza con el layout correcto.

import {
  Activity,
  DollarSign,
  AlertTriangle,
  Ban,
  Shield,
  Zap,
} from 'lucide-react';
import { StatsCard } from './StatsCards';
import type { DashboardStats } from '@app-types';
import { formatCurrency, formatPercent, formatNumber } from '@utils/Formatters';

// ==============================================================================
// TYPES
// ==============================================================================

export interface StatsCardsGridProps {
  stats: DashboardStats;
  isLive?: boolean;
  transactionsPerSecond?: number;
  onFraudClick?: () => void;
  onBlockedClick?: () => void;
  className?: string;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function StatsCardsGrid({
  stats,
  isLive = false,
  transactionsPerSecond = 0,
  onFraudClick,
  onBlockedClick,
  className = '',
}: StatsCardsGridProps) {

  // ==============================================================================
  // VALORES DERIVADOS
  // ==============================================================================

  const fraudDisplay = stats.totalFrauds > 0
    ? `${formatNumber(stats.totalFrauds)} (${formatPercent(stats.fraudRate, 1)})`
    : '0';

  const tpsDisplay = isLive
    ? formatNumber(transactionsPerSecond)
    : '0';

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const gridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap:                 '12px',
    width:               '100%',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`stats-cards-grid ${className}`}
      style={gridStyle}
      role="region"
      aria-label="Métricas principales del sistema"
    >
      {/* 1. Total de registros activos */}
      <StatsCard
        icon={Activity}
        value={formatNumber(stats.totalTransactions)}
        label="Registros activos"
        variant="primary"
      />

      {/* 2. Monto total procesado */}
      <StatsCard
        icon={DollarSign}
        value={formatCurrency(stats.totalAmount)}
        label="Monto total"
        variant="info"
      />

      {/* 3. Fraudes detectados */}
      <StatsCard
        icon={AlertTriangle}
        value={fraudDisplay}
        label="Fraudes detectados"
        variant="danger"
        animated={stats.totalFrauds > 0}
        onClick={onFraudClick}
      />

      {/* 4. Transacciones bloqueadas */}
      <StatsCard
        icon={Ban}
        value={formatNumber(stats.totalBlocked)}
        label="Bloqueadas"
        variant="warning"
        onClick={onBlockedClick}
      />

      {/* 5. Precisión del modelo IA */}
      <StatsCard
        icon={Shield}
        value="98.4%"
        label="Precisión IA"
        variant="success"
        subtitle="Modelo v2.1"
      />

      {/* 6. Transacciones por segundo */}
      <StatsCard
        icon={Zap}
        value={tpsDisplay}
        label="TXN/seg"
        variant={isLive ? 'warning' : 'primary'}
        animated={isLive}
        subtitle={isLive ? 'En tiempo real' : 'Sistema pausado'}
      />
    </div>
  );
}