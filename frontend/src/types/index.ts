// ¿Qué? Barrel export que centraliza todos los tipos e interfaces del sistema TriDa.
// ¿Para qué? Permitir importar múltiples tipos desde una sola ruta (@types)
//            en vez de tener que importar de cada archivo individualmente.
// ¿Impacto? Simplifica los imports en componentes, hooks y capa API.
//           Si un tipo se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// USUARIOS Y AUTENTICACIÓN
// ==============================================================================

export type {
  // Usuario autenticado (sesión activa)
  AuthUser,

  // Usuarios internos del sistema
  SystemUser,
  SystemUserRaw,
  UserStatus,

  // Clientes bancarios (usuarios finales de los bancos)
  BankClient,
  BankClientRaw,

  // Payloads de requests
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,

  // Responses de endpoints
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetTokenResponse,
} from './User';

// ==============================================================================
// BANCOS
// ==============================================================================

export type {
  Bank,
  BankRaw,
  AllBanksId,
  SelectedBankId,
} from './Bank';

export {
  ALL_BANKS_ID,
  ALL_BANKS_OPTION,
  DEFAULT_BANK_COLOR,
  UNASSIGNED_BANK_ID,
} from './Bank';

// ==============================================================================
// TRANSACCIONES
// ==============================================================================

export type {
  Transaction,
  TransactionRaw,

  TransactionStatus,
  TransactionStatusRaw,
  TransactionChannel,
  CurrencyCode,

  TransactionFilters,
  TransactionSort,
  TransactionSortField,

  TransactionStats,

  TransactionMapPoint,
} from './Transaction';

// ==============================================================================
// ALERTAS
// ==============================================================================

export type {
  Alert,
  AlertRaw,
  RecentAlert,

  AlertCriticality,
  AlertCriticalityRaw,
  AlertStatus,
  AlertStatusRaw,
  AlertClassification,
  AlertClassificationRaw,

  Validation,
  ValidationRaw,
  ValidateAlertPayload,

  AlertFilters,
  AlertStats,
} from './Alert';

// ==============================================================================
// DISPOSITIVOS
// ==============================================================================

export type {
  Device,
  DeviceRaw,
  DeviceCategory,
  DevicesByClient,
  DeviceStats,
  DeviceFilters,
} from './Device';

export {
  MOBILE_KEYWORDS,
  TABLET_KEYWORDS,
} from './Device';

// ==============================================================================
// UBICACIONES GEOGRÁFICAS
// ==============================================================================

export type {
  Location,
  LocationRaw,
  LocationInfo,
  Coordinates,
  CityStats,
  CityStatsRaw,
  MapPoint,
} from './Location';

export {
  COORDINATE_LIMITS,
  DEFAULT_COORDINATES,
  isValidLatitude,
  isValidLongitude,
  hasValidCoordinates,
} from './Location';

// ==============================================================================
// ANALYTICS Y REPORTES
// ==============================================================================

export type {
  // Métricas globales
  AnalyticsMetrics,
  AnalyticsMetricsRaw,

  // Agregaciones
  AnalyticsAggregations,
  TransactionTypeAggregation,
  ChannelAggregation,
  BankAggregation,
  CityAggregationRaw,

  // Dashboard
  DashboardStats,
  DashboardStatsRaw,

  // Mapa
  MapStats,
  MapStatsRaw,

  // Reportes
  Report,
  ReportRaw,
  ReportType,
  GenerateReportPayload,

  // Exportación
  ExportFormat,
  ExportMetadata,
  ExportOptions,
} from './Analytics';