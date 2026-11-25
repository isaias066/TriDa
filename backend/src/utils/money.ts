import { z } from "zod";
import { Prisma } from "@prisma/client";

const MAX_AMOUNT = new Prisma.Decimal("9999999999999.99");

const moneyValue = z
  .unknown()
  .transform((value, context) => {
    if (value === null || value === undefined || value === "") {
      context.addIssue({
        code: "custom",
        message: "El monto es requerido",
      });
      return z.NEVER;
    }

    try {
      const decimal = new Prisma.Decimal(String(value).trim());
      if (!decimal.isFinite()) {
        throw new Error("Monto no finito");
      }
      const normalized = decimal.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
      if (normalized.greaterThan(MAX_AMOUNT)) {
        context.addIssue({
          code: "custom",
          message: "El monto es demasiado grande",
        });
        return z.NEVER;
      }

      return normalized.toNumber();
    } catch {
      context.addIssue({
        code: "custom",
        message: "El monto debe ser un número válido",
      });
      return z.NEVER;
    }
  })
  .pipe(z.number().finite());

export const positiveMoney = moneyValue.pipe(z.number().positive("El monto debe ser mayor a 0"));

export const nonNegativeMoney = moneyValue.pipe(z.number().min(0));
