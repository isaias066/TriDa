// ¿Qué? Capa API para todos los endpoints de autenticación del sistema TriDa.
// ¿Para qué? Centralizar las llamadas al backend relacionadas con autenticación,
//            recuperación de contraseña y gestión de usuarios del sistema.
// ¿Impacto? Estas funciones son consumidas por AuthContext, LoginPage,
//           ForgotPasswordPage, ResetPasswordPage y Settings.

import { get, post } from './Client';
import type {
  // Payloads
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  // Responses
  LoginResponse,
  RegisterResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetTokenResponse,
  // Otros
  SystemUser,
  SystemUserRaw,
} from '@app-types';

import { normalizeSystemUsers } from '@utils/Normalizers';

// ==============================================================================
// AUTENTICACIÓN
// ==============================================================================

/**
 * Inicia sesión con email y contraseña.
 *
 * ¿Qué? Envía credenciales al backend y recibe token JWT + datos del usuario.
 * ¿Para qué? Autenticar al usuario para acceder a rutas protegidas.
 * ¿Impacto? El token retornado debe guardarse en localStorage para usarse en
 *           futuras requests protegidas.
 *
 * @param payload - Email y contraseña.
 * @returns Token JWT y datos del usuario autenticado.
 * @throws ApiError si las credenciales son inválidas o la cuenta está desactivada.
 *
 * NOTE: Los códigos de error del backend son:
 *   - 400: Email/password faltantes
 *   - 401: Credenciales inválidas
 *   - 403: Cuenta desactivada
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', payload, { skipAuth: true });
}

/**
 * Registra un nuevo usuario del sistema.
 *
 * ¿Qué? Crea una nueva cuenta de usuario interno (Admin, Analista, Operador, Auditor).
 * ¿Para qué? Solo un ADMINISTRADOR puede crear usuarios (requiere token de admin).
 * ¿Impacto? Este endpoint requiere autenticación — el token del admin actual va
 *           automáticamente en el header Authorization.
 *
 * @param payload - Datos del nuevo usuario (nombre_completo, email, password, rol).
 * @returns Datos del usuario creado.
 * @throws ApiError si falla el registro.

 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return post<RegisterResponse>('/auth/register', payload);
}

// ==============================================================================
// RECUPERACIÓN DE CONTRASEÑA
// ==============================================================================

/**
 * Solicita recuperación de contraseña por email.
 *
 * ¿Qué? Envía un email con un enlace de recuperación al usuario.
 * ¿Para qué? Permitir a usuarios que olvidaron su contraseña recibir un link
 *            temporal para restablecerla.
 * ¿Impacto? Por seguridad, la respuesta es idéntica exista o no el email
 *           (previene enumeración de usuarios).
 *
 * NOTE: El enlace en el email expira en 15 minutos.
 *
 * @param payload - Email del usuario.
 * @returns Mensaje de confirmación (siempre exitoso).
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  return post<ForgotPasswordResponse>('/auth/forgot-password', payload, {
    skipAuth: true,
  });
}

/**
 * Verifica si un token de recuperación de contraseña es válido.
 *
 * ¿Qué? Consulta al backend si un token de reset es válido y no expiró.
 * ¿Para qué? Antes de mostrar el formulario de nueva contraseña, verificar
 *            que el enlace del email sea válido.
 * ¿Impacto? Evita mostrar el formulario si el token ya expiró o es inválido.
 *
 * @param token - Token recibido en el email de recuperación.
 * @returns Objeto con `valid: true/false` y opcionalmente `email` si es válido.
 */
export async function verifyResetToken(
  token: string
): Promise<VerifyResetTokenResponse> {
  return get<VerifyResetTokenResponse>(
    '/auth/verify-reset-token',
    { token },
    { skipAuth: true }
  );
}

/**
 * Restablece la contraseña usando un token de recuperación válido.
 *
 * ¿Qué? Cambia la contraseña del usuario asociado al token.
 * ¿Para qué? Completar el flujo de recuperación de contraseña.
 * ¿Impacto? Tras esta acción, el usuario debe hacer login nuevamente con
 *           la nueva contraseña. El token queda inutilizable.
 *
 * NOTE: La nueva contraseña debe cumplir con RS-003:
 *   - Mínimo 8 caracteres
 *   - Incluir mayúsculas, minúsculas, números y símbolos
 *
 * @param payload - Token de recuperación + nueva contraseña.
 * @returns Mensaje de confirmación.
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  return post<ResetPasswordResponse>('/auth/reset-password', payload, {
    skipAuth: true,
  });
}

// ==============================================================================
// GESTIÓN DE USUARIOS DEL SISTEMA
// ==============================================================================

/**
 * Lista todos los usuarios internos del sistema.
 *
 * ¿Qué? Obtiene la lista completa de Administradores, Analistas, Operadores y Auditores.
 * ¿Para qué? Renderizar la tabla de gestión de usuarios en Settings.
 * ¿Impacto? Solo accesible para ADMINISTRADOR — el backend rechaza con 403 en otros roles.
 *
 * NOTE: Endpoint del backend: `GET /api/auth/usuarios-sistema`
 *       Requiere header `Authorization: Bearer <token>` de un ADMIN.
 *
 * @returns Array de usuarios del sistema normalizados.
 */
export async function getSystemUsers(): Promise<SystemUser[]> {
  const raw = await get<SystemUserRaw[]>('/auth/usuarios-sistema');
  return normalizeSystemUsers(raw);
}

// ==============================================================================
// UTILIDADES DE SESIÓN
// ==============================================================================

/**
 * Verifica si hay un token JWT válido guardado en localStorage.
 *
 * ¿Qué? Consulta rápida sin llamar al backend.
 * ¿Para qué? Determinar si el usuario aparenta estar autenticado antes de
 *            hacer una request pesada.
 * ¿Impacto? Solo verifica que exista el token, NO valida contra el backend.
 *
 * NOTE: El backend no tiene endpoint `/auth/me` para validar tokens.
 *       La validación real ocurre en la primera request protegida.
 *       Si el token es inválido, `Client.ts` detecta el 401 y limpia el token.
 *
 * @returns `true` si existe un token guardado.
 */
export function hasStoredToken(): boolean {
  try {
    const token = localStorage.getItem('trida-token');
    return token !== null && token.length > 0;
  } catch {
    return false;
  }
}

/**
 * Obtiene el token JWT actual desde localStorage.
 *
 * @returns Token JWT o null si no existe.
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('trida-token');
  } catch {
    return null;
  }
}

/**
 * Guarda un token JWT en localStorage.
 *
 * @param token - Token JWT a guardar.
 */
export function storeToken(token: string): void {
  try {
    localStorage.setItem('trida-token', token);
  } catch {
    // Silenciar errores (ej: modo incógnito bloqueado)
  }
}

/**
 * Elimina el token JWT de localStorage (logout).
 *
 * ¿Qué? Limpia la sesión almacenada.
 * ¿Para qué? Cerrar sesión del usuario.
 * ¿Impacto? El usuario deberá autenticarse nuevamente para acceder a rutas protegidas.
 */
export function clearToken(): void {
  try {
    localStorage.removeItem('trida-token');
  } catch {
  }
}