// ¿Qué? Tipos e interfaces relacionados a usuarios del sistema TriDa y clientes bancarios.
// ¿Para qué? Definir la estructura de datos que maneja el frontend para diferenciar
//            usuarios internos (Admin, Analista, Operador, Auditor) de clientes bancarios.
// ¿Impacto? Cualquier cambio en la BD que afecte estas entidades debe reflejarse aquí
//           y en los normalizers correspondientes.

import type { SystemRole } from '@constants/Roles';

// ==============================================================================
// USUARIO AUTENTICADO (sesión activa)
// ==============================================================================

/**
 * Datos del usuario actualmente autenticado en la aplicación.
 *
 * ¿Qué? Representa al usuario logueado, con los datos mínimos necesarios
 *       para la UI (Sidebar, Settings, ProtectedRoute).
 * ¿Para qué? Consumido por el AuthContext para toda la aplicación.
 * ¿Impacto? Los cambios aquí afectan al AuthContext y a todos los componentes
 *           que consumen `useAuth()`.
 *
 * NOTE: Los campos coinciden con el objeto `user` retornado por `POST /api/auth/login`.
 *       El backend los envía en español porque coinciden con la BD.
 */
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: SystemRole;
}

// ==============================================================================
// USUARIO DEL SISTEMA (internos: Admin, Analista, Operador, Auditor)
// ==============================================================================

/**
 * Estructura de un usuario del sistema tal como viene del backend.
 *
 * ¿Qué? Datos completos de un usuario interno de TriDa.
 * ¿Para qué? Renderizar la tabla de gestión de usuarios en Settings.
 * ¿Impacto? Coincide con la tabla `trida.usuarios_sistemas` de la BD.
 *
 * NOTE: Los campos vienen en snake_case porque así los envía el backend
 *       (coinciden con las columnas de la BD).
 */
export interface SystemUserRaw {
  id_usuario:              number;
  nombre_completo:         string;
  email:                   string;
  rol:                     SystemRole;
  estado:                  boolean;
  fecha_creacion:          string;      // ISO 8601 timestamp
  ultimo_acceso:           string | null;
  id_usuario_generador?:   number | null;
}

/**
 * Usuario del sistema normalizado para uso en el frontend.
 *
 * ¿Qué? Versión limpia del `SystemUserRaw` con nombres en camelCase.
 * ¿Para qué? Consumo consistente en componentes React.
 * ¿Impacto? El normalizer convierte `SystemUserRaw` → `SystemUser` antes de usar.
 */
export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: SystemRole;
  status: UserStatus;
  avatar: string;
  createdAt: string;
  lastLogin: string | null;
  createdBy?: number | null;
}

/** Estado normalizado de un usuario del sistema. */
export type UserStatus = 'active' | 'inactive';

// ==============================================================================
// CLIENTE BANCARIO (usuarios finales de los bancos monitoreados)
// ==============================================================================

/**
 * Estructura de un cliente bancario tal como viene del backend.
 *
 * ¿Qué? Datos completos de un cliente de un banco monitoreado por TriDa.
 * ¿Para qué? Renderizar la lista de clientes con sus dispositivos en la página Users.
 * ¿Impacto? Coincide con la tabla `trida.clientes` de la BD.
 *
 * NOTE: Los campos vienen en snake_case (coinciden con columnas de la BD).
 */
export interface BankClientRaw {
  id_cliente:      number;
  nombre_completo: string;
  email:           string;
  telefono:        string;
  fecha_registro:  string;
  estado:          boolean;
  pais:            string;
  ciudad:          string;
  banco?:          string;       
  banco_codigo?:   string;       
  banco_color?:    string;       
  riesgo?:         number;       
}

/**
 * Cliente bancario normalizado para uso en el frontend.
 *
 * ¿Qué? Versión limpia del `BankClientRaw` con estructura anidada.
 * ¿Para qué? Consumo consistente en la página Users.
 * ¿Impacto? El normalizer convierte `BankClientRaw` → `BankClient` antes de usar.
 */
export interface BankClient {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  avatar: string;
  status: UserStatus;
  registeredAt: string;
  bank: {
    id:    string;
    name:  string;
    color: string;
  };
  riskScore: number;
}

// ==============================================================================
// PAYLOADS PARA REQUESTS
// ==============================================================================

/**
 * Payload para el endpoint `POST /api/auth/login`.
 * NOTE: Los campos coinciden con lo que espera el backend.
 */
export interface LoginPayload {
  email:    string;
  password: string;
}

/**
 * Payload para el endpoint `POST /api/auth/register`.
 * Requiere token de ADMINISTRADOR.
 * NOTE: Los campos coinciden con lo que espera el backend en español.
 */
export interface RegisterPayload {
  nombre_completo: string;
  email:           string;
  password:        string;
  rol:             SystemRole;
}

/**
 * Payload para el endpoint `POST /api/auth/forgot-password`.
 */
export interface ForgotPasswordPayload {
  correo: string;
}

/**
 * Payload para el endpoint `POST /api/auth/reset-password`.
 */
export interface ResetPasswordPayload {
  token:           string;
  nuevaContrasena: string;
}

// ==============================================================================
// RESPONSES DE ENDPOINTS
// ==============================================================================

/**
 * Respuesta del endpoint `POST /api/auth/login`.
 * NOTE: Estructura definida por el backend.
 */
export interface LoginResponse {
  token: string;
  user:  AuthUser;
}

/**
 * Respuesta del endpoint `POST /api/auth/register`.
 */
export interface RegisterResponse {
  message: string;
  user: {
    id:     number;
    nombre: string;
    email:  string;
    rol:    SystemRole;
    estado: boolean;
  };
}

/**
 * Respuesta del endpoint `POST /api/auth/forgot-password`.
 */
export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Respuesta del endpoint `POST /api/auth/reset-password`.
 */
export interface ResetPasswordResponse {
  message: string;
  email:   string;
}

/**
 * Respuesta del endpoint `GET /api/auth/verify-reset-token`.
 */
export interface VerifyResetTokenResponse {
  valid: boolean;
  email?: string;
  error?: string;
}