import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import {
  API_BASE_URL,
  API_ENDPOINTS,
  AUTH_EXPIRED_EVENT,
  TOKEN_KEY,
} from "@/constants/Api";
import { ApiErrorResponse } from "@/types";

interface ApiClientError {
  response?: {
    status: number;
    data?: ApiErrorResponse;
  };
  code?: string;
  message?: string;
}

export function normalizeApiError(error: ApiClientError): Error {
  if (error.response) {
    const status = error.response.status;
    const apiError = error.response.data?.error;
    const code = apiError?.code;
    const message =
      apiError?.message || `El servidor respondió con HTTP ${status}.`;
    return new Error(`[HTTP ${status}${code ? ` · ${code}` : ""}] ${message}`);
  }

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return new Error(
      "Sin respuesta HTTP (Network Error). Verifica que el backend esté iniciado y que la URL de API y CORS sean correctos.",
    );
  }

  return new Error(
    `Sin respuesta HTTP${error.code ? ` (${error.code})` : ""}: ${error.message || "Ocurrió un error inesperado."}`,
  );
}

/**
 * Instancia global de Axios configurada con la base URL de la API v2.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Interceptor Petición: Adjunta el token JWT guardado en localStorage.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Interceptor Respuesta: Normaliza los errores del backend y maneja 401.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Los módulos API extraen data del sobre ApiSuccess y devuelven el payload.
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const publicAuthEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.REGISTER,
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN,
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
    ];
    const isPublicAuthRequest = publicAuthEndpoints.some(
      (endpoint) => endpoint === error.config?.url,
    );

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      const hadToken = Boolean(localStorage.getItem(TOKEN_KEY));
      localStorage.removeItem(TOKEN_KEY);

      if (hadToken && !window.location.pathname.startsWith("/login")) {
        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.dispatchEvent(
          new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { returnTo } }),
        );
      }
    }

    if (
      error.response?.status === 403 &&
      error.response.data?.error?.code === "USER_INACTIVE" &&
      !window.location.pathname.startsWith("/login")
    ) {
      const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(
        new CustomEvent(AUTH_EXPIRED_EVENT, {
          detail: { returnTo, reason: "USER_INACTIVE" },
        }),
      );
    }

    return Promise.reject(normalizeApiError(error));
  },
);
