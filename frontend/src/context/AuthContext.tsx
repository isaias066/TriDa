// ¿Qué? Contexto de React para gestión de autenticación y sesión del usuario.
// ¿Para qué? Reemplazar authcontext.jsx corrigiendo el bug de /api/auth/me
//            (que no existe en el backend) y añadir cierre automático por
//            inactividad según RS-003.
// ¿Impacto? Consumido por ProtectedRoute, LoginPage, Sidebar y Settings.
//           Cualquier cambio en la sesión (login, logout, expiración) se
//           propaga a toda la aplicación.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  clearToken,
  getStoredToken,
  login as apiLogin,
  register as apiRegister,
  storeToken,
} from '@api/Auth';
import { ApiError } from '@api/Client';
import { SESSION_CONFIG } from '@constants/Api';
import { hasPermission as checkPermission } from '@constants/Permissions';
import { isAdminRole } from '@constants/Roles';
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from '@app-types';
import type { PermissionKey } from '@constants/Permissions';
import type { SystemRole } from '@constants/Roles';

// ==============================================================================
// TYPES
// ==============================================================================

export interface AuthContextValue {
  // --- Estado ---
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  // --- Acciones ---
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (payload: RegisterPayload) => Promise<void>;

  // --- Helpers de rol/permisos ---
  isRole: (role: SystemRole) => boolean;
  hasPermission: (permission: PermissionKey) => boolean;
}

// ==============================================================================
// CONTEXT
// ==============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 *
 * ¿Qué? Extrae los datos del usuario codificados en el token JWT.
 * ¿Para qué? Recuperar los datos del usuario al recargar la página
 *            sin depender de un endpoint /auth/me inexistente.
 * ¿Impacto? La firma NO se verifica aquí — solo se lee el payload.
 *           El backend valida la firma en cada request protegida.
 *
 *
 * @param token - JWT completo.
 * @returns Payload decodificado o null si es inválido.
 */
function decodeJWTPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

    const decoded = atob(padded);
    const parsed = JSON.parse(decoded) as {
      id_usuario?: number;
      nombre?: string;
      email?: string;
      rol?: SystemRole;
      exp?: number;
    };

    if (
      parsed.id_usuario === undefined ||
      !parsed.email ||
      !parsed.rol
    ) {
      return null;
    }

    return {
      id:     parsed.id_usuario,
      nombre: parsed.nombre ?? 'Usuario',
      email:  parsed.email,
      rol:    parsed.rol,
    };
  } catch {
    return null;
  }
}

/**
 * Verifica si un token JWT ha expirado.
 *
 * @param token - JWT completo.
 * @returns `true` si el token expiró o es inválido.
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = parts[1];
    if (!payload) return true;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const parsed = JSON.parse(atob(padded)) as { exp?: number };

    if (!parsed.exp) return false; // Sin campo exp, asumir válido

    return parsed.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

// ==============================================================================
// PROVIDER
// ==============================================================================

/**
 * Props del AuthProvider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider del contexto de autenticación.
 *
 * ¿Qué? Envuelve la aplicación y provee el estado de sesión + acciones de auth.
 * ¿Para qué? Reemplaza `AuthProvider` de `store/authcontext.jsx` corrigiendo
 *            bugs críticos y añadiendo cierre por inactividad (RS-003).
 * ¿Impacto? Debe montarse en App.tsx antes de las rutas.
 *
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Referencia para el timer de inactividad
  const inactivityTimerRef = useRef<number | null>(null);

  // ==============================================================================
  // INICIALIZACIÓN — Recuperar sesión desde localStorage
  // ==============================================================================

  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Verificar si el token expiró antes de intentar usarlo
    if (isTokenExpired(storedToken)) {
      clearToken();
      setLoading(false);
      return;
    }

    // Decodificar el token para obtener los datos del usuario
    const decodedUser = decodeJWTPayload(storedToken);

    if (decodedUser) {
      setUser(decodedUser);
      setToken(storedToken);
    } else {
      // Token corrupto o inválido → limpiar
      clearToken();
    }

    setLoading(false);
  }, []);

  // ==============================================================================
  // ACCIONES DE SESIÓN
  // ==============================================================================

  /**
   * Cierra la sesión y limpia todo el estado.
   */
  const logout = useCallback((): void => {
    clearToken();
    setToken(null);
    setUser(null);

    // Cancelar timer de inactividad
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  /**
   * Inicia sesión con email y contraseña.
   *
   * @throws ApiError si las credenciales son inválidas.
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const payload: LoginPayload = { email, password };
    const response = await apiLogin(payload);

    storeToken(response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  /**
   * Crea un nuevo usuario del sistema.
   *
   * NOTE: Solo un ADMINISTRADOR puede llamar a esta función.
   *       El backend rechaza con 403 si no cumple.
   *
   * @throws ApiError si falla el registro.
   */
  const register = useCallback(async (payload: RegisterPayload): Promise<void> => {
    await apiRegister(payload);
  }, []);

  // ==============================================================================
  // CIERRE AUTOMÁTICO POR INACTIVIDAD (RS-003)
  // ==============================================================================

  /**
   * Reinicia el timer de inactividad.
   *
   * ¿Qué? Cancela el timer actual y crea uno nuevo con SESSION_CONFIG.INACTIVITY_TIMEOUT_MS.
   * ¿Para qué? Detectar cuando el usuario lleva 30 minutos sin interacción.
   * ¿Impacto? Al cumplirse el tiempo, se ejecuta logout automáticamente.
   */
  const resetInactivityTimer = useCallback((): void => {
    if (inactivityTimerRef.current !== null) {
      window.clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = window.setTimeout(() => {
      logout();
    }, SESSION_CONFIG.INACTIVITY_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (!token) return;

    const events: (keyof WindowEventMap)[] = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];

    resetInactivityTimer();

    // Suscribir a eventos
    events.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    return () => {
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [token, resetInactivityTimer]);

  // ==============================================================================
  // DETECCIÓN DE TOKEN EXPIRADO EN RESPUESTAS API
  // ==============================================================================

  useEffect(() => {
    /**
     * Handler global de errores de API.
     *
     * ¿Qué? Escucha eventos de "unauthorized" que dispara Client.ts.
     * ¿Para qué? Detectar cuando el backend rechaza el token (401) y forzar logout.
     * ¿Impacto? Sincroniza el estado del frontend cuando el backend invalida la sesión.
     */
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent<{ error: ApiError }>;
      const apiError = customEvent.detail?.error;

      if (apiError instanceof ApiError && apiError.status === 401) {
        logout();
      }
    };

    window.addEventListener('trida:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('trida:unauthorized', handleUnauthorized);
  }, [logout]);

  // ==============================================================================
  // HELPERS DE ROL Y PERMISOS
  // ==============================================================================

  const isRole = useCallback(
    (role: SystemRole): boolean => user?.rol === role,
    [user]
  );

  const hasPermission = useCallback(
    (permission: PermissionKey): boolean => {
      if (!user) return false;
      return checkPermission(user.rol, permission);
    },
    [user]
  );

  // ==============================================================================
  // ESTADOS DERIVADOS
  // ==============================================================================

  const isAuthenticated = !!token && !!user;
  const isAdmin = user ? isAdminRole(user.rol) : false;

  // ==============================================================================
  // MEMOIZACIÓN DEL VALOR
  // ==============================================================================

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      register,
      isRole,
      hasPermission,
    }),
    [user, token, loading, isAuthenticated, isAdmin, login, logout, register, isRole, hasPermission]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ==============================================================================
// HOOK
// ==============================================================================

/**
 * Hook para consumir el AuthContext.
 *
 * ¿Qué? Retorna el estado de sesión y las funciones de auth.
 * ¿Para qué? Simplificar el consumo desde componentes.
 * ¿Impacto? Lanza error si se usa fuera del AuthProvider.
 *
 * @returns Objeto con `user`, `login`, `logout`, `isAuthenticated`, etc.
 * @throws Error si se usa fuera del AuthProvider.
 *
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe ser usado dentro de un <AuthProvider>. ' +
      'Envuelve tu aplicación con <AuthProvider> en App.tsx.'
    );
  }

  return context;
}