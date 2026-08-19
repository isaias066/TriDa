// ¿Qué? Barrel export que centraliza todos los componentes del Dashboard.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta
//            (@components/dashboard) en vez de tener que importar de cada archivo.
// ¿Impacto? Simplifica los imports en DashboardPage.

// ==============================================================================
// CARDS DE MÉTRICAS
// ==============================================================================

export { StatsCard } from './StatsCards';
export type {
  StatsCardProps,
  StatsCardVariant,
} from './StatsCards';

export { StatsCardsGrid } from './StatsCardsGrid';
export type { StatsCardsGridProps } from './StatsCardsGrid';

// ==============================================================================
// DISTRIBUCIÓN DE ALERTAS
// ==============================================================================

export { AlertsByLevelRings } from './AlertsByLevelRings';
export type { AlertsByLevelRingsProps } from './AlertsByLevelRings';

// ==============================================================================
// PANEL DE ALERTAS RECIENTES
// ==============================================================================

export { RecentAlertsPanel } from './RecentAlertsPanel';
export type { RecentAlertsPanelProps } from './RecentAlertsPanel';