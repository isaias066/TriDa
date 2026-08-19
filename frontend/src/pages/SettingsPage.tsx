import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { SETTINGS_TABS, type SettingsTabKey } from '@constants/Navigation';
import { type PermissionKey } from '@constants/Permissions';

import { ProfileTab } from '@components/settings/ProfileTab';
import { UsersTab } from '@components/settings/UsersTab';
import { ModelTab } from '@components/settings/ModelTab';
import { NotificationsTab } from '@components/settings/NotificationsTab';
import { RolesTab } from '@components/settings/RolesTab';
import { SystemTab } from '@components/settings/SystemTab';

// ==============================================================================
// MAPEO DE TABS A COMPONENTES
// ==============================================================================

const TAB_COMPONENTS: Record<SettingsTabKey, React.ComponentType<any>> = {
  profile:       ProfileTab,
  users:         UsersTab,
  model:         ModelTab,
  notifications: NotificationsTab,
  roles:         RolesTab,
  system:        SystemTab,
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function SettingsPage() {
  const { hasPermission } = useAuth();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Configuración — TriDa';
  }, []);

  // ==============================================================================
  // ESTADO — Tab activo
  // ==============================================================================

  const [activeTab, setActiveTab] = useState<SettingsTabKey>('profile');

  // ==============================================================================
  // TABS VISIBLES — Filtrar según permisos del usuario
  // ==============================================================================

  const visibleTabs = SETTINGS_TABS.filter(tab => {
    if (!tab.permission) return true;
    return hasPermission(tab.permission as PermissionKey);
  });

  // ==============================================================================
  // COMPONENTE ACTIVO
  // ==============================================================================

  const ActiveComponent = TAB_COMPONENTS[activeTab] ?? ProfileTab;

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const pageStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
    padding:       '24px',
    minHeight:     '100vh',
    fontFamily:    'Inter, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:      '24px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    margin:        0,
    letterSpacing: '-0.02em',
    display:       'flex',
    alignItems:    'center',
    gap:           '10px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color:    'var(--text-secondary)',
    margin:   0,
  };

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    gap:     '20px',
    flex:    1,
  };

  const tabsNavStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '2px',
    width:         '220px',
    flexShrink:    0,
    position:      'sticky',
    top:           '24px',
    alignSelf:     'flex-start',
  };

  const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    display:        'flex',
    alignItems:     'center',
    gap:            '10px',
    padding:        '10px 14px',
    fontSize:       '13px',
    fontWeight:     isActive ? 700 : 500,
    color:          isActive ? '#818CF8' : 'var(--text-secondary)',
    background:     isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
    border:         'none',
    borderRadius:   '8px',
    cursor:         'pointer',
    transition:     'all 0.15s ease',
    textAlign:      'left',
    fontFamily:     'inherit',
    width:          '100%',
    outline:        'none',
  });

  const contentStyle: React.CSSProperties = {
    flex:     1,
    minWidth: 0,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div style={pageStyle}>

      {/* HEADER */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          <Settings size={24} />
          Configuración
        </h1>
        <p style={subtitleStyle}>
          Ajustes del sistema, perfil y permisos
        </p>
      </header>

      {/* LAYOUT — Tabs laterales + Contenido */}
      <div style={layoutStyle}>

        {/* Navegación de tabs (lateral) */}
        <nav
          style={tabsNavStyle}
          role="tablist"
          aria-label="Secciones de configuración"
        >
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${tab.id}`}
                style={tabButtonStyle(isActive)}
                onClick={() => setActiveTab(tab.id as SettingsTabKey)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contenido del tab activo */}
        <div
          style={contentStyle}
          role="tabpanel"
          id={`settings-panel-${activeTab}`}
          aria-label={`Panel: ${visibleTabs.find(t => t.id === activeTab)?.label ?? activeTab}`}
        >
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
