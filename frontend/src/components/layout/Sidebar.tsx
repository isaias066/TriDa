// ¿Qué? Componente principal del sidebar que orquesta todos los sub-componentes.
// ¿Para qué? Reemplazar el sidebar.jsx original (~250 líneas) con una versión
//            modular, tipada y con persistencia del estado colapsado.
// ¿Impacto? Es la barra lateral principal de toda la aplicación autenticada.
//           Se usa en AppLayout y controla la navegación global.

import { useState } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useTransactions } from '@hooks/useTransactions';
import { useAlerts } from '@hooks/useAlerts';
import { useBank } from '@context/BankContext';
import { SidebarBrand } from './SidebarBrand';
import { SidebarBankSelector } from './SidebarBankSelector';
import { SidebarNav } from './SidebarNav';
import { SidebarUserProfile } from './SidebarUserProfile';
import { SidebarFooter } from './SidebarFooter';

// ==============================================================================
// TYPES
// ==============================================================================

export interface SidebarProps {
  defaultCollapsed?: boolean;
  persistCollapsedState?: boolean;
  className?: string;
}

// ==============================================================================
// CONSTANTES
// ==============================================================================

const SIDEBAR_WIDTHS = {
  expanded:  '240px',
  collapsed: '64px',
} as const;

// ==============================================================================
// COMPONENTE PRINCIPAL
// ==============================================================================

export function Sidebar({
  defaultCollapsed = false,
  persistCollapsedState = true,
  className = '',
}: SidebarProps) {
  const { selectedBank } = useBank();

  // ==============================================================================
  // ESTADO — Colapsado (con persistencia opcional)
  // ==============================================================================

  const [collapsedLocal, setCollapsedLocal] = useState(defaultCollapsed);
  const [collapsedStored, setCollapsedStored] = useLocalStorage(
    'trida-sidebar-collapsed',
    defaultCollapsed
  );

  const collapsed = persistCollapsedState ? collapsedStored : collapsedLocal;
  const setCollapsed = persistCollapsedState ? setCollapsedStored : setCollapsedLocal;

  // ==============================================================================
  // ESTADO — Sistema LIVE
  // ==============================================================================

  const [isLive, setIsLive] = useLocalStorage('trida-sidebar-live', true);

  // ==============================================================================
  // DATOS DINÁMICOS PARA EL SIDEBAR
  // ==============================================================================

  const { transactions } = useTransactions(selectedBank, { pageSize: 1000 });
  const totalTransactions = transactions.length;

  const { counts: alertCounts } = useAlerts(selectedBank);
  const alertCount = alertCounts.critical + alertCounts.high;

  const transactionsPerSecond = isLive ? Math.floor(Math.random() * 8) + 3 : 0;

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleToggleCollapsed = (): void => {
    setCollapsed(!collapsed);
  };

  const handleToggleLive = (): void => {
    setIsLive(!isLive);
  };

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const wrapperStyle: React.CSSProperties = {
    position:      'sticky',
    top:           0,
    left:          0,
    height:        '100vh',
    width:         collapsed ? SIDEBAR_WIDTHS.collapsed : SIDEBAR_WIDTHS.expanded,
    background:    'var(--bg-secondary)',
    borderRight:   '1px solid var(--border)',
    display:       'flex',
    flexDirection: 'column',
    fontFamily:    'Inter, sans-serif',
    transition:    'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    flexShrink:    0,
    overflow:      'hidden',
    zIndex:        50,
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${className}`}
      style={wrapperStyle}
      aria-label="Barra lateral de navegación"
    >
      {/* 1. Brand + Toggle */}
      <SidebarBrand
        collapsed={collapsed}
        onToggle={handleToggleCollapsed}
      />

      {/* 2. Selector de banco */}
      <SidebarBankSelector collapsed={collapsed} />

      {/* 3. Navegación principal */}
      <SidebarNav
        collapsed={collapsed}
        alertCount={alertCount}
        isLive={isLive}
      />

      {/* 4. Perfil del usuario + logout */}
      <SidebarUserProfile collapsed={collapsed} />

      {/* 5. Footer con reloj, LIVE, stats, theme toggle */}
      <SidebarFooter
        collapsed={collapsed}
        isLive={isLive}
        onToggleLive={handleToggleLive}
        totalTransactions={totalTransactions}
        transactionsPerSecond={transactionsPerSecond}
      />
    </aside>
  );
}