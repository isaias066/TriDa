/**
 * ¿Qué? Modelo del usuario autenticado en el sistema.
 */
export interface User {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  telefono?: string | null;
  pais?: string | null;
  ciudad?: string | null;
  rol: "USER" | "ADMIN";
  estado: boolean;
  fecha_registro: string;
  ultimo_acceso?: string | null;
}

export type SessionUser = Pick<
  User,
  "id_usuario" | "nombre_completo" | "email" | "rol"
> &
  Partial<
    Pick<
      User,
      | "telefono"
      | "pais"
      | "ciudad"
      | "estado"
      | "fecha_registro"
      | "ultimo_acceso"
    >
  >;

/**
 * ¿Qué? Interfaces de payloads para peticiones de Auth (coinciden con auth.schemas.ts).
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nombre_completo: string;
  telefono?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetTokenPayload {
  token: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ResetPasswordPayload {
  token: string;
  password_nueva: string;
}

export interface ChangePasswordPayload {
  password_actual: string;
  password_nueva: string;
}

export interface UpdateProfilePayload {
  nombre_completo?: string;
  telefono?: string | null;
}

/**
 * ¿Qué? Respuesta devuelta tras un login exitoso.
 */
export interface AuthResponseData {
  token: string;
  user: SessionUser;
}

export interface RegisterResponseData {
  message: string;
  emailVerificationRequired: boolean;
}
