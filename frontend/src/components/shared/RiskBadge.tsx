// ¿Qué? Badge especializado para mostrar el nivel de riesgo con score y color.
// ¿Para qué? Reemplazar los múltiples badges de riesgo inline que estaban en
//            Alerts, Transactions, Map y Users con colores y formatos distintos.
// ¿Impacto? Todos los indicadores de riesgo del sistema usan este componente,
//           garantizando consistencia en colores, labels y formato del score.

import type { ReactNode } from 'react';
import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import {
  RISK_COLORS,
  RISK_LEVELS,
  type RiskLevel,
} from '@constants/Risk';
import {
  getRiskLevel,
  getRiskLabelFromScore,
} from '@utils/Risk';
import { formatRiskScore } from '@utils/Formatters';

// ==============================================================================
// TYPES
// ==============================================================================

export type RiskBadgeMode =
  | 'level'      
  | 'score'       
  | 'both'        
  | 'score-only'; 

export interface RiskBadgeProps {
  score?: number;
  level?: RiskLevel;
  mode?: RiskBadgeMode;
  size?: BadgeSize;
  icon?: ReactNode;
  pulse?: boolean;
  rounded?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

/**
 * Determina el nivel de riesgo a partir de los props (score o level).
 */
function resolveLevel(score?: number, level?: RiskLevel): RiskLevel {
  if (level) return level;
  if (typeof score === 'number') return getRiskLevel(score);
  return 'low';
}

function buildContent(
  mode: RiskBadgeMode,
  score: number | undefined,
  level: RiskLevel
): string {
  const hasScore = typeof score === 'number';
  const label = RISK_LEVELS[level].label;
  const scoreText = hasScore ? formatRiskScore(score) : '';

  switch (mode) {
    case 'level':
      return label;
    case 'score':
      return hasScore ? scoreText : label;
    case 'both':
      return hasScore ? `${scoreText} · ${label}` : label;
    case 'score-only':
      return hasScore ? formatRiskScore(score).replace(' %', '') : label;
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function RiskBadge({
  score,
  level,
  mode = 'score',
  size = 'md',
  icon,
  pulse = false,
  rounded = false,
  className = '',
}: RiskBadgeProps) {
  const resolvedLevel = resolveLevel(score, level);
  const color = RISK_COLORS[resolvedLevel];
  const content = buildContent(mode, score, resolvedLevel);

  return (
    <Badge
      variant="custom"
      color={color}
      size={size}
      icon={icon}
      pulse={pulse}
      rounded={rounded}
      className={`risk-badge risk-badge-${resolvedLevel} ${className}`}
      title={typeof score === 'number' ? getRiskLabelFromScore(score) : RISK_LEVELS[resolvedLevel].label}
    >
      {content}
    </Badge>
  );
}