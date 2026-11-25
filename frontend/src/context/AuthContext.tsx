import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from "@/constants/Api";
import { AuthApi } from "@/api/Auth";
import {
  SessionUser,
  LoginCredentials,
  RegisterCredentials,
  RegisterResponseData,
  UpdateProfilePayload,
} from "@/types";

export interface AuthContextType {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<RegisterResponseData>;
  logout: (skipServerRevocation?: boolean) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleAuthExpired = (event: Event) => {
      const detail = (event as CustomEvent<{
        returnTo?: string;
        reason?: "USER_INACTIVE";
      }>).detail;
      const returnTo = detail?.returnTo;
      setUser(null);
      setToken(null);
      navigate(detail?.reason === "USER_INACTIVE"
        ? "/login?inactive=true"
        : "/login?expired=true", {
        replace: true,
        state: returnTo ? { from: returnTo } : undefined,
      });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () =>
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [navigate]);

  // Al montar la app, si hay token guardado, recupera los datos del usuario con GET /auth/me
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const userData = await AuthApi.getMe();
        if (isMounted) {
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error al verificar sesión inicial:", error);
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const authData = await AuthApi.login(credentials);
      localStorage.setItem(TOKEN_KEY, authData.token);
      setToken(authData.token);
      try {
        setUser(await AuthApi.getMe());
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      return await AuthApi.register(credentials);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async (skipServerRevocation = false) => {
    if (!skipServerRevocation) {
      try {
        await AuthApi.logout();
      } catch (error) {
        console.error("No se pudo revocar la sesión en el servidor:", error);
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const refreshUser = async () => {
    try {
      const userData = await AuthApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Error al refrescar usuario:", error);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload) => {
    const updatedUser = await AuthApi.updateProfile(payload);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
