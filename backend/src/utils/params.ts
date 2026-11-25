import { z } from "zod";
import { AppError } from "./AppError.js";

export const MAX_POSTGRES_INT = 2_147_483_647;

const idParamSchema = z.coerce.number().int().positive().max(MAX_POSTGRES_INT);

export function parseId(value: unknown): number {
  const parsed = idParamSchema.safeParse(value);
  if (!parsed.success) {
    throw new AppError("Recurso no encontrado", 404, "NOT_FOUND");
  }
  return parsed.data;
}
