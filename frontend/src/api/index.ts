// ¿Qué? Barrel export que centraliza todas las funciones y tipos de la capa API.
// ¿Para qué? Permitir importar múltiples endpoints desde una sola ruta (@api)
//            en vez de tener que importar de cada archivo individualmente.
// ¿Impacto? Simplifica los imports en componentes, hooks y páginas.
//           Si una función se mueve de archivo, solo se actualiza esta re-exportación.

// ==============================================================================
// CLIENTE HTTP Y UTILIDADES BASE
// ==============================================================================

export {
  // Función principal
  request,

  // Shortcuts por método HTTP
  get,
  post,
  put,
  patch,
  del,

  // Clase de error tipada
  ApiError,
} from './Client';

export type {
  HttpMethod,
  RequestConfig,
} from './Client';

// ==============================================================================
// AUTENTICACIÓN
// ==============================================================================

export {
  // Endpoints principales
  login,
  register,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getSystemUsers,

  // Utilidades de sesión
  hasStoredToken,
  getStoredToken,
  storeToken,
  clearToken,
} from './Auth';

// ==============================================================================
// BANCOS
// ==============================================================================

export {
  getBanks,
} from './Bancos';

// ==============================================================================
// CLIENTES BANCARIOS
// ==============================================================================

export {
  // Endpoints principales
  getAllClients,
  getClientsByBank,

  // Contadores derivados
  getClientsCount,
  getActiveClientsCount,
} from './Clientes';

// ==============================================================================
// TRANSACCIONES
// ==============================================================================

export {
  // Endpoint principal
  getTransactions,

  // Contadores derivados
  getTransactionsCount,
  getBlockedTransactionsCount,
  getFraudTransactionsCount,
  getTotalAmount,
  getCriticalAlertsCount,
} from './Transacciones';

// ==============================================================================
// ALERTAS
// ==============================================================================

export {
  // Endpoints principales
  getAlerts,
  getRecentAlerts,

  // Contadores derivados
  getAlertsCount,
  getAlertsCountByLevel,
  getAlertsCountsByLevel,
  getActiveAlertsCount,
} from './Alertas';

// ==============================================================================
// DISPOSITIVOS
// ==============================================================================

export {
  // Endpoints principales
  getDevices,
  getDevicesByClient,
  getDevicesByCategory,

  // Contadores y estadísticas
  getDevicesCount,
  getDevicesCountByCategory,
  getDeviceStats,

  // Análisis específico
  getNewDevices,
} from './Dispositivos';

// ==============================================================================
// USUARIOS DEL SISTEMA (helpers derivados)
// ==============================================================================
// NOTE: `getSystemUsers` y `register` (como `createSystemUser`) ya están
//        re-exportados desde Auth.ts. Aquí van solo los helpers derivados.

export {
  getSystemUsersCount,
  getSystemUsersCountByRole,
  getSystemUsersStatusCount,
  getSystemUsersByRole,
  getActiveSystemUsers,
  getSystemUsersNeverLogged,
} from './Usuarios';

// ==============================================================================
// DASHBOARD
// ==============================================================================

export {
  // Endpoints principales
  getDashboardStats,
  getDashboardData,

  // Utilidades derivadas
  getTotalProcessedAmount,
  getFraudRate,
} from './Dashboard';

export type {
  DashboardData,
} from './Dashboard';

// ==============================================================================
// ANALYTICS
// ==============================================================================

export {
  // Endpoints principales
  getAnalyticsMetrics,
  getAnalyticsAggregations,
  getAnalyticsData,

  // Utilidades derivadas
  getDetectionRate,
  getFalsePositiveRate,
  getProtectedAmount,
  getTopCities,
  getTopBanksByFraud,
} from './Analytics';

export type {
  AnalyticsData,
} from './Analytics';

// ==============================================================================
// MAPA
// ==============================================================================

export {
  // Endpoints principales
  getMapStats,
  getMapPoints,
  getMapData,

  // Utilidades derivadas
  getCriticalMapPoints,
  getBlockedMapPoints,
  getRecentMapPoints,
} from './Mapa';

export type {
  MapData,
} from './Mapa';