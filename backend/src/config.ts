// ¿Qué? Archivo de validación centralizada de variables de entorno usando Zod.
// ¿Para qué? Asegurar que el sistema no arranque si faltan secretos como la clave JWT o la base de datos.
// ¿Impacto? Previene vulnerabilidades (RS-004) y caídas silenciosas en producción por configuración incompleta.

import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("24h"),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),
  IA_URL: z.string().url().default("http://localhost:5000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default("TriDa <noreply@trida.com>"),

  // Simulador / API externa de ingesta
  SIMULATOR_API_URL: z.string().url().default("http://127.0.0.1:5100"),
  LIVE_WINDOW_SECONDS: z.string().default("30"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Faltan variables de entorno:");
  console.error(_env.error.format());
  process.exit(1);
}

export const config = _env.data;
