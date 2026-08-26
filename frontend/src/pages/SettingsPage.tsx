// ¿Qué? Página de configuración del sistema TriDa con sistema de tabs.
// ¿Para qué? Reemplazar settings.jsx (~620 líneas) con una versión modular
//            que compone los 6 tabs como sub-componentes independientes.
// ¿Impacto? Se accede en /settings. Contiene perfil, gestión de usuarios,
//           modelo IA, notificaciones, roles/permisos y sistema.
//           Algunos tabs solo son visibles para ADMINISTRADOR.

import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { SETTINGS_TABS, type SettingsTabKey } from '@constants/Navigation';
import {
  ProfileTab,
  UsersTab,
  ModelTab,
  NotificationsTab,
  RolesTab,
  SystemTab,
} from '@components/settings';
import type { PermissionKey } from '@constants/Permissions';

// ==============================================================================
// MAPEO DE TABS A COMPONENTES
// ==============================================================================

const TAB_COMPONENTS: Record<SettingsTabKey, React.ComponentType> = {
  profile: ProfileTab,
  users: UsersTab,
  model: ModelTab,
  notifications: NotificationsTab,
  roles: RolesTab,
  system: SystemTab,
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

  const visibleTabs = SETTINGS_TABS.filter((tab) => {
    if (!tab.permission) return true;
    return hasPermission(tab.permission as PermissionKey);
  });

  // ==============================================================================
  // COMPONENTE ACTIVO
  // ==============================================================================

  const ActiveComponent = TAB_COMPONENTS[activeTab] ?? ProfileTab;

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <div className="flex min-h-full flex-col gap-5 p-6 font-sans md:p-8">
      {/* ================================================================
          HEADER
          ================================================================ */}
      <header className="flex flex-col gap-1">
        <h1 className="m-0 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          <Settings size={24} aria-hidden="true" />
          Configuración
        </h1>
        <p className="m-0 text-[13px] text-[var(--text-secondary)]">
          Ajustes del sistema, perfil y permisos
        </p>
      </header>

      {/* ================================================================
          LAYOUT — Tabs laterales + Contenido
          ================================================================ */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        {/* Navegación de tabs (lateral) */}
        <nav
          className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1 lg:sticky lg:top-6 lg:w-[220px] lg:flex-col lg:overflow-visible lg:border-none lg:bg-transparent lg:p-0"
          role="tablist"
          aria-label="Secciones de configuración"
        >
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`settings-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full shrink-0 items-center gap-2.5 rounded-lg border-none px-3.5 py-2.5 text-left font-sans text-[13px] transition-all duration-150 outline-none focus-visible:shadow-[var(--focus-ring)] ${
                  isActive
                    ? 'bg-[rgba(99,102,241,0.1)] font-bold text-indigo-light'
                    : 'bg-transparent font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon size={16} className="shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Contenido del tab activo */}
        <div
          className="min-w-0 flex-1"
          role="tabpanel"
          id={`settings-panel-${activeTab}`}
          aria-label={`Panel: ${visibleTabs.find((t) => t.id === activeTab)?.label ?? activeTab}`}
        >
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}