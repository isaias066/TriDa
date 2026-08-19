// ¿Qué? Sección del sidebar con info del usuario logueado y botón de cerrar sesión.
// ¿Para qué? Aislar la sección de perfil del sidebar.jsx original y añadir
//            confirmación de logout con ConfirmDialog en lugar de window.confirm.
// ¿Impacto? Se usa dentro del Sidebar. Cierre de sesión con feedback visual claro
//           y accesibilidad completa.

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { UserAvatar } from '@components/shared/UserAvatar';
import { ConfirmDialog } from '@components/shared/ConfirmDialog';
import { Tooltip } from '@components/ui/Tooltip';
import { getRoleShortLabel } from '@constants/Roles';
import { getShortName, getDisplayName } from '@utils/User';
import { PUBLIC_ROUTES } from '@constants/Navigation';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarUserProfileProps {
  collapsed: boolean;
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SidebarUserProfile({ collapsed }: SidebarUserProfileProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleLogoutConfirm = (): void => {
    logout();
    navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
    setConfirmLogout(false);
  };

  // ==============================================================================
  // DATOS DEL USUARIO
  // ==============================================================================

  const userName = user?.nombre ?? 'Usuario';
  const userEmail = user?.email ?? '';
  const userRole = user?.rol;
  const displayName = getDisplayName({ nombre: userName });
  const shortName = getShortName(displayName);
  const roleLabel = userRole ? getRoleShortLabel(userRole) : 'Usuario';

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    padding:      collapsed ? '12px 8px' : '12px',
    borderTop:    '1px solid var(--border)',
    fontFamily:   'Inter, sans-serif',
  };

  const profileStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    padding:        collapsed ? '4px' : '8px 10px',
    background:     'var(--bg-tertiary)',
    borderRadius:   '10px',
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  const infoStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    flex:          1,
    minWidth:      0,
  };

  const nameStyle: React.CSSProperties = {
    fontSize:     '12px',
    fontWeight:   700,
    color:        'var(--text-primary)',
    lineHeight:   1.2,
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    whiteSpace:   'nowrap',
  };

  const roleStyle: React.CSSProperties = {
    fontSize:      '10px',
    color:         'var(--text-tertiary)',
    fontWeight:    500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    lineHeight:    1.2,
  };

  const logoutButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '28px',
    height:         '28px',
    background:     'transparent',
    border:         'none',
    borderRadius:   '6px',
    color:          'var(--text-tertiary)',
    cursor:         'pointer',
    transition:     'background 0.15s ease, color 0.15s ease',
    flexShrink:     0,
  };

  const logoutButtonCollapsedStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '100%',
    padding:        '8px',
    marginTop:      '6px',
    background:     'transparent',
    border:         '1px solid var(--border)',
    borderRadius:   '8px',
    color:          'var(--text-tertiary)',
    cursor:         'pointer',
    transition:     'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
  };

  // ==============================================================================
  // TOOLTIP PARA MODO COLAPSADO
  // ==============================================================================

  const collapsedTooltipContent = (
    <div>
      <div style={{ fontWeight: 700, fontSize: '11px' }}>{displayName}</div>
      {userEmail && (
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
          {userEmail}
        </div>
      )}
      <div style={{ fontSize: '10px', marginTop: '4px', color: '#818CF8', fontWeight: 600 }}>
        {roleLabel}
      </div>
    </div>
  );

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <>
      <div
        className={`sidebar-user-profile ${collapsed ? 'sidebar-user-profile-collapsed' : ''}`}
        style={wrapperStyle}
      >
        {/* Perfil (avatar + info) */}
        {collapsed ? (
          <Tooltip content={collapsedTooltipContent} position="right">
            <div style={profileStyle}>
              <UserAvatar
                name={displayName}
                role={userRole}
                size="sm"
              />
            </div>
          </Tooltip>
        ) : (
          <div style={profileStyle}>
            <UserAvatar
              name={displayName}
              role={userRole}
              size="sm"
              title={userEmail}
            />

            <div style={infoStyle}>
              <span style={nameStyle} title={displayName}>
                {shortName}
              </span>
              <span style={roleStyle}>{roleLabel}</span>
            </div>

            <Tooltip content="Cerrar sesión" position="top">
              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                style={logoutButtonStyle}
                aria-label="Cerrar sesión"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)';
                  (e.currentTarget as HTMLElement).style.color = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                }}
              >
                <LogOut size={14} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Botón de logout separado en modo colapsado */}
        {collapsed && (
          <Tooltip content="Cerrar sesión" position="right">
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              style={logoutButtonCollapsedStyle}
              aria-label="Cerrar sesión"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239, 68, 68, 0.1)';
                (e.currentTarget as HTMLElement).style.color = '#EF4444';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              }}
            >
              <LogOut size={14} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Diálogo de confirmación de logout */}
      <ConfirmDialog
        open={confirmLogout}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmLogout(false)}
        title="Cerrar sesión"
        message={
          <>
            ¿Deseas cerrar la sesión de <strong>{displayName}</strong>?
          </>
        }
        variant="question"
        confirmLabel="Cerrar sesión"
      />
    </>
  );
}