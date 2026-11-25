import { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma.js";
import { queryRaw } from "../../db/queryRaw.js";
import { buildTransactionArchiveCsv, fingerprintExternalEvent } from "./transaction-archive.js";
import { riskService } from "../alerts/risk.service.js";
import { isEmailConfigured, sendEmail } from "../../utils/mailer.js";
import {
  createCriticalAlertEmailTemplate,
  createTransactionConfirmationEmailTemplate,
} from "../../utils/transaction-email-templates.js";
import { logger } from "../../utils/logger.js";
import { getTransactionBalanceDelta } from "./transaction-balance.js";
import {
  createTransactionConfirmationToken,
  verifyTransactionConfirmationToken,
} from "./transaction-confirmation-token.js";
import { AppError } from "../../utils/AppError.js";
import { config } from "../../config.js";
import { parseDateEnd, parseDateStart } from "../../utils/dateRange.js";
import { RISK_THRESHOLDS, riskRankSql, unifiedRiskLevelSql } from "../../utils/risk.js";
import type {
  CreateTransactionInput,
  ExternalTransactionInput,
  ListTransactionsQueryInput,
} from "./transactions.schemas.js";

type TransactionCreationOrigin =
  | { canal: "efectivo" }
  | {
      canal: "webhook";
      fuente: string;
      id_evento: string;
      huella_evento: string;
    };

const isUniqueConstraintError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === "P2002";

export class TransactionError extends AppError {
  constructor(message: string, statusCode = 400, code = "TRANSACTION_ERROR") {
    super(message, statusCode, code);
  }
}

const publicTransactionSelect = {
  id_transaccion: true,
  id_usuario: true,
  id_cuenta: true,
  id_cuenta_destino: true,
  id_categoria: true,
  id_dispositivo: true,
  id_ubicacion: true,
  tipo_movimiento: true,
  monto: true,
  moneda: true,
  descripcion: true,
  comercio: true,
  canal: true,
  fuente_externa: true,
  id_evento_externo: true,
  confirmacion_correo_enviado_en: true,
  es_recurrente: true,
  score_anomalia: true,
  estado: true,
  fecha_transaccion: true,
} satisfies Prisma.transaccionSelect;

export type TransactionQueryParams = ListTransactionsQueryInput;

export class TransactionsService {
  async listTransactions(userId: string | number, params: TransactionQueryParams = {}) {
    const limit = params.limit ?? 10;
    const offset = params.offset ?? 0;
    const page = Math.floor(offset / limit) + 1;
    const sqlParams: unknown[] = [Number(userId)];
    const conditions = [
      "t.id_usuario = $1",
      "EXISTS (SELECT 1 FROM trida.cuentas owned_account WHERE owned_account.id_cuenta = t.id_cuenta AND owned_account.id_usuario = t.id_usuario)",
    ];

    if (params.fecha_inicio) {
      sqlParams.push(parseDateStart(params.fecha_inicio, config.APP_TIMEZONE));
      conditions.push(`t.fecha_transaccion >= $${sqlParams.length}`);
    }

    if (params.fecha_fin) {
      sqlParams.push(parseDateEnd(params.fecha_fin, config.APP_TIMEZONE));
      conditions.push(`t.fecha_transaccion <= $${sqlParams.length}`);
    }

    if (params.tipo_movimiento) {
      sqlParams.push(params.tipo_movimiento);
      conditions.push(`t.tipo_movimiento = $${sqlParams.length}`);
    }

    if (params.id_categoria !== undefined) {
      sqlParams.push(params.id_categoria);
      conditions.push(`t.id_categoria = $${sqlParams.length}`);
    }

    if (params.id_cuenta !== undefined) {
      sqlParams.push(params.id_cuenta);
      conditions.push(
        `(t.id_cuenta = $${sqlParams.length} OR t.id_cuenta_destino = $${sqlParams.length})`,
      );
    }

    if (params.nivel_riesgo && params.nivel_riesgo.toUpperCase() !== "ALL") {
      sqlParams.push(params.nivel_riesgo);
      conditions.push(
        `${unifiedRiskLevelSql("t.score_anomalia", "COALESCE(a.severidad, '')")} = $${sqlParams.length}`,
      );
    }

    if (params.min_monto !== undefined) {
      sqlParams.push(params.min_monto);
      conditions.push(`t.monto >= $${sqlParams.length}`);
    }

    if (params.max_monto !== undefined) {
      sqlParams.push(params.max_monto);
      conditions.push(`t.monto <= $${sqlParams.length}`);
    }

    if (params.estado) {
      sqlParams.push(params.estado);
      conditions.push(`t.estado = $${sqlParams.length}`);
    }

    if (params.search) {
      const escapedSearch = params.search.replace(/[\\%_]/g, "\\$&");
      sqlParams.push(`%${escapedSearch}%`);
      conditions.push(
        `(t.descripcion ILIKE $${sqlParams.length} ESCAPE E'\\\\' OR t.comercio ILIKE $${sqlParams.length} ESCAPE E'\\\\')`,
      );
    }

    const validSortFields: Record<string, string> = {
      fecha_transaccion: "t.fecha_transaccion",
      monto: "t.monto",
      tipo_movimiento: "t.tipo_movimiento",
      nivel_riesgo: `CASE
        WHEN GREATEST(
          ${riskRankSql("t.score_anomalia")},
          CASE
            WHEN a.severidad = 'CRITICA' THEN 4
            WHEN a.severidad = 'ALTA' THEN 3
            WHEN a.severidad = 'MEDIA' THEN 2
            WHEN a.severidad = 'BAJA' THEN 1
            ELSE 1
          END
        ) = 4 THEN 4
        WHEN GREATEST(
          ${riskRankSql("t.score_anomalia")},
          CASE
            WHEN a.severidad = 'CRITICA' THEN 4
            WHEN a.severidad = 'ALTA' THEN 3
            WHEN a.severidad = 'MEDIA' THEN 2
            WHEN a.severidad = 'BAJA' THEN 1
            ELSE 1
          END
        ) = 3 THEN 3
        WHEN GREATEST(
          ${riskRankSql("t.score_anomalia")},
          CASE
            WHEN a.severidad = 'CRITICA' THEN 4
            WHEN a.severidad = 'ALTA' THEN 3
            WHEN a.severidad = 'MEDIA' THEN 2
            WHEN a.severidad = 'BAJA' THEN 1
            ELSE 1
          END
        ) = 2 THEN 2
        ELSE 1
      END`,
    };
    const sortField =
      validSortFields[params.sort_by ?? "fecha_transaccion"] ?? "t.fecha_transaccion";
    const sortOrder = params.sort_order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
    const whereClause = conditions.join(" AND ");
    const countAlertJoin =
      params.nivel_riesgo && params.nivel_riesgo.toUpperCase() !== "ALL"
        ? `LEFT JOIN LATERAL (
          SELECT a.id_alerta, a.severidad
          FROM trida.alertas_fraude a
          WHERE a.id_transaccion = t.id_transaccion
          ORDER BY a.fecha_detectada DESC
          LIMIT 1
        ) a ON TRUE`
        : "";

    const countResult = await queryRaw<Array<{ total: bigint }>>(
      `
        SELECT COUNT(*) AS total
        FROM trida.transacciones t
        ${countAlertJoin}
        WHERE ${whereClause}
      `,
      ...sqlParams,
    );
    const total = Number(countResult[0]?.total ?? 0);

    const dataParams = [...sqlParams, limit, offset];
    const rawTransactions = await queryRaw<
      Array<{
        id_transaccion: number;
        id_usuario: number;
        id_cuenta: number | null;
        id_cuenta_destino: number | null;
        canal: string;
        id_categoria: number | null;
        monto: string | number;
        tipo_movimiento: string;
        comercio: string | null;
        descripcion: string | null;
        estado: string;
        fecha_transaccion: Date;
        latitud: string | number | null;
        longitud: string | number | null;
        es_sospechosa: boolean;
        nivel_riesgo: string;
        motivo_riesgo: string | null;
        nombre_cuenta: string | null;
        nombre_cuenta_destino: string | null;
        nombre_categoria: string | null;
        icono_categoria: string | null;
        color_categoria: string | null;
      }>
    >(
      `
        SELECT
          t.id_transaccion,
          t.id_usuario,
          t.id_cuenta,
          t.id_cuenta_destino,
          t.canal,
          t.id_categoria,
          t.monto,
          t.tipo_movimiento,
          t.comercio,
          t.descripcion,
          t.estado,
          t.fecha_transaccion,
          u.latitud,
          u.longitud,
          (t.score_anomalia >= ${RISK_THRESHOLDS.MEDIUM} OR a.id_alerta IS NOT NULL) AS es_sospechosa,
          ${unifiedRiskLevelSql("t.score_anomalia", "COALESCE(a.severidad, '')")} AS nivel_riesgo,
          a.motivo AS motivo_riesgo,
          c.nombre AS nombre_cuenta,
          destino.nombre AS nombre_cuenta_destino,
          cat.nombre AS nombre_categoria,
          cat.icono AS icono_categoria,
          cat.color AS color_categoria
        FROM trida.transacciones t
        LEFT JOIN trida.cuentas c ON t.id_cuenta = c.id_cuenta
        LEFT JOIN trida.cuentas destino ON t.id_cuenta_destino = destino.id_cuenta
        LEFT JOIN trida.categorias cat ON t.id_categoria = cat.id_categoria
        LEFT JOIN trida.ubicaciones u ON t.id_ubicacion = u.id_ubicacion
        LEFT JOIN LATERAL (
          SELECT a.id_alerta, a.severidad, a.motivo
          FROM trida.alertas_fraude a
          WHERE a.id_transaccion = t.id_transaccion
          ORDER BY a.fecha_detectada DESC
          LIMIT 1
        ) a ON TRUE
        WHERE ${whereClause}
        ORDER BY ${sortField} ${sortOrder}, t.id_transaccion ${sortOrder}
        LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `,
      ...dataParams,
    );

    const data = rawTransactions.map((row) => ({
      id_transaccion: row.id_transaccion,
      id_usuario: row.id_usuario,
      id_cuenta: row.id_cuenta,
      id_cuenta_destino: row.id_cuenta_destino,
      canal: row.canal,
      nombre_cuenta: row.nombre_cuenta,
      nombre_cuenta_destino: row.nombre_cuenta_destino,
      id_categoria: row.id_categoria,
      nombre_categoria: row.nombre_categoria,
      icono_categoria: row.icono_categoria,
      color_categoria: row.color_categoria,
      monto: Number(row.monto),
      tipo_movimiento: row.tipo_movimiento,
      comercio: row.comercio,
      descripcion: row.descripcion,
      estado: row.estado,
      fecha_transaccion: row.fecha_transaccion,
      latitud: row.latitud === null ? null : Number(row.latitud),
      longitud: row.longitud === null ? null : Number(row.longitud),
      es_sospechosa: Boolean(row.es_sospechosa),
      nivel_riesgo: row.nivel_riesgo,
      motivo_riesgo: row.motivo_riesgo,
    }));

    const pagination = {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit) || 1,
    };

    return { data, pagination };
  }

  async list(userId: string | number, params: TransactionQueryParams = {}) {
    return this.listTransactions(userId, params);
  }

  async getTransactionById(id: string | number, userId: string | number) {
    const transaction = await prisma.transaccion.findFirst({
      where: {
        id_transaccion: Number(id),
        id_usuario: Number(userId),
      },
      select: publicTransactionSelect,
    });
    if (!transaction) {
      throw new TransactionError("Transacción no encontrada", 404);
    }

    return {
      ...transaction,
      monto: Number(transaction.monto),
      score_anomalia:
        transaction.score_anomalia === null ? null : Number(transaction.score_anomalia),
    };
  }

  async getById(userId: string | number, transactionId: string | number) {
    return this.getTransactionById(transactionId, userId);
  }

  async createTransaction(userId: string | number, data: CreateTransactionInput) {
    const account = await prisma.cuenta.findFirst({
      where: { id_cuenta: data.id_cuenta, id_usuario: Number(userId), estado: true },
      select: { tipo: true },
    });
    if (!account) {
      throw new TransactionError(
        "La cuenta no existe, no está activa o no pertenece al usuario",
        404,
      );
    }
    if (account.tipo !== "EFECTIVO") {
      throw new TransactionError(
        "Los movimientos manuales solo pueden registrarse en cuentas de efectivo",
        400,
      );
    }
    return this.createTransactionCore(userId, data, { canal: "efectivo" });
  }

  private async createTransactionCore(
    userId: string | number,
    data: CreateTransactionInput | ExternalTransactionInput,
    origin: TransactionCreationOrigin,
  ) {
    const id_usuario = Number(userId);
    const id_categoria = "id_categoria" in data ? (data.id_categoria ?? null) : null;
    const id_dispositivo_input = "id_dispositivo" in data ? data.id_dispositivo : undefined;
    const id_cuenta_destino = "id_cuenta_destino" in data ? (data.id_cuenta_destino ?? null) : null;
    if (
      (data.tipo_movimiento === "TRANSFERENCIA" && id_cuenta_destino === null) ||
      (data.tipo_movimiento !== "TRANSFERENCIA" && id_cuenta_destino !== null) ||
      id_cuenta_destino === data.id_cuenta
    ) {
      throw new TransactionError("Las cuentas de la transferencia no son válidas", 400);
    }
    const variacion_saldo = getTransactionBalanceDelta(data.tipo_movimiento, data.monto);

    return prisma.$transaction(async (transaction) => {
      const cuentaTransaccion = await transaction.cuenta.findFirst({
        where: { id_cuenta: data.id_cuenta, id_usuario, estado: true },
        select: { id_cuenta: true, tipo: true },
      });
      if (!cuentaTransaccion) {
        throw new TransactionError(
          "La cuenta no existe, no está activa o no pertenece al usuario",
          404,
        );
      }

      if (id_cuenta_destino !== null) {
        const cuentaDestino = await transaction.cuenta.findFirst({
          where: {
            id_cuenta: id_cuenta_destino,
            id_usuario,
            estado: true,
          },
          select: { id_cuenta: true },
        });
        if (!cuentaDestino) {
          throw new TransactionError(
            "La cuenta destino no existe, no está activa o no pertenece al usuario",
            404,
          );
        }
      }

      let fecha_transaccion = new Date();
      if (data.fecha_transaccion) {
        if (origin.canal === "efectivo" && cuentaTransaccion.tipo !== "EFECTIVO") {
          throw new TransactionError(
            "La fecha manual solo está disponible para cuentas de efectivo",
            400,
          );
        }
        const fechaManual = new Date(data.fecha_transaccion);
        if (Number.isNaN(fechaManual.getTime())) {
          throw new TransactionError("La fecha de la transacción no es válida", 400);
        }
        if (fechaManual.getTime() > Date.now()) {
          throw new TransactionError("La fecha de la transacción no puede ser futura", 400);
        }
        fecha_transaccion = fechaManual;
      }

      if (id_categoria !== null) {
        const categoriaTransaccion = await transaction.categoria.findFirst({
          where: {
            id_categoria,
            estado: true,
            OR: [{ id_usuario }, { id_usuario: null }],
          },
          select: { id_categoria: true, tipo: true },
        });
        if (!categoriaTransaccion) {
          throw new TransactionError("La categoría no existe o no pertenece al usuario", 404);
        }
        if (categoriaTransaccion.tipo !== data.tipo_movimiento) {
          throw new TransactionError(
            "El tipo de categoría no coincide con el tipo de movimiento",
            400,
          );
        }
      }

      const riskResult = await riskService.evaluateRisk(
        {
          id_usuario,
          monto: data.monto,
          tipo_movimiento: data.tipo_movimiento,
          ubicacion_lat: "latitud" in data ? data.latitud : undefined,
          ubicacion_lon: "longitud" in data ? data.longitud : undefined,
          id_dispositivo: id_dispositivo_input,
          comercio: "comercio" in data ? (data.comercio ?? undefined) : undefined,
          canal: origin.canal,
          fecha_transaccion,
        },
        transaction,
      );
      const { id_dispositivo_validado: id_dispositivo, ...evaluation } = riskResult;
      const motivo_riesgo = riskResult.razones.join("; ") || null;
      const estado =
        origin.canal === "webhook" && data.tipo_movimiento === "GASTO"
          ? "PENDIENTE"
          : riskResult.estado_evaluacion === "APROBADA"
            ? "CONFIRMADA"
            : riskResult.estado_evaluacion === "REVISAR"
              ? "PENDIENTE"
              : "RECHAZADA";

      let id_ubicacion: number | null = null;
      if (
        ("latitud" in data && data.latitud !== undefined) ||
        ("longitud" in data && data.longitud !== undefined) ||
        ("ciudad" in data && data.ciudad) ||
        ("pais" in data && data.pais)
      ) {
        const ubicacion = await transaction.ubicacion.create({
          data: {
            id_dispositivo,
            direccion_ip: null,
            ciudad: "ciudad" in data ? (data.ciudad ?? null) : null,
            pais: "pais" in data ? (data.pais ?? null) : null,
            latitud: "latitud" in data ? (data.latitud ?? null) : null,
            longitud: "longitud" in data ? (data.longitud ?? null) : null,
          },
          select: { id_ubicacion: true },
        });
        id_ubicacion = ubicacion.id_ubicacion;
      }

      const transactionData = await transaction.transaccion.create({
        data: {
          id_usuario,
          id_cuenta: data.id_cuenta,
          id_cuenta_destino,
          id_categoria,
          id_dispositivo,
          id_ubicacion,
          tipo_movimiento: data.tipo_movimiento,
          monto: data.monto,
          canal: origin.canal,
          fuente_externa: origin.canal === "webhook" ? origin.fuente : null,
          id_evento_externo: origin.canal === "webhook" ? origin.id_evento : null,
          huella_evento_externo: origin.canal === "webhook" ? origin.huella_evento : null,
          comercio: data.comercio ?? null,
          descripcion: data.descripcion ?? null,
          es_recurrente: data.es_recurrente ?? false,
          score_anomalia: riskResult.score_riesgo,
          estado,
          fecha_transaccion,
        },
        select: publicTransactionSelect,
      });

      if (estado === "CONFIRMADA") {
        await transaction.cuenta.update({
          where: { id_cuenta: data.id_cuenta },
          data: {
            saldo_actual: { increment: variacion_saldo },
          },
        });
        if (id_cuenta_destino !== null) {
          await transaction.cuenta.update({
            where: { id_cuenta: id_cuenta_destino },
            data: { saldo_actual: { increment: data.monto } },
          });
        }
      }

      let alerta = null;
      if (riskResult.estado_evaluacion !== "APROBADA") {
        alerta = await transaction.alerta_fraude.create({
          data: {
            id_usuario,
            id_transaccion: transactionData.id_transaccion,
            severidad: {
              BAJO: "BAJA",
              MEDIO: "MEDIA",
              ALTO: "ALTA",
              CRITICO: "CRITICA",
            }[riskResult.nivel_riesgo],
            motivo: motivo_riesgo ?? "Transacción fuera del patrón habitual",
            estado: "PENDIENTE",
          },
        });
      }
      return {
        transaction: {
          ...transactionData,
          monto: Number(transactionData.monto),
          score_anomalia:
            transactionData.score_anomalia === null ? null : Number(transactionData.score_anomalia),
        },
        evaluation,
        alert: alerta,
      };
    });
  }

  async ingestExternalTransaction(data: ExternalTransactionInput) {
    if (data.tipo_movimiento === "GASTO" && !isEmailConfigured()) {
      throw new TransactionError(
        "El correo SMTP debe estar configurado para recibir gastos automáticos",
        503,
        "EMAIL_NOT_CONFIGURED",
      );
    }

    const account = await prisma.cuenta.findFirst({
      where: { id_cuenta: data.id_cuenta, estado: true },
      select: { id_usuario: true },
    });
    if (!account) {
      throw new TransactionError("La cuenta de origen no existe o no está activa", 404);
    }

    const eventFingerprint = fingerprintExternalEvent(data);
    const archivedEvent = await prisma.evento_transaccion_archivado.findFirst({
      where: {
        id_cuenta: data.id_cuenta,
        fuente_externa: data.fuente,
        id_evento_externo: data.id_evento,
      },
    });
    if (archivedEvent) {
      if (archivedEvent.huella_evento !== eventFingerprint) {
        throw new TransactionError(
          "El identificador externo ya fue procesado con datos diferentes",
          409,
          "EXTERNAL_EVENT_CONFLICT",
        );
      }
      return {
        transaction: {
          id_transaccion: archivedEvent.id_transaccion_original,
          estado: archivedEvent.estado_original,
        },
        duplicate: true,
        archived: true,
      };
    }

    type CreatedTransaction = Awaited<
      ReturnType<TransactionsService["createTransactionCore"]>
    >["transaction"];
    let transaction: CreatedTransaction;
    let duplicate = false;
    try {
      const result = await this.createTransactionCore(account.id_usuario, data, {
        canal: "webhook",
        fuente: data.fuente,
        id_evento: data.id_evento,
        huella_evento: eventFingerprint,
      });
      transaction = result.transaction;
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const existing = await prisma.transaccion.findFirst({
        where: {
          id_cuenta: data.id_cuenta,
          fuente_externa: data.fuente,
          id_evento_externo: data.id_evento,
        },
      });
      if (!existing) {
        const archivedAfterConflict = await prisma.evento_transaccion_archivado.findFirst({
          where: {
            id_cuenta: data.id_cuenta,
            fuente_externa: data.fuente,
            id_evento_externo: data.id_evento,
          },
        });
        if (!archivedAfterConflict) throw error;
        if (archivedAfterConflict.huella_evento !== eventFingerprint) {
          throw new TransactionError(
            "El identificador externo ya fue procesado con datos diferentes",
            409,
            "EXTERNAL_EVENT_CONFLICT",
          );
        }
        return {
          transaction: {
            id_transaccion: archivedAfterConflict.id_transaccion_original,
            estado: archivedAfterConflict.estado_original,
          },
          duplicate: true,
          archived: true,
        };
      }
      const eventMatches =
        existing.tipo_movimiento === data.tipo_movimiento &&
        existing.id_cuenta_destino === (data.id_cuenta_destino ?? null) &&
        new Prisma.Decimal(existing.monto).equals(new Prisma.Decimal(data.monto)) &&
        existing.comercio === (data.comercio ?? null) &&
        existing.descripcion === (data.descripcion ?? null) &&
        existing.es_recurrente === (data.es_recurrente ?? false) &&
        (!data.fecha_transaccion ||
          existing.fecha_transaccion.getTime() === new Date(data.fecha_transaccion).getTime());
      if (!eventMatches) {
        throw new TransactionError(
          "El identificador externo ya fue procesado con datos diferentes",
          409,
          "EXTERNAL_EVENT_CONFLICT",
        );
      }
      duplicate = true;
      transaction = {
        ...existing,
        monto: Number(existing.monto),
        score_anomalia: existing.score_anomalia === null ? null : Number(existing.score_anomalia),
      };
    }

    if (
      data.tipo_movimiento === "GASTO" &&
      transaction.estado === "PENDIENTE" &&
      transaction.confirmacion_correo_enviado_en === null
    ) {
      const user = await prisma.usuario.findUnique({
        where: { id_usuario: transaction.id_usuario },
        select: { email: true },
      });
      if (!user) {
        throw new TransactionError("No se encontró el correo del usuario", 404);
      }
      const token = createTransactionConfirmationToken(
        {
          id_usuario: transaction.id_usuario,
          id_transaccion: transaction.id_transaccion,
        },
        config.JWT_SECRET,
      );
      const confirmationUrl = new URL("/transactions/confirm", config.FRONTEND_URL);
      confirmationUrl.hash = `/transactions/confirm?token=${encodeURIComponent(token)}`;
      const email = createTransactionConfirmationEmailTemplate(
        new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
        }).format(Number(data.monto)),
        data.comercio ?? data.descripcion ?? "Gasto",
        confirmationUrl.toString(),
      );
      try {
        await sendEmail(user.email, "Confirma un gasto de TriDa", email.html, email.text);
        await prisma.transaccion.update({
          where: { id_transaccion: transaction.id_transaccion },
          data: { confirmacion_correo_enviado_en: new Date() },
        });
      } catch (error) {
        logger.error("transaction.confirmation_email_send_failed", error, {
          transactionId: transaction.id_transaccion,
        });
        throw new TransactionError(
          "El movimiento quedó pendiente, pero no se pudo enviar el correo de confirmación",
          503,
          "CONFIRMATION_EMAIL_UNAVAILABLE",
        );
      }
    }

    return {
      transaction,
      duplicate,
      archived: false,
    };
  }

  async getEmailConfirmation(token: string) {
    const claims = verifyTransactionConfirmationToken(token, config.JWT_SECRET);
    if (!claims) {
      throw new TransactionError("El enlace es inválido o expiró", 400);
    }

    const transaction = await prisma.transaccion.findFirst({
      where: {
        id_transaccion: claims.id_transaccion,
        id_usuario: claims.id_usuario,
        tipo_movimiento: "GASTO",
        canal: "webhook",
      },
      include: { cuenta: { select: { nombre: true } } },
    });
    if (!transaction) {
      throw new TransactionError("No se encontró el gasto asociado al enlace", 404);
    }

    return {
      id_transaccion: transaction.id_transaccion,
      monto: Number(transaction.monto),
      comercio: transaction.comercio,
      descripcion: transaction.descripcion,
      fecha_transaccion: transaction.fecha_transaccion,
      nombre_cuenta: transaction.cuenta?.nombre ?? null,
      estado: transaction.estado,
      puede_responder: transaction.estado === "PENDIENTE",
    };
  }

  async resolveEmailConfirmation(token: string, decision: "FUI_YO" | "NO_FUI_YO") {
    const claims = verifyTransactionConfirmationToken(token, config.JWT_SECRET);
    if (!claims) {
      throw new TransactionError("El enlace es inválido o expiró", 400);
    }

    const result = await prisma.$transaction(async (client) => {
      const transaction = await client.transaccion.findFirst({
        where: {
          id_transaccion: claims.id_transaccion,
          id_usuario: claims.id_usuario,
          tipo_movimiento: "GASTO",
          canal: "webhook",
        },
      });
      if (!transaction) {
        throw new TransactionError("No se encontró el gasto asociado al enlace", 404);
      }
      if (transaction.estado !== "PENDIENTE") {
        throw new TransactionError("El enlace ya fue utilizado o el gasto ya se resolvió", 409);
      }

      const confirmed = decision === "FUI_YO";
      const updated = await client.transaccion.updateMany({
        where: {
          id_transaccion: transaction.id_transaccion,
          id_usuario: claims.id_usuario,
          estado: "PENDIENTE",
        },
        data: { estado: confirmed ? "CONFIRMADA" : "RECHAZADA" },
      });
      if (updated.count !== 1) {
        throw new TransactionError("El gasto ya fue resuelto", 409);
      }

      if (confirmed && transaction.id_cuenta !== null) {
        await client.cuenta.update({
          where: { id_cuenta: transaction.id_cuenta },
          data: {
            saldo_actual: {
              increment: getTransactionBalanceDelta(transaction.tipo_movimiento, transaction.monto),
            },
          },
        });
      }

      if (confirmed) {
        await client.alerta_fraude.updateMany({
          where: {
            id_transaccion: transaction.id_transaccion,
            id_usuario: claims.id_usuario,
            estado: "PENDIENTE",
          },
          data: {
            estado: "DESCARTADA",
            accion_usuario: "FUI_YO",
            fecha_resuelta: new Date(),
          },
        });
      } else {
        const pendingAlert = await client.alerta_fraude.findFirst({
          where: {
            id_transaccion: transaction.id_transaccion,
            id_usuario: claims.id_usuario,
            estado: "PENDIENTE",
          },
          orderBy: { fecha_detectada: "desc" },
        });
        const motivo =
          "El usuario reportó que no reconoce este gasto automático. Requiere revisión inmediata.";
        if (pendingAlert) {
          await client.alerta_fraude.update({
            where: { id_alerta: pendingAlert.id_alerta },
            data: { severidad: "CRITICA", motivo },
          });
        } else {
          await client.alerta_fraude.create({
            data: {
              id_usuario: claims.id_usuario,
              id_transaccion: transaction.id_transaccion,
              severidad: "CRITICA",
              motivo,
              estado: "PENDIENTE",
            },
          });
        }
      }

      await client.log_auditoria.create({
        data: {
          id_usuario: claims.id_usuario,
          tipo_accion: confirmed ? "GASTO_AUTOMATICO_CONFIRMADO" : "GASTO_AUTOMATICO_NO_RECONOCIDO",
          entidad_afectada: "transacciones",
          id_entidad: transaction.id_transaccion,
          descripcion: `El usuario respondió ${decision} al correo de confirmación.`,
        },
      });

      const user = await client.usuario.findUnique({
        where: { id_usuario: claims.id_usuario },
        select: { email: true },
      });
      return { transaction, email: user?.email ?? null };
    });

    if (decision === "NO_FUI_YO") {
      if (!result.email) {
        throw new TransactionError(
          "El gasto fue rechazado y la alerta crítica quedó registrada, pero no se encontró el correo del usuario",
          503,
        );
      }
      try {
        const alertsUrl = new URL("/security", config.FRONTEND_URL).toString();
        const email = createCriticalAlertEmailTemplate(alertsUrl);
        await sendEmail(
          result.email,
          "Alerta crítica de seguridad de TriDa",
          email.html,
          email.text,
        );
      } catch (error) {
        logger.error("transaction.critical_alert_email_send_failed", error, {
          transactionId: result.transaction.id_transaccion,
        });
        throw new TransactionError(
          "El gasto fue rechazado y la alerta crítica quedó registrada, pero no se pudo enviar el correo de alerta",
          503,
          "CRITICAL_ALERT_EMAIL_UNAVAILABLE",
        );
      }
    }

    return {
      id_transaccion: result.transaction.id_transaccion,
      decision,
      estado: decision === "FUI_YO" ? "CONFIRMADA" : "RECHAZADA",
      alerta_critica_creada: decision === "NO_FUI_YO",
    };
  }

  async create(userId: string | number, data: CreateTransactionInput) {
    return this.createTransaction(userId, data);
  }

  async prepareTransactionArchive(userId: string | number) {
    const numericUserId = Number(userId);
    return prisma.$transaction(async (client) => {
      const now = new Date();
      await client.transaccion_archivo_exportacion.deleteMany({
        where: { id_usuario: numericUserId, fecha_expiracion: { lte: now } },
      });

      const [cutoffResult] = await client.$queryRaw<Array<{ fecha_corte: Date }>>`
        SELECT NOW() - INTERVAL '1 year' AS fecha_corte
      `;
      const cutoff = cutoffResult?.fecha_corte;
      if (!cutoff) {
        throw new TransactionError("No se pudo calcular el período de retención", 500);
      }

      const eligible = await client.transaccion.findMany({
        where: {
          id_usuario: numericUserId,
          fecha_transaccion: { lte: cutoff },
          estado: { in: ["CONFIRMADA", "APROBADA", "RECHAZADA"] },
          alertas: { none: { estado: "PENDIENTE" } },
        },
        select: { id_transaccion: true },
        orderBy: { id_transaccion: "asc" },
      });

      if (eligible.length === 0) {
        return {
          id_exportacion: null,
          total: 0,
          fecha_corte: cutoff,
          expira_en: null,
        };
      }

      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
      const archiveExport = await client.transaccion_archivo_exportacion.create({
        data: {
          id_usuario: numericUserId,
          ids_transacciones: eligible.map((transaction) => transaction.id_transaccion),
          fecha_corte: cutoff,
          fecha_expiracion: expiresAt,
        },
        select: { id_exportacion: true },
      });

      await client.log_auditoria.create({
        data: {
          id_usuario: numericUserId,
          tipo_accion: "TRANSACCIONES_ARCHIVO_PREPARADO",
          entidad_afectada: "transacciones",
          descripcion:
            `Preparada exportación ${archiveExport.id_exportacion} de ${eligible.length} ` +
            `movimientos con fecha hasta ${cutoff.toISOString()}.`,
        },
      });

      return {
        id_exportacion: archiveExport.id_exportacion,
        total: eligible.length,
        fecha_corte: cutoff,
        expira_en: expiresAt,
      };
    });
  }

  async downloadTransactionArchive(userId: string | number, exportId: string | number) {
    const numericUserId = Number(userId);
    const numericExportId = Number(exportId);
    return prisma.$transaction(async (client) => {
      const archiveExport = await client.transaccion_archivo_exportacion.findFirst({
        where: { id_exportacion: numericExportId, id_usuario: numericUserId },
      });
      if (!archiveExport) {
        throw new TransactionError("La exportación no existe o no pertenece al usuario", 404);
      }
      if (archiveExport.fecha_expiracion <= new Date()) {
        throw new TransactionError("La exportación expiró; prepara una nueva", 409);
      }
      if (archiveExport.fecha_eliminacion !== null) {
        throw new TransactionError("La exportación ya fue utilizada", 409);
      }

      const transactions = await client.transaccion.findMany({
        where: {
          id_usuario: numericUserId,
          id_transaccion: { in: archiveExport.ids_transacciones },
        },
        include: {
          cuenta: { select: { nombre: true } },
          cuenta_destino: { select: { nombre: true } },
          categoria: { select: { nombre: true } },
          alertas: {
            select: {
              severidad: true,
              motivo: true,
              estado: true,
              fecha_detectada: true,
              fecha_resuelta: true,
              accion_usuario: true,
            },
            orderBy: { fecha_detectada: "asc" },
          },
        },
        orderBy: { fecha_transaccion: "asc" },
      });
      if (transactions.length === 0) {
        throw new TransactionError(
          "Los movimientos de esta exportación ya no están disponibles",
          409,
        );
      }

      const csv = buildTransactionArchiveCsv(
        transactions.map((transaction) => ({
          id_transaccion: transaction.id_transaccion,
          id_cuenta: transaction.id_cuenta,
          nombre_cuenta: transaction.cuenta?.nombre ?? null,
          id_cuenta_destino: transaction.id_cuenta_destino,
          nombre_cuenta_destino: transaction.cuenta_destino?.nombre ?? null,
          fecha_transaccion: transaction.fecha_transaccion,
          tipo_movimiento: transaction.tipo_movimiento,
          monto: transaction.monto,
          moneda: transaction.moneda,
          comercio: transaction.comercio,
          descripcion: transaction.descripcion,
          canal: transaction.canal,
          estado: transaction.estado,
          id_categoria: transaction.id_categoria,
          nombre_categoria: transaction.categoria?.nombre ?? null,
          score_anomalia: transaction.score_anomalia,
          fuente_externa: transaction.fuente_externa,
          id_evento_externo: transaction.id_evento_externo,
          alertas: transaction.alertas,
        })),
      );

      await client.transaccion_archivo_exportacion.update({
        where: { id_exportacion: archiveExport.id_exportacion },
        data: {
          ids_transacciones: transactions.map((transaction) => transaction.id_transaccion),
          fecha_descarga: new Date(),
        },
      });
      await client.log_auditoria.create({
        data: {
          id_usuario: numericUserId,
          tipo_accion: "TRANSACCIONES_ARCHIVO_DESCARGADO",
          entidad_afectada: "transacciones",
          descripcion:
            `Descargada exportación ${archiveExport.id_exportacion} ` +
            `con ${transactions.length} movimientos históricos.`,
        },
      });

      return {
        csv,
        filename: `trida_transacciones_antiguas_${new Date().toISOString().slice(0, 10)}.csv`,
        total: transactions.length,
      };
    });
  }

  async purgeTransactionArchive(userId: string | number, exportId: string | number) {
    const numericUserId = Number(userId);
    const numericExportId = Number(exportId);
    return prisma.$transaction(
      async (client) => {
        const archiveExport = await client.transaccion_archivo_exportacion.findFirst({
          where: { id_exportacion: numericExportId, id_usuario: numericUserId },
        });
        if (!archiveExport) {
          throw new TransactionError("La exportación no existe o no pertenece al usuario", 404);
        }
        if (archiveExport.fecha_expiracion <= new Date()) {
          throw new TransactionError("La exportación expiró; prepara una nueva", 409);
        }
        if (archiveExport.fecha_eliminacion !== null) {
          throw new TransactionError("La exportación ya fue utilizada", 409);
        }
        if (archiveExport.fecha_descarga === null) {
          throw new TransactionError(
            "Descarga el CSV antes de confirmar la eliminación",
            409,
            "ARCHIVE_EXPORT_REQUIRED",
          );
        }

        const eligible = await client.transaccion.findMany({
          where: {
            id_usuario: numericUserId,
            id_transaccion: { in: archiveExport.ids_transacciones },
            fecha_transaccion: { lte: archiveExport.fecha_corte },
            estado: { in: ["CONFIRMADA", "APROBADA", "RECHAZADA"] },
            alertas: { none: { estado: "PENDIENTE" } },
          },
          select: {
            id_transaccion: true,
            id_cuenta: true,
            fuente_externa: true,
            id_evento_externo: true,
            huella_evento_externo: true,
            estado: true,
          },
        });
        const eligibleIds = eligible.map((transaction) => transaction.id_transaccion);

        const archivedEvents = eligible.flatMap((transaction) => {
          if (
            transaction.id_cuenta === null ||
            transaction.fuente_externa === null ||
            transaction.id_evento_externo === null
          ) {
            return [];
          }
          return [
            {
              id_usuario: numericUserId,
              id_cuenta: transaction.id_cuenta,
              fuente_externa: transaction.fuente_externa,
              id_evento_externo: transaction.id_evento_externo,
              id_transaccion_original: transaction.id_transaccion,
              estado_original: transaction.estado,
              huella_evento: transaction.huella_evento_externo ?? "0".repeat(64),
            },
          ];
        });
        if (archivedEvents.length > 0) {
          await client.evento_transaccion_archivado.createMany({
            data: archivedEvents,
          });
        }

        const deleted = await client.transaccion.deleteMany({
          where: {
            id_usuario: numericUserId,
            id_transaccion: { in: eligibleIds },
            fecha_transaccion: { lte: archiveExport.fecha_corte },
            estado: { in: ["CONFIRMADA", "APROBADA", "RECHAZADA"] },
            alertas: { none: { estado: "PENDIENTE" } },
          },
        });
        if (deleted.count !== eligible.length) {
          throw new TransactionError(
            "Los movimientos cambiaron durante la eliminación; vuelve a preparar el archivo",
            409,
            "ARCHIVE_CHANGED",
          );
        }

        const skipped = archiveExport.ids_transacciones.length - deleted.count;
        await client.transaccion_archivo_exportacion.update({
          where: { id_exportacion: archiveExport.id_exportacion },
          data: {
            ids_transacciones: [],
            fecha_eliminacion: new Date(),
          },
        });
        await client.log_auditoria.create({
          data: {
            id_usuario: numericUserId,
            tipo_accion: "TRANSACCIONES_ARCHIVO_ELIMINADO",
            entidad_afectada: "transacciones",
            descripcion:
              `Eliminación anual confirmada para la exportación ${archiveExport.id_exportacion}: ` +
              `${deleted.count} movimientos eliminados, ${skipped} omitidos. ` +
              `Los saldos de las cuentas no fueron modificados.`,
          },
        });

        return {
          eliminadas: deleted.count,
          omitidas: skipped,
          fecha_corte: archiveExport.fecha_corte,
          saldos_modificados: false,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async deleteTransaction(id: string | number, userId: string | number) {
    const transaction = await prisma.transaccion.findFirst({
      where: {
        id_transaccion: Number(id),
        id_usuario: Number(userId),
      },
      select: { id_transaccion: true },
    });
    if (!transaction) {
      throw new TransactionError("Transacción no encontrada", 404);
    }
    throw new TransactionError(
      "La eliminación individual está deshabilitada. Usa la exportación anual y confirma la eliminación desde el historial.",
      409,
      "INDIVIDUAL_TRANSACTION_DELETE_DISABLED",
    );
  }

  async updateStatus(
    userId: string | number,
    transactionId: string | number,
    estado: "CONFIRMADA" | "RECHAZADA",
  ) {
    return prisma.$transaction(async (client) => {
      const transaction = await client.transaccion.findFirst({
        where: {
          id_transaccion: Number(transactionId),
          id_usuario: Number(userId),
        },
      });

      if (!transaction) {
        throw new TransactionError("Transacción no encontrada", 404);
      }
      if (transaction.canal === "webhook" && transaction.tipo_movimiento === "GASTO") {
        throw new TransactionError(
          "Los gastos automáticos deben resolverse desde el enlace enviado por correo",
          409,
          "EMAIL_CONFIRMATION_REQUIRED",
        );
      }
      if (transaction.estado !== "PENDIENTE") {
        throw new TransactionError("Solo se pueden resolver transacciones pendientes", 409);
      }

      const result = await client.transaccion.updateMany({
        where: {
          id_transaccion: transaction.id_transaccion,
          id_usuario: Number(userId),
          estado: "PENDIENTE",
        },
        data: { estado },
      });

      if (result.count !== 1) {
        throw new TransactionError("La transacción ya fue resuelta", 409);
      }

      if (estado === "CONFIRMADA" && transaction.id_cuenta !== null) {
        await client.cuenta.update({
          where: { id_cuenta: transaction.id_cuenta },
          data: {
            saldo_actual: {
              increment: getTransactionBalanceDelta(transaction.tipo_movimiento, transaction.monto),
            },
          },
        });
      }
      if (
        estado === "CONFIRMADA" &&
        transaction.tipo_movimiento === "TRANSFERENCIA" &&
        transaction.id_cuenta_destino !== null
      ) {
        await client.cuenta.update({
          where: { id_cuenta: transaction.id_cuenta_destino },
          data: { saldo_actual: { increment: transaction.monto } },
        });
      }

      const accion_usuario = estado === "CONFIRMADA" ? "FUI_YO" : "NO_FUI_YO";
      const estado_alerta = estado === "CONFIRMADA" ? "DESCARTADA" : "CONFIRMADA";
      const fecha_resuelta = new Date();

      await client.alerta_fraude.updateMany({
        where: {
          id_transaccion: transaction.id_transaccion,
          id_usuario: Number(userId),
          estado: "PENDIENTE",
        },
        data: {
          estado: estado_alerta,
          accion_usuario,
          fecha_resuelta,
        },
      });

      await client.log_auditoria.create({
        data: {
          id_usuario: Number(userId),
          tipo_accion: "TRANSACCION_RESUELTA",
          entidad_afectada: "transacciones",
          id_entidad: transaction.id_transaccion,
          descripcion: `Resolución de transacción: ${estado}; acción: ${accion_usuario}.`,
        },
      });

      return client.transaccion.findUniqueOrThrow({
        where: { id_transaccion: transaction.id_transaccion },
        select: publicTransactionSelect,
      });
    });
  }

  async updateCategory(
    userId: string | number,
    transactionId: string | number,
    categoryId: number | null,
  ) {
    return prisma.$transaction(async (client) => {
      const transaction = await client.transaccion.findFirst({
        where: {
          id_transaccion: Number(transactionId),
          id_usuario: Number(userId),
        },
        select: { id_transaccion: true, tipo_movimiento: true },
      });
      if (!transaction) {
        throw new TransactionError("Transacción no encontrada", 404);
      }
      if (transaction.tipo_movimiento === "TRANSFERENCIA") {
        throw new TransactionError("Las transferencias no pueden tener categoría", 400);
      }

      if (categoryId !== null) {
        const category = await client.categoria.findFirst({
          where: {
            id_categoria: categoryId,
            estado: true,
            tipo: transaction.tipo_movimiento,
            OR: [{ id_usuario: Number(userId) }, { id_usuario: null }],
          },
          select: { id_categoria: true },
        });
        if (!category) {
          throw new TransactionError(
            "La categoría no existe, no está activa o no corresponde al movimiento",
            404,
          );
        }
      }

      return client.transaccion.update({
        where: { id_transaccion: transaction.id_transaccion },
        data: { id_categoria: categoryId },
        select: publicTransactionSelect,
      });
    });
  }

  async delete(userId: string | number, transactionId: string | number) {
    return this.deleteTransaction(transactionId, userId);
  }

  async countsByLevel(userId: string | number) {
    const rows = await queryRaw<Array<{ nivel_riesgo: string; count: number }>>(
      `
        SELECT
          ${unifiedRiskLevelSql("t.score_anomalia", "COALESCE(a.severidad, '')")} AS nivel_riesgo,
          COUNT(*)::int AS count
        FROM trida.transacciones t
          LEFT JOIN LATERAL (
            SELECT a.severidad
            FROM trida.alertas_fraude a
            WHERE a.id_transaccion = t.id_transaccion
            ORDER BY a.fecha_detectada DESC
            LIMIT 1
          ) a ON TRUE
        WHERE t.id_usuario = $1
        GROUP BY 1
      `,
      Number(userId),
    );

    const counts: Record<string, number> = {
      BAJO: 0,
      MEDIO: 0,
      ALTO: 0,
      CRITICO: 0,
    };
    const severityLevels: Record<string, string> = {
      BAJA: "BAJO",
      MEDIA: "MEDIO",
      ALTA: "ALTO",
      CRITICA: "CRITICO",
    };
    for (const row of rows) {
      const nivel_riesgo = severityLevels[row.nivel_riesgo] ?? row.nivel_riesgo;
      if (nivel_riesgo in counts) {
        counts[nivel_riesgo] = Number(row.count);
      }
    }
    return counts;
  }
}

export const transactionsService = new TransactionsService();
export const transactionService = transactionsService;
