// ¿Qué? Avatar con foto opcional, iniciales y estado.
// ¿Para qué? Sidebar, Settings, Users y listados de clientes.
// ¿Impacto? src roto → fallback a iniciales; color por prop, rol o default.

import { useState, type ReactNode } from 'react';
import { getInitials, getDisplayName } from '@utils/User';
import { getRoleColor } from '@constants/Roles';
import type { SystemRole } from '@constants/Roles';
import { cn } from '@utils/cn';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type UserAvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserAvatarProps {
  name?: string | null;
  src?: string;
  role?: SystemRole;
  color?: string;
  size?: UserAvatarSize;
  status?: UserAvatarStatus;
  clickable?: boolean;
  onClick?: () => void;
  title?: string;
  maxInitials?: number;
  children?: ReactNode;
  className?: string;
}

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: UserAvatarSize;
  spacing?: string;
  total?: number;
}

const SIZE_CLASSES: Record<
  UserAvatarSize,
  { wrapper: string; text: string; dot: string; dotPos: string }
> = {
  xs: {
    wrapper: 'h-6 w-6',
    text: 'text-[10px]',
    dot: 'h-1.5 w-1.5',
    dotPos: '-bottom-px -right-px',
  },
  sm: {
    wrapper: 'h-8 w-8',
    text: 'text-[11px]',
    dot: 'h-2 w-2',
    dotPos: 'bottom-0 right-0',
  },
  md: {
    wrapper: 'h-10 w-10',
    text: 'text-[13px]',
    dot: 'h-2.5 w-2.5',
    dotPos: 'bottom-0 right-0',
  },
  lg: {
    wrapper: 'h-14 w-14',
    text: 'text-lg',
    dot: 'h-3 w-3',
    dotPos: 'bottom-0.5 right-0.5',
  },
  xl: {
    wrapper: 'h-20 w-20',
    text: 'text-[28px]',
    dot: 'h-4 w-4',
    dotPos: 'bottom-1 right-1',
  },
};

const STATUS_CLASSES: Record<UserAvatarStatus, string> = {
  online: 'bg-[var(--color-success)]',
  offline: 'bg-[var(--text-tertiary)]',
  away: 'bg-[var(--color-warning)]',
  busy: 'bg-[var(--color-danger)]',
};

function resolveBackgroundColor(color?: string, role?: SystemRole): string {
  if (color) return color;
  if (role) return getRoleColor(role);
  return '#6366F1';
}

function isLightColor(hex: string): boolean {
  const cleaned = hex.replace('#', '');
  if (cleaned.length < 6) return false;
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export function UserAvatar({
  name,
  src,
  role,
  color,
  size = 'md',
  status,
  clickable = false,
  onClick,
  title,
  maxInitials = 2,
  children,
  className = '',
}: UserAvatarProps) {
  const config = SIZE_CLASSES[size];
  const displayName = getDisplayName({ nombre: name ?? undefined });
  const initials = getInitials(displayName, maxInitials);
  const bgColor = resolveBackgroundColor(color, role);
  const textColor = isLightColor(bgColor) ? '#1F2937' : '#FFFFFF';
  const accessibleTitle = title ?? displayName;

  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src) && !imgFailed;

  return (
    <div
      className={cn('relative inline-flex shrink-0', config.wrapper, className)}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      title={accessibleTitle}
      aria-label={accessibleTitle}
    >
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full font-sans font-bold select-none',
          config.wrapper,
          config.text,
          clickable && 'cursor-pointer transition-transform duration-150 hover:scale-105',
          !clickable && 'cursor-default',
        )}
        style={{
          background: showImage ? 'var(--bg-tertiary)' : bgColor,
          color: textColor,
          boxShadow: `0 0 0 1px ${bgColor}30`,
        }}
      >
        {children ? (
          children
        ) : showImage ? (
          <img
            src={src}
            alt={displayName}
            className="h-full w-full rounded-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute z-[1] rounded-full border-2 border-[var(--bg-primary)]',
            config.dot,
            config.dotPos,
            STATUS_CLASSES[status],
          )}
          aria-label={`Estado: ${status}`}
        />
      )}
    </div>
  );
}

export function AvatarGroup({
  children,
  max = 5,
  size = 'md',
  spacing = '-8px',
  total,
}: AvatarGroupProps) {
  const avatars = Array.isArray(children) ? children : [children];
  const visibleAvatars = avatars.slice(0, max);
  const remaining = (total ?? avatars.length) - max;

  return (
    <div className="inline-flex items-center">
      {visibleAvatars.map((avatar, index) => (
        <div
          key={index}
          className="relative"
          style={{
            marginLeft: index === 0 ? 0 : spacing,
            zIndex: visibleAvatars.length - index,
          }}
        >
          {avatar}
        </div>
      ))}
      {remaining > 0 && (
        <div className="relative" style={{ marginLeft: spacing, zIndex: 0 }}>
          <UserAvatar
            size={size}
            color="#4B5563"
            name={`+${remaining}`}
            title={`${remaining} usuario(s) más`}
          >
            <span>+{remaining}</span>
          </UserAvatar>
        </div>
      )}
    </div>
  );
}
