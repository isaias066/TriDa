import { prisma } from "../../db/prisma.js";
import { queryRaw } from "../../db/queryRaw.js";
import { getTransactionBalanceDelta } from "../transactions/transaction-balance.js";
import { AppError } from "../../utils/AppError.js";
import type { ListAlertsQueryInput, UpdateAlertStatusInput } from "./alerts.schemas.js";

export class AlertError extends AppError {
  constructor(message: string, statusCode = 400, code = "ALERT_ERROR") {
    super(message, statusCode, code);
  }
}

export const getAlertTransactionDecision = (
  data: Pick<UpdateAlertStatusInput, "estado" | "accion_usuario">,
) => ({
  confirmsTransaction: data.accion_usuario === "FUI_YO" && data.estado === "DESCARTADA",
  rejectsTransaction:
    (data.accion_usuario === "NO_FUI_YO" || data.accion_usuario === "BLOQUEAR_TARJETA") &&
    data.estado === "CONFIRMADA",
});

function serializeAlert<T extends { transaccion: { monto: unknown } | null }>(alert: T) {
  if (!alert.transaccion) return alert;
  return {
    ...alert,
    transaccion: {
      ...alert.transaccion,
      monto: Number(alert.transaccion.monto),
    },
  };
}

export class AlertsService {
  async getAlerts(userId: number, options: ListAlertsQueryInput) {
    const where = {
      id_usuario: userId,
      estado: options.estado,
      severidad: options.severidad,
      ...(options.id_cuenta !== undefined
        ? {
            transaccion: {
              is: {
                OR: [{ id_cuenta: options.id_cuenta }, { id_cuenta_destino: options.id_cuenta }],
              },
            },
          }
        : {}),
    };
    const [alerts, total] = await Promise.all([
      options.sort_by === "severidad"
        ? this.getAlertsBySeverity(userId, options)
        : prisma.alerta_fraude.findMany({
            where,
            orderBy:
              options.sort_by === "estado"
                ? { estado: options.sort_order }
                : { fecha_detectada: options.sort_order },
            skip: options.offset,
            take: options.limit,
            include: {
              transaccion: {
                select: {
                  id_transaccion: true,
                  monto: true,
                  tipo_movimiento: true,
                  descripcion: true,
                  comercio: true,
                  fecha_transaccion: true,
                  ubicacion: { select: { ciudad: true } },
                },
              },
            },
          }),
      prisma.alerta_fraude.count({ where }),
    ]);

    return {
      alerts: alerts.map(serializeAlert),
      total,
      limit: options.limit,
      offset: options.offset,
    };
  }

  private async getAlertsBySeverity(userId: number, options: ListAlertsQueryInput) {
    const sortOrder = options.sort_order === "asc" ? "ASC" : "DESC";
    const rows = await queryRaw<Array<{ id_alerta: number }>>(
      `SELECT id_alerta
       FROM trida.alertas_fraude a
       LEFT JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
       WHERE a.id_usuario = $1
         AND ($2::text IS NULL OR a.estado = $2)
         AND ($3::text IS NULL OR a.severidad = $3)
         AND ($6::int IS NULL OR t.id_cuenta = $6 OR t.id_cuenta_destino = $6)
       ORDER BY CASE a.severidad
         WHEN 'CRITICA' THEN 4
         WHEN 'ALTA' THEN 3
         WHEN 'MEDIA' THEN 2
         WHEN 'BAJA' THEN 1
         ELSE 0
       END ${sortOrder}, fecha_detectada DESC
       LIMIT $4 OFFSET $5`,
      userId,
      options.estado ?? null,
      options.severidad ?? null,
      options.limit,
      options.offset,
      options.id_cuenta ?? null,
    );
    if (rows.length === 0) return [];

    const order = new Map(rows.map((row, index) => [row.id_alerta, index]));
    const alerts = await prisma.alerta_fraude.findMany({
      where: {
        id_usuario: userId,
        id_alerta: { in: rows.map((row) => row.id_alerta) },
      },
      include: {
        transaccion: {
          select: {
            id_transaccion: true,
            monto: true,
            tipo_movimiento: true,
            descripcion: true,
            comercio: true,
            fecha_transaccion: true,
            ubicacion: { select: { ciudad: true } },
          },
        },
      },
    });

    return alerts.sort(
      (left, right) => (order.get(left.id_alerta) ?? 0) - (order.get(right.id_alerta) ?? 0),
    );
  }

  async list(userId: number, options: ListAlertsQueryInput) {
    return this.getAlerts(userId, options);
  }

  async getAlertById(userId: number, id_alerta: number) {
    const alert = await prisma.alerta_fraude.findFirst({
      where: {
        id_alerta,
        id_usuario: userId,
      },
      include: { transaccion: true },
    });

    if (!alert) {
      throw new AlertError("Alerta no encontrada", 404);
    }

    return serializeAlert(alert);
  }

  async getById(userId: number, id_alerta: number) {
    return this.getAlertById(userId, id_alerta);
  }

  async updateAlertStatus(userId: number, id_alerta: number, data: UpdateAlertStatusInput) {
    return prisma.$transaction(async (transaction) => {
      const alert = await transaction.alerta_fraude.findFirst({
        where: { id_alerta, id_usuario: userId },
        include: { transaccion: true },
      });

      if (!alert) {
        throw new AlertError("Alerta no encontrada", 404);
      }

      if (alert.estado !== "PENDIENTE") {
        if (alert.estado === data.estado && alert.accion_usuario === data.accion_usuario) {
          return alert;
        }
        throw new AlertError("La alerta ya fue resuelta y no puede modificarse", 409);
      }

      const currentTransaction = alert.transaccion;
      const { confirmsTransaction, rejectsTransaction } = getAlertTransactionDecision(data);

      const systemBlocked =
        currentTransaction.estado === "RECHAZADA" &&
        alert.estado === "PENDIENTE" &&
        alert.accion_usuario === null;

      if (confirmsTransaction && currentTransaction.estado === "RECHAZADA" && !systemBlocked) {
        throw new AlertError("Una transacción rechazada no puede aprobarse desde la alerta", 409);
      }

      if (
        (confirmsTransaction || rejectsTransaction) &&
        !["PENDIENTE", "CONFIRMADA", "APROBADA", "RECHAZADA"].includes(currentTransaction.estado)
      ) {
        throw new AlertError("La transacción no puede resolverse desde esta alerta", 409);
      }

      if (confirmsTransaction) {
        const transitioned = await transaction.transaccion.updateMany({
          where: {
            id_transaccion: currentTransaction.id_transaccion,
            id_usuario: userId,
            estado: {
              in: systemBlocked
                ? ["PENDIENTE", "CONFIRMADA", "APROBADA", "RECHAZADA"]
                : ["PENDIENTE", "CONFIRMADA", "APROBADA"],
            },
          },
          data: { estado: "CONFIRMADA" },
        });
        if (transitioned.count !== 1) {
          throw new AlertError("La transacción ya fue resuelta", 409);
        }

        if (
          (currentTransaction.estado === "PENDIENTE" || systemBlocked) &&
          currentTransaction.id_cuenta !== null
        ) {
          await transaction.cuenta.update({
            where: { id_cuenta: currentTransaction.id_cuenta },
            data: {
              saldo_actual: {
                increment: getTransactionBalanceDelta(
                  currentTransaction.tipo_movimiento,
                  currentTransaction.monto,
                ),
              },
            },
          });
        }
        if (
          (currentTransaction.estado === "PENDIENTE" || systemBlocked) &&
          currentTransaction.tipo_movimiento === "TRANSFERENCIA" &&
          currentTransaction.id_cuenta_destino !== null
        ) {
          await transaction.cuenta.update({
            where: { id_cuenta: currentTransaction.id_cuenta_destino },
            data: { saldo_actual: { increment: currentTransaction.monto } },
          });
        }
      } else if (
        rejectsTransaction &&
        ["PENDIENTE", "CONFIRMADA", "APROBADA"].includes(currentTransaction.estado)
      ) {
        const transitioned = await transaction.transaccion.updateMany({
          where: {
            id_transaccion: currentTransaction.id_transaccion,
            id_usuario: userId,
            estado: { in: ["PENDIENTE", "CONFIRMADA", "APROBADA"] },
          },
          data: { estado: "RECHAZADA" },
        });
        if (transitioned.count !== 1) {
          throw new AlertError("La transacción ya fue resuelta", 409);
        }

        if (currentTransaction.estado !== "PENDIENTE" && currentTransaction.id_cuenta !== null) {
          await transaction.cuenta.update({
            where: { id_cuenta: currentTransaction.id_cuenta },
            data: {
              saldo_actual: {
                decrement: getTransactionBalanceDelta(
                  currentTransaction.tipo_movimiento,
                  currentTransaction.monto,
                ),
              },
            },
          });
        }
        if (
          currentTransaction.estado !== "PENDIENTE" &&
          currentTransaction.tipo_movimiento === "TRANSFERENCIA" &&
          currentTransaction.id_cuenta_destino !== null
        ) {
          await transaction.cuenta.update({
            where: { id_cuenta: currentTransaction.id_cuenta_destino },
            data: { saldo_actual: { decrement: currentTransaction.monto } },
          });
        }
      }

      const updatedAlert = await transaction.alerta_fraude.update({
        where: { id_alerta },
        data: {
          estado: data.estado,
          accion_usuario: data.accion_usuario,
          fecha_resuelta: new Date(),
        },
      });
      await transaction.log_auditoria.create({
        data: {
          id_usuario: userId,
          tipo_accion: "ALERTA_FRAUDE_RESUELTA",
          entidad_afectada: "alertas_fraude",
          id_entidad: id_alerta,
          descripcion: `Acción registrada: ${data.accion_usuario ?? data.estado}.`,
        },
      });

      if (confirmsTransaction) {
        await transaction.transaccion.updateMany({
          where: {
            id_transaccion: currentTransaction.id_transaccion,
            id_usuario: userId,
            estado: "APROBADA",
          },
          data: { estado: "CONFIRMADA" },
        });
      }

      return updatedAlert;
    });
  }

  async updateStatus(userId: number, id_alerta: number, data: UpdateAlertStatusInput) {
    return this.updateAlertStatus(userId, id_alerta, data);
  }

  async countsByLevel(userId: number, accountId?: number) {
    const rows = await queryRaw<Array<{ severidad: string; count: number }>>(
      `
      SELECT a.severidad, COUNT(*)::int AS count
      FROM trida.alertas_fraude a
      LEFT JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
      WHERE a.id_usuario = $1
        AND ($2::int IS NULL OR t.id_cuenta = $2 OR t.id_cuenta_destino = $2)
      GROUP BY a.severidad
      `,
      userId,
      accountId ?? null,
    );

    return rows.reduce<Record<string, number>>((result, row) => {
      result[row.severidad] = Number(row.count);
      return result;
    }, {});
  }
}

export const alertsService = new AlertsService();
