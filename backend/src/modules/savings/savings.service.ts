import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { calculatePercentage } from "../../utils/decimal-money.js";
import type { AddFundsInput, CreateSavingsInput, UpdateSavingsInput } from "./savings.schemas.js";
import { AppError } from "../../utils/AppError.js";
import { deriveSavingsState, type SavingsState } from "./savings.state.js";
import { dateOnlyValue, isTodayOrFutureDate } from "../../utils/date.js";

type SavingRecord = {
  id_meta: number;
  nombre: string;
  monto_objetivo: number | string | { toString(): string };
  monto_actual: number | string | { toString(): string };
  fecha_limite: Date | null;
  estado: string;
  fecha_creacion: Date;
};

function formatSaving(item: SavingRecord) {
  const objetivo = new Prisma.Decimal(item.monto_objetivo.toString());
  const actual = new Prisma.Decimal(item.monto_actual.toString());
  const progreso = calculatePercentage(actual, objetivo);
  const progresoLimitado = progreso.greaterThan(100) ? new Prisma.Decimal(100) : progreso;

  return {
    id_meta: item.id_meta,
    nombre: item.nombre,
    monto_objetivo: objetivo.toNumber(),
    monto_actual: actual.toNumber(),
    progreso: progresoLimitado
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP)
      .toNumber(),
    fecha_limite: item.fecha_limite,
    estado: item.estado,
    fecha_creacion: item.fecha_creacion,
  };
}

class SavingsError extends AppError {
  constructor(message: string, statusCode = 400, code = "SAVINGS_ERROR") {
    super(message, statusCode, code);
  }
}

export const savingsService = {
  async list(userId: number) {
    const metas = await prisma.meta_ahorro.findMany({
      where: { id_usuario: userId },
      orderBy: { fecha_creacion: "desc" },
    });

    return metas
      .sort((a, b) => Number(b.estado === "ACTIVA") - Number(a.estado === "ACTIVA"))
      .map(formatSaving);
  },

  async create(userId: number, data: CreateSavingsInput) {
    const meta = await prisma.$transaction(async (transaction) => {
      const created = await transaction.meta_ahorro.create({
        data: {
          id_usuario: userId,
          nombre: data.nombre,
          monto_objetivo: data.monto_objetivo,
          monto_actual: 0,
          fecha_limite: data.fecha_limite ? new Date(data.fecha_limite) : null,
          estado: "ACTIVA",
        },
      });

      if (data.monto_actual > 0) {
        await transaction.aporte_meta.create({
          data: { id_meta: created.id_meta, monto: data.monto_actual },
        });
      }

      const updated = await transaction.meta_ahorro.findUniqueOrThrow({
        where: { id_meta: created.id_meta },
      });
      if (updated.monto_actual.greaterThanOrEqualTo(updated.monto_objetivo)) {
        return transaction.meta_ahorro.update({
          where: { id_meta: created.id_meta },
          data: { estado: "COMPLETADA", fecha_completada: new Date() },
        });
      }
      return updated;
    });

    return formatSaving(meta);
  },

  async update(userId: number, metaId: number, data: UpdateSavingsInput) {
    const existing = await prisma.meta_ahorro.findFirst({
      where: {
        id_meta: metaId,
        id_usuario: userId,
      },
      select: {
        id_meta: true,
        monto_actual: true,
        monto_objetivo: true,
        estado: true,
        fecha_completada: true,
        fecha_limite: true,
      },
    });

    if (!existing) {
      throw new SavingsError("Meta de ahorro no encontrada", 404);
    }

    if (
      data.fecha_limite &&
      !isTodayOrFutureDate(data.fecha_limite) &&
      (!existing.fecha_limite ||
        dateOnlyValue(data.fecha_limite) !==
          dateOnlyValue(existing.fecha_limite))
    ) {
      throw new SavingsError(
        "La fecha límite no puede ser anterior a hoy",
        400,
        "INVALID_SAVINGS_DEADLINE",
      );
    }

    const montoObjetivo =
      data.monto_objetivo !== undefined
        ? new Prisma.Decimal(data.monto_objetivo)
        : existing.monto_objetivo;
    const estado = deriveSavingsState(
      existing.monto_actual,
      montoObjetivo,
      existing.estado as SavingsState,
      data.estado,
    );

    const meta = await prisma.meta_ahorro.update({
      where: { id_meta: metaId },
      data: {
        nombre: data.nombre,
        monto_objetivo: data.monto_objetivo,
        fecha_limite:
          data.fecha_limite === null
            ? null
            : data.fecha_limite
              ? new Date(data.fecha_limite)
              : undefined,
        estado,
        fecha_completada:
          estado === "COMPLETADA"
            ? existing.fecha_completada ?? new Date()
            : null,
      },
    });

    return formatSaving(meta);
  },

  async addFunds(userId: number, metaId: number, data: AddFundsInput) {
    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.meta_ahorro.findFirst({
        where: {
          id_meta: metaId,
          id_usuario: userId,
        },
      });

      if (!existing) {
        throw new SavingsError("Meta de ahorro no encontrada", 404);
      }

      if (existing.estado !== "ACTIVA") {
        throw new SavingsError("No se pueden agregar fondos a una meta inactiva o completada", 409);
      }

      await transaction.aporte_meta.create({
        data: {
          id_meta: existing.id_meta,
          monto: data.monto,
        },
      });

      const updated = await transaction.meta_ahorro.findUnique({
        where: { id_meta: existing.id_meta },
      });

      if (!updated) {
        throw new SavingsError("Meta de ahorro no encontrada", 404);
      }

      const estado = updated.monto_actual.greaterThanOrEqualTo(updated.monto_objetivo)
        ? "COMPLETADA"
        : "ACTIVA";
      const meta =
        estado === updated.estado
          ? updated
          : await transaction.meta_ahorro.update({
              where: { id_meta: existing.id_meta },
              data: {
                estado,
                fecha_completada: estado === "COMPLETADA" ? new Date() : null,
              },
            });

      return formatSaving(meta);
    });
  },

  async delete(userId: number, metaId: number) {
    const existing = await prisma.meta_ahorro.findFirst({
      where: {
        id_meta: metaId,
        id_usuario: userId,
      },
      select: { id_meta: true },
    });

    if (!existing) {
      throw new SavingsError("Meta de ahorro no encontrada", 404);
    }

    await prisma.meta_ahorro.delete({
      where: { id_meta: metaId },
    });

    return { id_meta: metaId };
  },
};
