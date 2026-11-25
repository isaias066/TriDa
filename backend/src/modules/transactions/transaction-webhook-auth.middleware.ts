import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../../config.js";
import { AppError } from "../../utils/AppError.js";

export const requireTransactionWebhookSecret = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const expectedSecret = config.TRANSACTION_WEBHOOK_SECRET;
  if (expectedSecret.length < 32) {
    return next(
      new AppError(
        "La clave del webhook de transacciones no está configurada",
        503,
        "WEBHOOK_NOT_CONFIGURED",
      ),
    );
  }

  const receivedSecret = req.get("x-trida-webhook-secret") ?? "";
  const expected = Buffer.from(expectedSecret);
  const received = Buffer.from(receivedSecret);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return next(
      new AppError("Credenciales del webhook inválidas", 401, "INVALID_WEBHOOK_SECRET"),
    );
  }
  const timestamp = req.get("x-trida-timestamp") ?? "";
  const signature = req.get("x-trida-signature") ?? "";
  const timestampMs = Number(timestamp) * 1000;
  if (
    !/^\d{10}$/.test(timestamp) ||
    !Number.isFinite(timestampMs) ||
    Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000
  ) {
    return next(
      new AppError("Timestamp del webhook inválido o expirado", 401, "INVALID_WEBHOOK_TIMESTAMP"),
    );
  }
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return next(
      new AppError("No fue posible verificar el cuerpo del webhook", 400, "INVALID_WEBHOOK_BODY"),
    );
  }
  const payload = `${timestamp}.${rawBody.toString("utf8")}`;
  const expectedSignature = createHmac("sha256", expectedSecret)
    .update(payload)
    .digest("hex");
  const receivedSignature = signature.replace(/^sha256=/i, "").toLowerCase();
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    return next(
      new AppError("Firma del webhook inválida", 401, "INVALID_WEBHOOK_SIGNATURE"),
    );
  }
  return next();
};
