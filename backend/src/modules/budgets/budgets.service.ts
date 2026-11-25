import { prisma } from "../../db/prisma.js";
import { queryRaw } from "../../db/queryRaw.js";
import type {
  BudgetQueryInput,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "./budgets.schemas.js";
import { AppError } from "../../utils/AppError.js";

type NumericValue = number | string | { toString(): string };

type BudgetRow = {
  id_presupuesto: number;
  id_categoria: number | null;
  limite_mensual: NumericValue;
  mes: number;
  anio: number;
  fecha_creacion: Date;
  nombre_categoria: string | null;
  icono_categoria: string | null;
  color_categoria: string | null;
  gastado: NumericValue;
};

class BudgetError extends AppError {
  constructor(message: string, statusCode = 400, code = "BUDGET_ERROR") {
    super(message, statusCode, code);
  }
}

function formatBudget(item: BudgetRow) {
  return {
    id_presupuesto: Number(item.id_presupuesto),
    id_categoria: item.id_categoria === null ? null : Number(item.id_categoria),
    limite_mensual: Number(item.limite_mensual),
    mes: item.mes,
    anio: item.anio,
    fecha_creacion: item.fecha_creacion,
    gastado: Number(item.gastado),
    categoria: {
      nombre: item.nombre_categoria,
      icono: item.icono_categoria,
      color: item.color_categoria,
    },
  };
}

export const budgetsService = {
  async list(
    userId: number,
    filters: BudgetQueryInput = {},
  ) {
    const rows = await queryRaw<BudgetRow[]>(
      `
        SELECT
          p.id_presupuesto,
          p.id_categoria,
          p.limite_mensual,
          p.mes,
          p.anio,
          p.fecha_creacion,
          c.nombre AS nombre_categoria,
          c.icono AS icono_categoria,
          c.color AS color_categoria,
          COALESCE((
            SELECT SUM(t.monto)
            FROM trida.transacciones t
            WHERE t.id_categoria = p.id_categoria
              AND t.id_usuario = p.id_usuario
              AND t.tipo_movimiento = 'GASTO'
              AND t.fecha_transaccion >= (make_date(p.anio, p.mes, 1)::timestamp AT TIME ZONE 'America/Bogota')
              AND t.fecha_transaccion < ((make_date(p.anio, p.mes, 1) + INTERVAL '1 month') AT TIME ZONE 'America/Bogota')
              AND t.estado IN ('CONFIRMADA', 'APROBADA')
              AND ($2::int IS NULL OR t.id_cuenta = $2 OR t.id_cuenta_destino = $2)
          ), 0)::numeric AS gastado
        FROM trida.presupuestos p
        LEFT JOIN trida.categorias c ON c.id_categoria = p.id_categoria
        WHERE p.id_usuario = $1
          AND ($3::int IS NULL OR p.mes = $3)
          AND ($4::int IS NULL OR p.anio = $4)
        ORDER BY p.anio DESC, p.mes DESC, p.id_presupuesto
      `,
      userId,
      filters.id_cuenta ?? null,
      filters.mes ?? null,
      filters.anio ?? null,
    );

    return rows.map(formatBudget);
  },

  async create(userId: number, data: CreateBudgetInput) {
    const category = await prisma.categoria.findFirst({
      where: {
        id_categoria: data.id_categoria,
        estado: true,
        tipo: "GASTO",
        OR: [{ id_usuario: null }, { id_usuario: userId }],
      },
      select: { id_categoria: true },
    });

    if (!category) {
      throw new BudgetError(
        "La categoría debe existir, pertenecer al usuario y ser de tipo GASTO",
        400,
        "INVALID_BUDGET_CATEGORY",
      );
    }

    const budget = await prisma.presupuesto.create({
      data: {
        id_usuario: userId,
        id_categoria: data.id_categoria,
        limite_mensual: data.limite_mensual,
        mes: data.mes,
        anio: data.anio,
      },
    });

    return {
      id_presupuesto: budget.id_presupuesto,
      id_categoria: budget.id_categoria,
      limite_mensual: Number(budget.limite_mensual),
      mes: budget.mes,
      anio: budget.anio,
      fecha_creacion: budget.fecha_creacion,
    };
  },

  async update(userId: number, budgetId: number, data: UpdateBudgetInput) {
    const budget = await prisma.presupuesto.findFirst({
      where: {
        id_presupuesto: budgetId,
        id_usuario: userId,
      },
      select: { id_presupuesto: true },
    });

    if (!budget) {
      throw new BudgetError("Presupuesto no encontrado", 404);
    }

    const updatedBudget = await prisma.presupuesto.update({
      where: { id_presupuesto: budgetId },
      data: { limite_mensual: data.limite_mensual },
    });

    return {
      id_presupuesto: updatedBudget.id_presupuesto,
      limite_mensual: Number(updatedBudget.limite_mensual),
      mes: updatedBudget.mes,
      anio: updatedBudget.anio,
    };
  },

  async delete(userId: number, budgetId: number) {
    const budget = await prisma.presupuesto.findFirst({
      where: {
        id_presupuesto: budgetId,
        id_usuario: userId,
      },
      select: { id_presupuesto: true },
    });

    if (!budget) {
      throw new BudgetError("Presupuesto no encontrado", 404);
    }

    await prisma.presupuesto.delete({
      where: { id_presupuesto: budgetId },
    });

    return { id_presupuesto: budgetId };
  },
};
