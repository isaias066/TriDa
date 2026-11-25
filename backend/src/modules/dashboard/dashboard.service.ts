// ¿Qué? Servicio del dashboard de finanzas personales y monitoreo de riesgo.
// ¿Para qué? Agregar saldos totales, resumen mensual de ingresos/gastos, alertas activas y transacciones recientes por usuario (RS-001).

import {
  calculateNetBalance,
  type DecimalValue,
} from "../../utils/decimal-money.js";
import { prisma } from "../../db/prisma.js";
import { queryRaw } from "../../db/queryRaw.js";
import { AppError } from "../../utils/AppError.js";
import { getUnifiedRiskLevel } from "../../utils/risk.js";

export const dashboardService = {
  async getStats(userId: number, accountId?: number, periodoDias = 30) {
    const fechaFin = new Date();
    const fechaInicio = new Date(fechaFin.getTime() - periodoDias * 24 * 60 * 60 * 1000);

    // 1. Saldo Total acumulado de las cuentas del usuario
    const [saldoRows, resumenPeriodoRows, alertasRows] = await Promise.all([
      queryRaw<{ saldo_total: DecimalValue }[]>(
      `
      SELECT COALESCE(SUM(saldo_actual), 0)::numeric AS saldo_total
      FROM trida.cuentas
      WHERE id_usuario = $1 AND estado = true
        AND ($2::int IS NULL OR id_cuenta = $2)
      `,
      userId,
      accountId ?? null,
      ),

      queryRaw<
      {
        ingresos: DecimalValue;
        gastos: DecimalValue;
        ahorros: DecimalValue;
      }[]
      >(
      `
      SELECT
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'INGRESO' THEN monto ELSE 0 END), 0)::numeric AS ingresos,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'GASTO' THEN monto ELSE 0 END), 0)::numeric AS gastos,
        COALESCE(SUM(CASE WHEN tipo_movimiento = 'AHORRO' THEN monto ELSE 0 END), 0)::numeric AS ahorros
      FROM trida.transacciones
      WHERE id_usuario = $1
        AND fecha_transaccion >= $2
        AND fecha_transaccion <= $3
        AND estado IN ('CONFIRMADA', 'APROBADA')
        AND ($4::int IS NULL OR id_cuenta = $4 OR id_cuenta_destino = $4)
      `,
      userId,
      fechaInicio,
      fechaFin,
      accountId ?? null,
      ),

      queryRaw<
      {
        alertas_activas: string | number;
        alertas_criticas: string | number;
      }[]
      >(
      `
      SELECT
        COUNT(*) FILTER (WHERE a.estado = 'PENDIENTE')::bigint AS alertas_activas,
        COUNT(*) FILTER (
          WHERE a.estado = 'PENDIENTE' AND a.severidad IN ('ALTA', 'CRITICA')
        )::bigint AS alertas_criticas
      FROM trida.alertas_fraude a
      JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
      WHERE a.id_usuario = $1
        AND ($2::int IS NULL OR t.id_cuenta = $2 OR t.id_cuenta_destino = $2)
      `,
      userId,
      accountId ?? null,
      ),
    ]);

    const saldoTotal = Number(saldoRows[0]?.saldo_total ?? 0);
    const resumenPeriodo = resumenPeriodoRows[0] ?? {
      ingresos: 0,
      gastos: 0,
      ahorros: 0,
    };
    const rAlertas = alertasRows[0] ?? {
      alertas_activas: 0,
      alertas_criticas: 0,
    };

    const ingresos = resumenPeriodo.ingresos;
    const gastos = resumenPeriodo.gastos;

    return {
      saldo_total: saldoTotal,
      periodo: {
        dias: periodoDias,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        ingresos: Number(ingresos),
        gastos: Number(gastos),
        ahorros: Number(resumenPeriodo.ahorros),
        balance_neto: calculateNetBalance(
          ingresos,
          gastos,
          resumenPeriodo.ahorros,
        ).toNumber(),
      },
      alertas: {
        activas: Number(rAlertas.alertas_activas),
        criticas: Number(rAlertas.alertas_criticas),
      },
    };
  },

  async getRecentAlerts(userId: number, limit = 5, accountId?: number) {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await queryRaw<
      Array<{
        id_alerta: number;
        id_transaccion: number;
        severidad: string;
        fecha_detectada: Date;
        motivo: string;
        accion_usuario: string | null;
        estado: string;
        monto: string | number;
        comercio: string | null;
        estado_transaccion: string;
      }>
    >(
      `
      SELECT
        a.id_alerta,
        a.id_transaccion,
        a.severidad,
        a.fecha_detectada,
        a.motivo,
        a.accion_usuario,
        a.estado,
        t.monto,
        t.comercio,
        t.estado AS estado_transaccion
      FROM trida.alertas_fraude a
      JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
      WHERE a.id_usuario = $1
        AND ($3::int IS NULL OR t.id_cuenta = $3 OR t.id_cuenta_destino = $3)
      ORDER BY a.fecha_detectada DESC
      LIMIT $2
      `,
      userId,
      safeLimit,
      accountId ?? null,
    );

    return rows.map((r) => ({
      id_alerta: Number(r.id_alerta),
      id_transaccion: Number(r.id_transaccion),
      severidad: r.severidad,
      fecha_detectada: r.fecha_detectada,
      motivo: r.motivo,
      accion_usuario: r.accion_usuario ?? null,
      estado: r.estado,
      monto: Number(r.monto),
      comercio: r.comercio ?? null,
      estado_transaccion: r.estado_transaccion,
    }));
  },

  async getRecentTransactions(userId: number, limit = 5, accountId?: number) {
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await queryRaw<
      Array<{
        id_transaccion: number;
        monto: string | number;
        tipo_movimiento: string;
        fecha_transaccion: Date;
        comercio: string | null;
        estado: string;
        score_anomalia: string | number | null;
        severidad_alerta: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" | null;
        nombre_categoria: string | null;
        categoria_icono: string | null;
        categoria_color: string | null;
      }>
    >(
      `
      SELECT
        t.id_transaccion,
        t.monto,
        t.tipo_movimiento,
        t.fecha_transaccion,
        t.comercio,
        t.estado,
        t.score_anomalia,
        a.severidad AS severidad_alerta,
        cat.nombre AS nombre_categoria,
        cat.icono AS categoria_icono,
        cat.color AS categoria_color
      FROM trida.transacciones t
      LEFT JOIN trida.categorias cat ON cat.id_categoria = t.id_categoria
      LEFT JOIN LATERAL (
        SELECT a.severidad
        FROM trida.alertas_fraude a
        WHERE a.id_transaccion = t.id_transaccion
        ORDER BY
          CASE a.severidad
            WHEN 'CRITICA' THEN 4
            WHEN 'ALTA' THEN 3
            WHEN 'MEDIA' THEN 2
            WHEN 'BAJA' THEN 1
            ELSE 0
          END DESC,
          a.fecha_detectada DESC
        LIMIT 1
      ) a ON TRUE
      WHERE t.id_usuario = $1
        AND ($3::int IS NULL OR t.id_cuenta = $3 OR t.id_cuenta_destino = $3)
      ORDER BY t.fecha_transaccion DESC
      LIMIT $2
      `,
      userId,
      safeLimit,
      accountId ?? null,
    );

    return rows.map((r) => ({
      id_transaccion: Number(r.id_transaccion),
      monto: Number(r.monto),
      tipo_movimiento: r.tipo_movimiento,
      fecha_transaccion: r.fecha_transaccion,
      comercio: r.comercio ?? null,
      estado: r.estado,
      score_anomalia: r.score_anomalia !== null ? Number(r.score_anomalia) : 0,
      nivel_riesgo: getUnifiedRiskLevel(
        r.score_anomalia !== null ? Number(r.score_anomalia) : 0,
        r.severidad_alerta,
      ),
      categoria: {
        nombre: r.nombre_categoria ?? "Sin categoría",
        icono: r.categoria_icono ?? null,
        color: r.categoria_color ?? null,
      },
    }));
  },

  async getRecentAdvice(userId: number, limit = 5, accountId?: number) {
    void accountId;
    const safeLimit = Math.max(1, Math.min(limit, 50));
    const rows = await prisma.consejo_financiero.findMany({
      where: {
        id_usuario: userId,
        leido: false,
        tipo: "GASTO",
      },
      orderBy: { fecha_generado: "desc" },
      take: safeLimit,
      select: {
        id_consejo: true,
        tipo: true,
        titulo: true,
        descripcion: true,
        prioridad: true,
        fecha_generado: true,
      },
    });

    return rows;
  },

  async markAdviceRead(userId: number, adviceId: number) {
    await prisma.consejo_financiero.updateMany({
      where: {
        id_consejo: adviceId,
        id_usuario: userId,
        leido: false,
      },
      data: { leido: true },
    });

    const advice = await prisma.consejo_financiero.findFirst({
      where: { id_consejo: adviceId, id_usuario: userId },
      select: { id_consejo: true, leido: true, fecha_leido: true },
    });

    if (!advice) {
      throw new AppError("Consejo financiero no encontrado", 404, "DASHBOARD_ADVICE_NOT_FOUND");
    }

    return advice;
  },
};
