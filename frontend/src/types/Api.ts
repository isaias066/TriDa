/**
 * ¿Qué? Envoltorio genérico de respuesta exitosa de la API v2.
 * ¿Para qué? Tipar de forma consistente las respuestas de todos los endpoints.
 */
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiMessageData {
  message: string;
}

/**
 * ¿Qué? Estructura estandarizada de errores devueltos por el backend.
 * ¿Para qué? Manejar fallos de validación, autenticación y servidor.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMetadata {
  total: number;
  limit: number;
  offset?: number;
  page?: number;
  total_pages?: number;
}

/**
 * ¿Qué? Estructura usada por la API para listados con paginación.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

/**
 * ¿Qué? Parámetros comunes de consulta (paginación y ordenamiento).
 */
export interface BaseQueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
}
