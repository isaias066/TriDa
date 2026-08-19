// ¿Qué? Cliente HTTP centralizado para toda la comunicación con el backend TriDa.
// ¿Para qué? Reemplazar el patrón disperso de fetch() hardcodeado en 10+ componentes,
//            aplicar autenticación JWT automática y manejar errores de forma consistente.
// ¿Impacto? TODAS las llamadas al backend pasan por aquí. Cambios en este archivo
//           afectan a todos los módulos que consumen la API.

import {
  API_URL,
  API_TIMEOUTS,
  AUTH_HEADER,
  AUTH_HEADER_PREFIX,
  DEFAULT_HEADERS,
  ERROR_MESSAGES,
  HTTP_STATUS,
  STORAGE_KEYS,
} from '@constants/Api';

// ==============================================================================
// TYPES
// ==============================================================================

/** Métodos HTTP soportados. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Configuración de una petición HTTP. */
export interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  skipAuth?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

/** Error personalizado para errores de API. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number,
    code: string = 'UNKNOWN_ERROR',
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Obtiene el token JWT desde localStorage.
 *
 * ¿Qué? Lee el token de autenticación guardado.
 * ¿Para qué? Adjuntarlo automáticamente a las requests que lo necesiten.
 * ¿Impacto? Si no existe, la request se envía sin auth (puede fallar con 401).
 */
function getAuthToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Elimina el token JWT de localStorage.
 *
 * ¿Qué? Limpia la sesión almacenada.
 * ¿Para qué? Forzar logout cuando el backend indica sesión expirada.
 * ¿Impacto? El usuario deberá volver a autenticarse.
 */
function clearAuthToken(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    // Silenciar errores de localStorage (ej: modo incógnito bloqueado)
  }
}

/**
 * Construye la URL completa con query params opcionales.
 *
 * @param endpoint - Ruta relativa del endpoint (ej: '/transacciones').
 * @param params - Query params opcionales.
 * @returns URL completa con params serializados.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  // Asegurar que el endpoint empiece con '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = `${API_URL}${cleanEndpoint}`;

  if (!params) return baseUrl;

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Construye los headers de la petición.
 *
 * ¿Qué? Combina los headers por defecto + auth + personalizados.
 * ¿Para qué? Centralizar la construcción de headers.
 */
function buildHeaders(
  skipAuth: boolean = false,
  customHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...(customHeaders ?? {}),
  };

  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers[AUTH_HEADER] = `${AUTH_HEADER_PREFIX} ${token}`;
    }
  }

  return headers;
}

/**
 * Convierte un código HTTP a un mensaje de error legible en español.
 *
 * ¿Qué? Mapea códigos HTTP a mensajes user-friendly.
 * ¿Para qué? Cumplir RS-007 (mensajes genéricos sin exponer detalles técnicos).
 * ¿Impacto? Los detalles técnicos se loguean, el usuario ve mensajes claros.
 */
function getErrorMessage(status: number, fallback?: string): string {
  if (fallback) return fallback;

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:           return ERROR_MESSAGES.VALIDATION;
    case HTTP_STATUS.UNAUTHORIZED:          return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:             return ERROR_MESSAGES.FORBIDDEN;
    case HTTP_STATUS.NOT_FOUND:             return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.CONFLICT:              return ERROR_MESSAGES.CONFLICT;
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:  return ERROR_MESSAGES.VALIDATION;
    case HTTP_STATUS.TOO_MANY_REQUESTS:     return ERROR_MESSAGES.RATE_LIMIT;
    case HTTP_STATUS.INTERNAL_SERVER_ERROR: return ERROR_MESSAGES.SERVER;
    case HTTP_STATUS.SERVICE_UNAVAILABLE:   return ERROR_MESSAGES.SERVER;
    default:                                return ERROR_MESSAGES.GENERIC;
  }
}

/**
 * Maneja la respuesta de una petición HTTP.
 *
 * ¿Qué? Verifica el status code y lanza ApiError si es necesario.
 * ¿Para qué? Centralizar el manejo de errores para todas las requests.
 * ¿Impacto? Detecta automáticamente token expirado y limpia el localStorage.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // Si es 401 (Unauthorized), limpiar token y forzar re-login
  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    clearAuthToken();
    throw new ApiError(
      ERROR_MESSAGES.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED,
      'UNAUTHORIZED'
    );
  }

  // Si es 204 (No Content), retornar undefined
  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return undefined as T;
  }

  // Intentar parsear el JSON del body
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // Si el body no es JSON válido, usar mensaje genérico
    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(response.status),
        response.status,
        'INVALID_RESPONSE'
      );
    }
    return undefined as T;
  }

  // Si la respuesta NO es exitosa, lanzar error
  if (!response.ok) {
    const errorData = data as { error?: string; message?: string; code?: string };
    const message = errorData?.error ?? errorData?.message;
    const code = errorData?.code;

    throw new ApiError(
      getErrorMessage(response.status, message),
      response.status,
      code ?? 'REQUEST_FAILED',
      data
    );
  }

  return data as T;
}

// ==============================================================================
// FUNCIÓN PRINCIPAL — REQUEST
// ==============================================================================

/**
 * Realiza una petición HTTP al backend con autenticación y manejo de errores.
 *
 * ¿Qué? Función principal para comunicarse con el backend.
 * ¿Para qué? Centralizar todas las requests HTTP con features consistentes:
 *            auth JWT automática, timeout, manejo de errores, tipado.
 * ¿Impacto? Reemplaza cientos de líneas de código duplicado de fetch().
 *
 * @param endpoint - Ruta relativa del endpoint (ej: '/auth/login').
 * @param config - Configuración opcional de la petición.
 * @returns Promise con la respuesta tipada.
 * @throws ApiError si la petición falla.
 */
export async function request<T = unknown>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    params,
    skipAuth = false,
    timeout = API_TIMEOUTS.DEFAULT,
    headers: customHeaders,
  } = config;

  const url = buildUrl(endpoint, params);
  const headers = buildHeaders(skipAuth, customHeaders);

  // AbortController para implementar timeout manual
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return await handleResponse<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    // Si el error fue por timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        ERROR_MESSAGES.TIMEOUT,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'TIMEOUT'
      );
    }

    // Si es un ApiError, propagarlo
    if (error instanceof ApiError) {
      throw error;
    }

    // Si es error de red (backend caído, sin internet, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        ERROR_MESSAGES.NETWORK,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        'NETWORK_ERROR'
      );
    }

    // Cualquier otro error inesperado
    throw new ApiError(
      ERROR_MESSAGES.GENERIC,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'UNKNOWN_ERROR',
      error
    );
  }
}

// ==============================================================================
// FUNCIONES HELPER — SHORTCUTS POR MÉTODO
// ==============================================================================

/**
 * Realiza una petición GET.
 */
export function get<T = unknown>(
  endpoint: string,
  params?: RequestConfig['params'],
  options?: Omit<RequestConfig, 'method' | 'body' | 'params'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'GET', params });
}

/**
 * Realiza una petición POST.
 *
 */
export function post<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * Realiza una petición PUT.
 */
export function put<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * Realiza una petición PATCH.
 */
export function patch<T = unknown>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * Realiza una petición DELETE.
 */
export function del<T = unknown>(
  endpoint: string,
  options?: Omit<RequestConfig, 'method' | 'body'>
): Promise<T> {
  return request<T>(endpoint, { ...options, method: 'DELETE' });
}