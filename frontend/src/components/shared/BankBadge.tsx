// ¿Qué? Badge de banco con color institucional y logo opcional.
// ¿Para qué? TX, clientes, alertas y filtros muestran el banco de forma consistente.
// ¿Impacto? Si hay asset en BankLogos se pinta img; si no, fallback color + nombre.

import { useState } from 'react';
import { Badge } from '@components/ui/Badge';
import type { BadgeSize } from '@components/ui/Badge';
import { DEFAULT_BANK_COLOR, ALL_BANKS_ID } from '@app-types/index';
import type { Bank } from '@app-types/index';
import { getBankLogoUrl } from '@/constants/BankLogos';
import { cn } from '@utils/cn';

export interface BankBadgeProps {
  bank?: Bank | null;
  name?: string;
  color?: string;
  /** Código/id del banco para buscar logo si no viene en bank. */
  bankCode?: string;
  size?: BadgeSize;
  dotOnly?: boolean;
  rounded?: boolean;
  showFallback?: boolean;
  /** Mostrar logo cuando exista (default true). */
  showLogo?: boolean;
  className?: string;
}

function resolveBank(
  bank?: Bank | null,
  name?: string,
  color?: string,
  bankCode?: string,
): { name: string; color: string; code: string | null; isAll: boolean } {
  if (bank) {
    return {
      name: bank.name,
      color: bank.color ?? DEFAULT_BANK_COLOR,
      code: bank.id != null ? String(bank.id) : (bankCode ?? null),
      isAll: bank.id === ALL_BANKS_ID,
    };
  }

  return {
    name: name ?? 'Sin banco',
    color: color ?? DEFAULT_BANK_COLOR,
    code: bankCode ?? null,
    isAll: false,
  };
}

const DOT_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3.5 w-3.5',
};

const LOGO_SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function BankBadge({
  bank,
  name,
  color,
  bankCode,
  size = 'md',
  dotOnly = false,
  rounded = false,
  showFallback = true,
  showLogo = true,
  className = '',
}: BankBadgeProps) {
  const resolved = resolveBank(bank, name, color, bankCode);
  const logoUrl = showLogo && !resolved.isAll ? getBankLogoUrl(resolved.code) : null;
  const [logoFailed, setLogoFailed] = useState(false);
  const canShowLogo = Boolean(logoUrl) && !logoFailed;

  if (!bank && !name && !showFallback) return null;

  if (dotOnly) {
    // Dot: logo minúsculo si hay; si no, color
    if (canShowLogo && logoUrl) {
      return (
        <span
          className={cn(
            'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-tertiary)]',
            DOT_SIZE_CLASSES[size],
            className,
          )}
          title={resolved.name}
          aria-label={`Banco: ${resolved.name}`}
        >
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full object-contain p-px"
            onError={() => setLogoFailed(true)}
          />
        </span>
      );
    }

    return (
      <span
        className={cn('inline-block shrink-0 rounded-full', DOT_SIZE_CLASSES[size], className)}
        style={{
          background: resolved.color,
          boxShadow: `0 0 0 2px ${resolved.color}20`,
        }}
        title={resolved.name}
        aria-label={`Banco: ${resolved.name}`}
      />
    );
  }

  return (
    <Badge
      variant="custom"
      color={resolved.color}
      size={size}
      rounded={rounded}
      className={cn('inline-flex items-center gap-1.5', className)}
      title={resolved.name}
    >
      {canShowLogo && logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          className={cn('shrink-0 object-contain', LOGO_SIZE_CLASSES[size])}
          onError={() => setLogoFailed(true)}
        />
      ) : (
        <span
          className={cn('inline-block shrink-0 rounded-full', DOT_SIZE_CLASSES[size])}
          style={{ background: resolved.color }}
          aria-hidden
        />
      )}
      <span className="truncate">{resolved.name}</span>
    </Badge>
  );
}
