// ¿Qué? Constantes de configuración de la capa API del sistema TriDa.
// ¿Para qué? Centralizar URLs, timeouts, claves de storage y códigos HTTP
//            para evitar hardcodeo disperso en toda la aplicación.
// ¿Impacto? Cualquier cambio de configuración de red se hace aquí y afecta
//           a toda la comunicación con el backend.

// ==============================================================================
// URL BASE DEL BACKEND
// ==============================================================================

/**
 * URL base de la API del backend.
 *
 * ¿Qué? Se obtiene desde la variable de entorno VITE_API_URL.
 * ¿Para qué? Cumplir RS-004 (prohibido hardcodear URLs) y permitir configurar
 *            distintos entornos (desarrollo, staging, producción).
 * ¿Impacto? Si no está definida, se usa localhost por defecto SOLO en desarrollo.
 *
 * NOTE: En producción, VITE_API_URL debe apuntar al backend real vía HTTPS.
 */
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ==============================================================================
// CLAVES DE ALMACENAMIENTO LOCAL
// ==============================================================================

/**
 * Claves usadas para persistir datos en localStorage.
 *
 * ¿Qué? Centralizar los nombres de las claves de storage.
 * ¿Para qué? Evitar errores de tipeo y facilitar refactorización.
 * ¿Impacto? Cambiar una clave aquí requiere migración de datos existentes.
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'trida-token',
  THEME:      'trida-theme',
  LOCALE:     'trida-locale',
} as const;

// ==============================================================================
// TIMEOUTS Y LÍMITES DE RED
// ==============================================================================

/**
 * Configuración de timeouts para peticiones HTTP.
 * Los valores están en milisegundos.
 */
export const API_TIMEOUTS = {
  DEFAULT: 30_000,
  AUTH:    10_000,
  EXPORT:  60_000,
} as const;

export const MAX_RETRY_ATTEMPTS = 3;

export const RETRY_DELAY_MS = 1_000;

// ==============================================================================
// CÓDIGOS HTTP ESTÁNDAR
// ==============================================================================

/**
 * Códigos HTTP que maneja explícitamente el frontend.
 *
 * ¿Para qué? Evitar comparaciones con "números mágicos" en el código.
 */
export const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE:   503,
} as const;

// ==============================================================================
// HEADERS ESTÁNDAR
// ==============================================================================


export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept':       'application/json',
};


export const AUTH_HEADER = 'Authorization';

export const AUTH_HEADER_PREFIX = 'Bearer';

// ==============================================================================
// MENSAJES DE ERROR GENÉRICOS (RS-007)
// ==============================================================================


export const ERROR_MESSAGES = {
  GENERIC:            'Error procesando solicitud. Por favor intente de nuevo.',
  NETWORK:            'Sin conexión con el servidor. Verifica tu red.',
  TIMEOUT:            'La solicitud tardó demasiado. Intenta de nuevo.',
  UNAUTHORIZED:       'Tu sesión ha expirado. Por favor inicia sesión de nuevo.',
  FORBIDDEN:          'No tienes permisos para realizar esta acción.',
  NOT_FOUND:          'El recurso solicitado no existe.',
  VALIDATION:         'Los datos ingresados no son válidos.',
  CONFLICT:           'El recurso ya existe en el sistema.',
  RATE_LIMIT:         'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  SERVER:             'Error interno del servidor. Nuestro equipo ha sido notificado.',
} as const;

// ==============================================================================
// CONFIGURACIÓN DE PAGINACIÓN
// ==============================================================================


export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 30,
  SMALL_PAGE_SIZE:   10,
  LARGE_PAGE_SIZE:   100,
  INITIAL_PAGE:      0,
} as const;

// ==============================================================================
// CONFIGURACIÓN DE SESIÓN (RS-003)
// ==============================================================================


export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1_000,
  ACCESS_TOKEN_TTL_MS:   15 * 60 * 1_000,
  REFRESH_TOKEN_TTL_MS:  24 * 60 * 60 * 1_000,
} as const;

// ==============================================================================
// TIPOS DERIVADOS
// ==============================================================================

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;