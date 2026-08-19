// ¿Qué? Barrel export que centraliza todos los hooks personalizados del sistema TriDa.
// ¿Para qué? Permitir importar múltiples hooks desde una sola ruta (@hooks)
//            en vez de tener que importar de cada archivo individualmente.
// ¿Impacto? Simplifica los imports en componentes y páginas.
//           Si un hook se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// HOOKS DE UTILIDAD (UI y comportamiento)
// ==============================================================================

export { useClickOutside } from './useClickOutside';
export type { UseClickOutsideOptions } from './useClickOutside';

export {
  useDebounce,
  useDebouncedCallback,
  DEFAULT_DEBOUNCE_DELAY,
} from './useDebounce';

export { useLocalStorage } from './useLocalStorage';
export type {
  UseLocalStorageOptions,
  SetValue,
} from './useLocalStorage';

export {
  useClock,
  useFormattedClock,
} from './useClock';
export type {
  UseClockOptions,
  FormattedClock,
} from './useClock';

export { usePagination } from './usePagination';
export type {
  UsePaginationOptions,
  UsePaginationResult,
  PageRange,
} from './usePagination';

// ==============================================================================
// HOOKS DE DATOS (fetch + estado)
// ==============================================================================

export {
  useAlerts,
  useRecentAlerts,
} from './useAlerts';
export type {
  UseAlertsResult,
  UseRecentAlertsResult,
} from './useAlerts';

export {
  useTransactions,
  useTransactionsCount,
} from './useTransactions';
export type {
  UseTransactionsOptions,
  UseTransactionsResult,
} from './useTransactions';

export { useDashboardData } from './useDashboardData';
export type {
  UseDashboardDataOptions,
  UseDashboardDataResult,
} from './useDashboardData';

export { useAnalyticsData } from './useAnalyticsData';
export type {
  UseAnalyticsDataOptions,
  UseAnalyticsDataResult,
} from './useAnalyticsData';

export { useMapData } from './useMapData';
export type {
  UseMapDataOptions,
  UseMapDataResult,
  MapPulse,
} from './useMapData';