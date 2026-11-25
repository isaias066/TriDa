// ¿Qué? Middleware de autenticación y autorización por roles.
// ¿Para qué? Interceptar peticiones en rutas protegidas, verificar el JWT y validar el estado del usuario en la BD.
// ¿Impacto? Garantiza la seguridad de las rutas y cumple con RS-001 y RS-002.

import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/prisma.js";
import { verifyToken, JwtPayload } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

/**
 * Middleware principal: Verifica el JWT y confirma que el usuario existe y está activo.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Token no proporcionado.", 401, "TOKEN_MISSING"));
    return;
  }

  const token = authHeader.split(" ")[1];
  let decoded: JwtPayload & { purpose?: string };
  try {
    decoded = verifyToken<JwtPayload & { purpose?: string }>(token);
  } catch {
    next(new AppError("Token inválido o expirado.", 401, "INVALID_TOKEN"));
    return;
  }

  if (
    !decoded ||
    !Number.isSafeInteger(decoded.id_usuario) ||
    decoded.id_usuario <= 0 ||
    decoded.purpose ||
    (decoded.token_version !== undefined &&
      (!Number.isSafeInteger(decoded.token_version) || decoded.token_version < 0))
  ) {
    next(new AppError("Token inválido o mal formado.", 401, "INVALID_TOKEN"));
    return;
  }

  let usuario;
  try {
    usuario = await prisma.usuario.findUnique({
      where: { id_usuario: decoded.id_usuario },
      select: {
        id_usuario: true,
        email: true,
        rol: true,
        nombre_completo: true,
        estado: true,
        token_version: true,
      },
    });
  } catch (error) {
    next(error);
    return;
  }

  if (!usuario) {
    next(new AppError("Usuario no encontrado en la base de datos.", 401, "USER_NOT_FOUND"));
    return;
  }

  if (!usuario.estado) {
    next(new AppError("Cuenta de usuario desactivada.", 403, "USER_INACTIVE"));
    return;
  }

  if ((decoded.token_version ?? 0) !== usuario.token_version) {
    next(new AppError("Token inválido o expirado.", 401, "INVALID_TOKEN"));
    return;
  }

  req.user = {
    id_usuario: usuario.id_usuario,
    email: usuario.email,
    rol: usuario.rol,
  };
  next();
};

/**
 * Middleware de roles: Restringe el acceso si se requiere un rol específico (ej. 'ADMIN').
 */
export const requireRoles = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Acceso denegado: No autenticado.", 401, "UNAUTHENTICATED"));
      return;
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      next(new AppError("Permisos insuficientes para esta acción.", 403, "FORBIDDEN"));
      return;
    }

    next();
  };
};
