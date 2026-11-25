// ¿Qué? Limitadores de tasa de peticiones HTTP (Rate Limiting) por dirección IP.
// ¿Para qué? Mitigar ataques de fuerza bruta en autenticación y abuso/DDoS en la API.
// ¿Impacto? Cumple con la regla de seguridad RS-006.

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sendError } from "../utils/apiResponse.js";
import { config } from "../config.js";

function getIpKey(req: import("express").Request): string {
  return ipKeyGenerator(req.ip ?? "");
}

export function getAuthenticatedUserKey(req: import("express").Request): string {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return `ip:${getIpKey(req)}`;

  try {
    const payload = jwt.verify(
      authorization.slice("Bearer ".length),
      config.JWT_SECRET,
    ) as JwtPayload & { id_usuario?: number };
    if (payload.id_usuario) return `user:${payload.id_usuario}`;
  } catch {
    // Sin token válido, usar IP solo como fallback.
  }

  return `ip:${getIpKey(req)}`;
}

export function getEmailKey(req: import("express").Request): string {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  return email ? `email:${email}` : `ip:${getIpKey(req)}`;
}

const authLimitHandler = (_req: import("express").Request, res: import("express").Response) => {
  sendError(res, "Demasiados intentos. Por favor, inténtalo más tarde.", 429, null, "RATE_LIMITED");
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: getEmailKey,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

export const loginIpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  keyGenerator: getIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: getEmailKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: getEmailKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

export const verifyResetTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

export const authMutationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  keyGenerator: getAuthenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: authLimitHandler,
});

/** Limitador general para las rutas de la API */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  limit: 150, // Máximo 150 peticiones por minuto
  keyGenerator: getAuthenticatedUserKey,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, "Límite de peticiones superado. Por favor ralentice sus solicitudes.", 429, null, "RATE_LIMITED");
  },
});
