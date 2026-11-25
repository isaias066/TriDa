// ¿Qué? Manejador global de errores.
// ¿Para qué? Capturar excepciones del sistema, validaciones (Zod) y errores de Prisma (DB) antes de enviarlas al cliente.
// ¿Impacto? Cumple con RS-007 impidiendo filtrado de detalles técnicos sensibles y estandariza respuestas de error.

import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

type PrismaKnownRequestErrorLike = {
  name: "PrismaClientKnownRequestError";
  code: string;
  clientVersion: string;
};

export const isPrismaKnownRequestError = (err: unknown): err is PrismaKnownRequestErrorLike =>
  typeof err === "object" &&
  err !== null &&
  "name" in err &&
  err.name === "PrismaClientKnownRequestError" &&
  "code" in err &&
  typeof err.code === "string" &&
  "clientVersion" in err &&
  typeof err.clientVersion === "string";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // 1. Manejo de Errores de Validación (Zod)
  if (err instanceof ZodError) {
    const formattedDetails = err.issues.map((issue: ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    sendError(res, "Error de validación de datos", 400, formattedDetails, "VALIDATION_ERROR");
    return;
  }

  // 2. Manejo de Errores de Prisma (Base de Datos)
  if (isPrismaKnownRequestError(err)) {
    let message = "Error de procesamiento en la base de datos.";
    let statusCode = 400;
    let code = "DATABASE_ERROR";

    // P2002: Violación de restricción única (ej. email duplicado, categoría duplicada)
    if (err.code === "P2002") {
      message = "Conflicto de datos: El registro ya existe.";
      statusCode = 409;
      code = "UNIQUE_CONSTRAINT";
    }
    // P2003: Violación de clave foránea (ej. categoría o cuenta inexistente)
    else if (err.code === "P2003") {
      message = "Relación inválida: El recurso asociado no existe.";
      code = "INVALID_REFERENCE";
    }
    // P2025: Registro no encontrado para actualizar/eliminar
    else if (err.code === "P2025") {
      message = "El recurso solicitado no fue encontrado.";
      statusCode = 404;
      code = "NOT_FOUND";
    }
    else if (err.code === "P2034") {
      message = "La operación tuvo un conflicto de concurrencia. Inténtalo nuevamente.";
      statusCode = 409;
      code = "SERIALIZATION_CONFLICT";
    }

    logger.error("request.database_error", err, {
      requestId: res.locals.requestId ?? "unknown",
      method: req.method,
      path: req.path,
      prismaCode: err.code,
    });
    sendError(res, message, statusCode, null, code);
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error("request.application_error", err, {
        requestId: res.locals.requestId ?? "unknown",
        method: req.method,
        path: req.path,
        statusCode: err.statusCode,
        errorCode: err.code ?? "APP_ERROR",
      });
    }
    sendError(res, err.message, err.statusCode, null, err.code);
    return;
  }

  const errorRecord =
    typeof err === "object" && err !== null
      ? (err as { status?: unknown; statusCode?: unknown; expose?: unknown })
      : {};
  const statusValue = errorRecord.statusCode ?? errorRecord.status;
  const statusCode =
    typeof statusValue === "number" && statusValue >= 400 && statusValue < 600
      ? statusValue
      : 500;
  logger.error("request.unhandled_error", err, {
    requestId: res.locals.requestId ?? "unknown",
    method: req.method,
    path: req.path,
    statusCode,
  });
  const clientMessage =
    statusCode < 500 && errorRecord.expose === true
      ? err instanceof Error
        ? err.message
        : "Solicitud inválida"
      : "Ocurrió un error interno en el servidor.";

  sendError(res, clientMessage, statusCode);
};
