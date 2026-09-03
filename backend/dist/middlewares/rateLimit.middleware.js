// ¿Qué? Limitadores de peticiones HTTP por IP.
// ¿Para qué? Evitar ataques de fuerza bruta y denegación de servicio (DDoS).
// ¿Impacto? Cumple la restricción RS-006 de seguridad perimetral.
import rateLimit from 'express-rate-limit';
export const loginRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Demasiados intentos.' } });
export const apiRateLimiter = rateLimit({ windowMs: 60 * 1000, max: 150, message: { error: 'Límite superado.' } });
//# sourceMappingURL=rateLimit.middleware.js.map