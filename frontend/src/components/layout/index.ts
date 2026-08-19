// ¿Qué? Barrel export que centraliza todos los componentes de layout del sistema.
// ¿Para qué? Permitir importar múltiples componentes desde una sola ruta
//            (@components/layout) en vez de tener que importar de cada archivo.
// ¿Impacto? Simplifica los imports en App.tsx, páginas y otros módulos.
//           Si un componente se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// LAYOUTS PRINCIPALES
// ==============================================================================

export { AppLayout } from './AppLayout';
export type { AppLayoutProps } from './AppLayout';

export { AuthLayout } from './AuthLayout';
export type { AuthLayoutProps } from './AuthLayout';

// ==============================================================================
// SIDEBAR — Componente principal
// ==============================================================================

export { Sidebar } from './Sidebar';
export type { SidebarProps } from './Sidebar';

// ==============================================================================
// SIDEBAR — Sub-componentes
// ==============================================================================

export { SidebarBrand } from './SidebarBrand';
export type { SidebarBrandProps } from './SidebarBrand';

export { SidebarBankSelector } from './SidebarBankSelector';
export type { SidebarBankSelectorProps } from './SidebarBankSelector';

export { SidebarNav } from './SidebarNav';
export type { SidebarNavProps } from './SidebarNav';

export { SidebarUserProfile } from './SidebarUserProfile';
export type { SidebarUserProfileProps } from './SidebarUserProfile';

export { SidebarFooter } from './SidebarFooter';
export type { SidebarFooterProps } from './SidebarFooter';