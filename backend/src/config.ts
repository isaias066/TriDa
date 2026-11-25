// ¿Qué? Configuración centralizada y validada con Zod para el backend.
// ¿Para qué? Cargar variables de entorno y validar tipos/formatos antes de arrancar el servidor.
// ¿Impacto? Evita que la app funcione con secretos inseguros o URLs faltantes (RS-003, RS-004).

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";
import { logger } from "./utils/logger.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

const envSchema = z.object({
  // Servidor
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  APP_TIMEZONE: z
    .string()
    .default("America/Bogota")
    .refine((timeZone) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone });
        return true;
      } catch {
        return false;
      }
    }, "APP_TIMEZONE debe ser una zona horaria IANA válida"),

  // Base de datos
  DATABASE_URL: z.string().min(1, "DATABASE_URL es requerida"),

  // Correo SMTP
  SMTP_ENABLED: z.preprocess(
    (value) => (value === undefined || value === "" ? "false" : value),
    z.enum(["true", "false"]).transform((value) => value === "true"),
  ),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.preprocess(
    (value) => (value === undefined || value === "" ? "587" : value),
    z.coerce.number().int().min(1).max(65535),
  ),
  SMTP_SECURE: z.preprocess(
    (value) => (value === undefined || value === "" ? "false" : value),
    z.enum(["true", "false"]).transform((value) => value === "true"),
  ),

  // Autenticación (RS-003)
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  TRANSACTION_WEBHOOK_SECRET: z.string().default(""),

  // Correo SMTP (opcionales en desarrollo)
  EMAIL_USER: z.string().optional().default(""),
  EMAIL_PASS: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default('"TriDa App" <no-reply@trida.app>'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error("config.validation_failed", result.error, {
      invalidFields: result.error.issues.map((issue) => issue.path.join(".")).join(","),
    });
    process.exit(1);
  }

  return result.data;
};

export const config = parseEnv();
