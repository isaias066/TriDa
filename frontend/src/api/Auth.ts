// ¿Qué? Capa API para todos los endpoints de autenticación del sistema TriDa.
// ¿Para qué? Centralizar las llamadas al backend relacionadas con autenticación,
//            recuperación de contraseña y gestión de usuarios del sistema.
// ¿Impacto? Estas funciones son consumidas por AuthContext, LoginPage,
//           ForgotPasswordPage, ResetPasswordPage y Settings.

// ¿Qué? Capa API para todos los endpoints de autenticación del sistema TriDa.
// ¿Para qué? Centralizar las llamadas al backend relacionadas con autenticación,
//            recuperación de contraseña y gestión de usuarios del sistema.
// ¿Impacto? Estas funciones son consumidas por AuthContext, LoginPage,
//           ForgotPasswordPage, ResetPasswordPage y Settings.

import { get, post, patch } from './Client';
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

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return post<LoginResponse>('/auth/login', payload, { skipAuth: true });
}

export async function register(
  payload: RegisterPayload & { id_banco?: number },
): Promise<RegisterResponse> {
  return post<RegisterResponse>('/auth/register', payload);
}

// ==============================================================================
// RECUPERACIÓN DE CONTRASEÑA
// ==============================================================================

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  return post<ForgotPasswordResponse>('/auth/forgot-password', payload, {
    skipAuth: true,
  });
}

export async function verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
  return get<VerifyResetTokenResponse>('/auth/verify-reset-token', { token }, { skipAuth: true });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  return post<ResetPasswordResponse>('/auth/reset-password', payload, {
    skipAuth: true,
  });
}

// ==============================================================================
// GESTIÓN DE USUARIOS DEL SISTEMA
// ==============================================================================

export async function getSystemUsers(): Promise<SystemUser[]> {
  const raw = await get<SystemUserRaw[]>('/auth/usuarios-sistema');
  return normalizeSystemUsers(raw);
}

// ==============================================================================
// UTILIDADES DE SESIÓN
// ==============================================================================

export function hasStoredToken(): boolean {
  try {
    const token = localStorage.getItem('trida-token');
    return token !== null && token.length > 0;
  } catch (error) {
    console.warn('Error al verificar el token en localStorage:', error);
    return false;
  }
}

// ==============================================================================
// PERFIL Y CONTRASEÑA (Día 3)
// ==============================================================================

export interface UpdateProfilePayload {
  nombre_completo?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    estado: boolean;
  };
}

export interface ChangePasswordPayload {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  return patch<UpdateProfileResponse>('/auth/me', payload);
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  return post<ChangePasswordResponse>('/auth/change-password', payload);
}

export async function getMe(): Promise<{
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: boolean;
  fecha_creacion?: string;
  ultimo_acceso?: string | null;
}> {
  return get('/auth/me');
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem('trida-token');
  } catch (error) {
    console.warn('Error al consultar el token de localStorage:', error);
    return null;
  }
}

export function storeToken(token: string): void {
  try {
    localStorage.setItem('trida-token', token);
  } catch (error) {
    console.warn('Error al guardar el token en localStorage:', error);
  }
}
export function clearToken(): void {
  try {
    localStorage.removeItem('trida-token');
  } catch (error) {
    console.warn('Error al limpiar la sesión en localStorage:', error);
  }
}
