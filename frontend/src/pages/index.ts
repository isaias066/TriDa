// ¿Qué? Barrel export que centraliza todas las páginas del sistema TriDa.
// ¿Para qué? Permitir importar múltiples páginas desde una sola ruta (@pages)
//            para usarlas en App.tsx y el router principal.
// ¿Impacto? Simplifica los imports en App.tsx. Si una página se mueve o
//           renombra, solo se actualiza esta re-exportación.

// ==============================================================================
// PÁGINAS DE AUTENTICACIÓN
// ==============================================================================

export { LoginPage } from './auth/LoginPage';
export { ForgotPasswordPage } from './auth/ForgotPasswordPage';
export { ResetPasswordPage } from './auth/ResetPasswordPage';

// ==============================================================================
// PÁGINAS PRINCIPALES
// ==============================================================================

export { DashboardPage } from './DashboardPage';
export { AlertsPage } from './AlertsPage';
export { TransactionsPage } from './TransactionsPage';
export { TransactionMapPage } from './TransactionMapPage';
export { UsersPage } from './UsersPage';
export { AnalyticsPage } from './AnalyticsPage';
export { SettingsPage } from './SettingsPage';

// ==============================================================================
// PÁGINAS DE ERROR
// ==============================================================================

export { NotFoundPage } from './NotFoundPage';