/**
 * ¿Qué? Configuración de URLs y endpoints de la API v2.
 * ¿Para qué? Evitar cadenas de texto sueltas (hardcoded URLs) en el código.
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v2";

export const TOKEN_KEY = "trida_jwt_token";
export const AUTH_EXPIRED_EVENT = "trida:auth-expired";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_RESET_TOKEN: "/auth/verify-reset-token",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    LOGOUT: "/auth/logout",
  },
  ACCOUNTS: "/accounts",
  CATEGORIES: "/categories",
  TRANSACTIONS: "/transactions",
  ALERTS: "/alerts",
  DEVICES: "/devices",
  BUDGETS: "/budgets",
  SAVINGS: "/savings",
  INSIGHTS: "/insights",
  REPORTS: "/reports",
  PROFILE: "/profile",
  MAP: "/map",
} as const;
