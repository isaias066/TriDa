// ¿Qué? Avatar de usuario con iniciales, color personalizado y estado opcional.
// ¿Para qué? Reemplazar los múltiples avatares inline en Sidebar, Settings y Users
//            que calculaban iniciales de forma inconsistente.
// ¿Impacto? Todos los avatares del sistema usan este componente, garantizando
//           consistencia visual y accesibilidad.

import type { ReactNode } from 'react';
import { getInitials, getDisplayName } from '@utils/User';
import { getRoleColor, type SystemRole } from '@constants/Roles';

// ==============================================================================
// TYPES
// ==============================================================================

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

// ==============================================================================
// DIMENSIONES POR TAMAÑO
// ==============================================================================

const SIZE_DIMENSIONS: Record<UserAvatarSize, {
  size:      string;
  fontSize:  string;
  dotSize:   string;
  dotOffset: string;
}> = {
  xs: {
    size:      '24px',
    fontSize:  '10px',
    dotSize:   '6px',
    dotOffset: '-1px',
  },
  sm: {
    size:      '32px',
    fontSize:  '11px',
    dotSize:   '8px',
    dotOffset: '0px',
  },
  md: {
    size:      '40px',
    fontSize:  '13px',
    dotSize:   '10px',
    dotOffset: '0px',
  },
  lg: {
    size:      '56px',
    fontSize:  '18px',
    dotSize:   '12px',
    dotOffset: '2px',
  },
  xl: {
    size:      '80px',
    fontSize:  '28px',
    dotSize:   '16px',
    dotOffset: '4px',
  },
};

// ==============================================================================
// COLORES POR ESTADO
// ==============================================================================

const STATUS_COLORS: Record<UserAvatarStatus, string> = {
  online:  '#34D399',
  offline: '#9CA3AF',
  away:    '#FBBF24',
  busy:    '#EF4444',
};

// ==============================================================================
// HELPERS
// ==============================================================================

function resolveBackgroundColor(color?: string, role?: SystemRole): string {
  if (color) return color;
  if (role) return getRoleColor(role);
  return '#6366F1';
}


function isLightColor(hex: string): boolean {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

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
  const dims = SIZE_DIMENSIONS[size];
  const displayName = getDisplayName({ nombre: name ?? undefined });
  const initials = getInitials(displayName, maxInitials);
  const bgColor = resolveBackgroundColor(color, role);
  const textColor = isLightColor(bgColor) ? '#1F2937' : '#FFFFFF';

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:   'relative',
    display:    'inline-flex',
    width:      dims.size,
    height:     dims.size,
    flexShrink: 0,
  };

  const avatarStyle: React.CSSProperties = {
    width:          dims.size,
    height:         dims.size,
    borderRadius:   '50%',
    background:     src ? 'transparent' : bgColor,
    color:          textColor,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       dims.fontSize,
    fontWeight:     700,
    fontFamily:     'Inter, sans-serif',
    userSelect:     'none',
    overflow:       'hidden',
    cursor:         clickable ? 'pointer' : 'default',
    transition:     clickable ? 'transform 0.15s ease' : 'none',
    boxShadow:      `0 0 0 1px ${bgColor}30`,
  };

  const imageStyle: React.CSSProperties = {
    width:      '100%',
    height:     '100%',
    objectFit:  'cover',
    borderRadius: '50%',
  };

  const statusStyle: React.CSSProperties | undefined = status ? {
    position:     'absolute',
    bottom:       dims.dotOffset,
    right:        dims.dotOffset,
    width:        dims.dotSize,
    height:       dims.dotSize,
    background:   STATUS_COLORS[status],
    borderRadius: '50%',
    border:       '2px solid var(--bg-primary)',
    zIndex:       1,
  } : undefined;

  // ==============================================================================
  // TÍTULO ACCESIBLE
  // ==============================================================================

  const accessibleTitle = title ?? displayName;

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div
      className={`user-avatar user-avatar-${size} ${className}`}
      style={wrapperStyle}
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
      <div style={avatarStyle}>
        {children ? (
          children
        ) : src ? (
          <img
            src={src}
            alt={displayName}
            style={imageStyle}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && <span style={statusStyle} aria-label={`Estado: ${status}`} />}
    </div>
  );
}

// ==============================================================================
// SUB-COMPONENTE — AVATAR GROUP
// ==============================================================================

export interface AvatarGroupProps {
  children: ReactNode;
  max?: number;
  size?: UserAvatarSize;
  spacing?: string;
  total?: number;
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

  const groupStyle: React.CSSProperties = {
    display:    'inline-flex',
    alignItems: 'center',
  };

  const itemStyle = (index: number): React.CSSProperties => ({
    marginLeft:   index === 0 ? 0 : spacing,
    position:     'relative',
    zIndex:       visibleAvatars.length - index,
  });

  return (
    <div className="user-avatar-group" style={groupStyle}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} style={itemStyle(index)}>
          {avatar}
        </div>
      ))}
      {remaining > 0 && (
        <div style={itemStyle(visibleAvatars.length)}>
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