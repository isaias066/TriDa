// ¿Qué? Respuestas HTTP estandarizadas.
// ¿Para qué? Formatear respuestas JSON de éxito y error de forma uniforme.

import { Response } from "express";

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

const errorCodeByStatus: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
  500: "INTERNAL_SERVER_ERROR",
};

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Operación exitosa",
  statusCode = 200,
) => {
  const body: ApiSuccess<unknown> = {
    success: true,
    data,
  };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  message = "Ocurrió un error",
  statusCode = 500,
  details: unknown = null,
  code?: string,
) => {
  const error: ApiError["error"] = {
    code: code ?? errorCodeByStatus[statusCode] ?? "API_ERROR",
    message,
  };
  if (details !== null && details !== undefined) error.details = details;

  const body: ApiError = {
    success: false,
    error,
  };
  return res.status(statusCode).json(body);
};

export const apiResponse = {
  success: sendSuccess,
  error: sendError,
};
