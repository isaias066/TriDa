// ¿Qué? Menú de navegación del sidebar con items, badges y estado activo.
// ¿Para qué? Aislar el menú de navegación del sidebar.jsx original y añadir
//            filtrado por permisos según el rol del usuario logueado.
// ¿Impacto? Solo muestra los items a los que el usuario tiene acceso, cumpliendo
//           con RS-003 (RBAC — control de acceso basado en roles).

import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { NAV_ITEMS, type NavItem } from '@constants/Navigation';
import { useAuth } from '@context/AuthContext';
import { Tooltip } from '@components/ui/Tooltip';
import { Badge } from '@components/ui/Badge';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarNavProps {
  collapsed: boolean;
  alertCount?: number;
  isLive?: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarNav({
  collapsed,
  alertCount = 0,
  isLive = false,
}: SidebarNavProps) {
  const { hasPermission } = useAuth();

  // ==============================================================================
  // FILTRADO POR PERMISOS
  // ==============================================================================

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    padding:       collapsed ? '12px 8px' : '12px',
    overflowY:     'auto',
    fontFamily:    'Inter, sans-serif',
  };

  const listStyle: React.CSSProperties = {
    listStyle: 'none',
    margin:    0,
    padding:   0,
    display:   'flex',
    flexDirection: 'column',
    gap:       '2px',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <nav
      className="sidebar-nav"
      style={wrapperStyle}
      aria-label="Navegación principal"
    >
      <ul style={listStyle}>
        {visibleItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            alertCount={alertCount}
            isLive={isLive}
          />
        ))}
      </ul>
    </nav>
  );
}

// ==============================================================================
// SUB-COMPONENTE — SidebarNavItem
// ==============================================================================

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  alertCount: number;
  isLive: boolean;
}

function SidebarNavItem({
  item,
  collapsed,
  alertCount,
  isLive,
}: SidebarNavItemProps) {
  const Icon: LucideIcon = item.icon;
  const showAlertBadge = item.showAlertBadge && alertCount > 0;
  const showLiveIndicator = item.showLiveIndicator && isLive;

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const linkBaseStyle: React.CSSProperties = {
    position:      'relative',
    display:       'flex',
    alignItems:    'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap:           '10px',
    padding:       collapsed ? '10px 8px' : '10px 12px',
    color:         'var(--text-secondary)',
    background:    'transparent',
    borderRadius:  '8px',
    fontSize:      '13px',
    fontWeight:    500,
    textDecoration: 'none',
    transition:    'background 0.15s ease, color 0.15s ease',
    cursor:        'pointer',
    userSelect:    'none',
    outline:       'none',
  };

  const linkActiveStyle: React.CSSProperties = {
    color:      '#818CF8',
    background: 'rgba(99, 102, 241, 0.12)',
    fontWeight: 700,
  };

  const iconStyle: React.CSSProperties = {
    flexShrink: 0,
    display:    'flex',
    alignItems: 'center',
  };

  const labelStyle: React.CSSProperties = {
    flex:         1,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const badgeWrapperStyle: React.CSSProperties = {
    marginLeft: 'auto',
    flexShrink: 0,
  };

  const collapsedBadgeStyle: React.CSSProperties = {
    position:      'absolute',
    top:           '4px',
    right:         '4px',
    minWidth:      '16px',
    height:        '16px',
    padding:       '0 4px',
    fontSize:      '9px',
    fontWeight:    700,
    color:         '#FFFFFF',
    background:    '#EF4444',
    borderRadius:  '8px',
    display:       'flex',
    alignItems:    'center',
    justifyContent: 'center',
    lineHeight:    1,
    fontVariantNumeric: 'tabular-nums',
  };

  const liveIndicatorStyle: React.CSSProperties = {
    width:        '6px',
    height:       '6px',
    borderRadius: '50%',
    background:   '#34D399',
    boxShadow:    '0 0 0 3px rgba(52, 211, 153, 0.15)',
    animation:    'sidebar-live-pulse 2s ease-in-out infinite',
    flexShrink:   0,
  };

  const collapsedLiveStyle: React.CSSProperties = {
    ...liveIndicatorStyle,
    position: 'absolute',
    top:      '4px',
    right:    '4px',
  };

  // ==============================================================================
  // FORMATO DE BADGE
  // ==============================================================================

  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return String(count);
  };

  // ==============================================================================
  // TOOLTIP LABEL (solo en modo colapsado)
  // ==============================================================================

  const tooltipContent = collapsed ? (
    <div>
      <strong>{item.label}</strong>
      {showAlertBadge && (
        <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
          {alertCount} alertas activas
        </div>
      )}
      {showLiveIndicator && (
        <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8, color: '#34D399' }}>
          ● En vivo
        </div>
      )}
    </div>
  ) : null;

  // ==============================================================================
  // RENDER — Link con NavLink de react-router
  // ==============================================================================

  const linkContent = (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        ...linkBaseStyle,
        ...(isActive ? linkActiveStyle : {}),
      })}
      className={({ isActive }) =>
        `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
      }
      aria-label={collapsed ? item.label : undefined}
    >
      <span style={iconStyle}>
        <Icon size={18} strokeWidth={collapsed ? 2 : 1.8} />
      </span>

      {!collapsed && <span style={labelStyle}>{item.label}</span>}

      {/* Badge de alertas */}
      {showAlertBadge && !collapsed && (
        <span style={badgeWrapperStyle}>
          <Badge variant="danger" size="sm" rounded>
            {formatBadgeCount(alertCount)}
          </Badge>
        </span>
      )}

      {showAlertBadge && collapsed && (
        <span style={collapsedBadgeStyle} aria-label={`${alertCount} alertas`}>
          {alertCount > 9 ? '9+' : alertCount}
        </span>
      )}

      {/* Indicador LIVE */}
      {showLiveIndicator && !collapsed && (
        <span
          style={badgeWrapperStyle}
          aria-label="En vivo"
          title="Sistema en vivo"
        >
          <span style={liveIndicatorStyle} />
        </span>
      )}

      {showLiveIndicator && collapsed && (
        <span style={collapsedLiveStyle} aria-label="En vivo" />
      )}
    </NavLink>
  );

  return (
    <li>
      {collapsed ? (
        <Tooltip content={tooltipContent} position="right">
          {linkContent}
        </Tooltip>
      ) : (
        linkContent
      )}

      <style>{`
        @keyframes sidebar-live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </li>
  );
}