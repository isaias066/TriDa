// ¿Qué? Badge especializado para mostrar bancos con su color institucional.
// ¿Para qué? Reemplazar los múltiples badges de banco inline que estaban en
//            Alerts, Transactions, Sidebar, Settings y Users con formatos distintos.
// ¿Impacto? Todos los indicadores de banco del sistema usan este componente,
//           garantizando consistencia visual (color oficial, dot indicador).

import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import { DEFAULT_BANK_COLOR, ALL_BANKS_ID } from '@app-types';
import type { Bank } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface BankBadgeProps {
  bank?: Bank | null;
  name?: string;
  color?: string;
  size?: BadgeSize;
  dotOnly?: boolean;
  rounded?: boolean;
  showFallback?: boolean;
  className?: string;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function resolveBank(
  bank?: Bank | null,
  name?: string,
  color?: string
): { name: string; color: string; isAll: boolean } {
  if (bank) {
    return {
      name:  bank.name,
      color: bank.color ?? DEFAULT_BANK_COLOR,
      isAll: bank.id === ALL_BANKS_ID,
    };
  }

  return {
    name:  name  ?? 'Sin banco',
    color: color ?? DEFAULT_BANK_COLOR,
    isAll: false,
  };
}

const DOT_SIZE: Record<BadgeSize, string> = {
  sm: '8px',
  md: '10px',
  lg: '14px',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function BankBadge({
  bank,
  name,
  color,
  size = 'md',
  dotOnly = false,
  rounded = false,
  showFallback = true,
  className = '',
}: BankBadgeProps) {
  const resolved = resolveBank(bank, name, color);

  if (!bank && !name && !showFallback) return null;

  // ==============================================================================
  // MODO DOT ONLY (solo círculo del color)
  // ==============================================================================

  if (dotOnly) {
    const dotStyle: React.CSSProperties = {
      display:      'inline-block',
      width:        DOT_SIZE[size],
      height:       DOT_SIZE[size],
      borderRadius: '50%',
      background:   resolved.color,
      flexShrink:   0,
      boxShadow:    `0 0 0 2px ${resolved.color}20`,
    };

    return (
      <span
        className={`bank-badge-dot ${className}`}
        style={dotStyle}
        title={resolved.name}
        aria-label={`Banco: ${resolved.name}`}
      />
    );
  }

  // ==============================================================================
  // MODO BADGE COMPLETO
  // ==============================================================================

  return (
    <Badge
      variant="custom"
      color={resolved.color}
      size={size}
      rounded={rounded}
      className={`bank-badge ${className}`}
      title={resolved.name}
    >
      {resolved.name}
    </Badge>
  );
}