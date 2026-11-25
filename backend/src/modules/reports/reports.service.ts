// ¿Qué? Servicio de reportes financieros.
// ¿Para qué? Generar resúmenes por periodo, desglose por categoría y detalle exportable aislado por usuario (RS-001).

import {
  calculateNetBalance,
  type DecimalValue,
} from "../../utils/decimal-money.js";
import { queryRaw } from "../../db/queryRaw.js";
import { ReportQueryInput } from "./reports.schemas.js";
import { config } from "../../config.js";
import { parseDateEnd, parseDateStart, startOfMonth } from "../../utils/dateRange.js";

function resolveDateRange(query: ReportQueryInput) {
  const end = query.fecha_fin
    ? parseDateEnd(query.fecha_fin, config.APP_TIMEZONE)
    : new Date();
  const start = query.fecha_inicio
    ? parseDateStart(query.fecha_inicio, config.APP_TIMEZONE)
    : startOfMonth(end, config.APP_TIMEZONE);

  return { start, end };
}

export const reportsService = {
  async getSummary(userId: number, query: ReportQueryInput) {
    const { start, end } = resolveDateRange(query);

    const rows = await queryRaw<
      {
        ingresos: DecimalValue;
        gastos: DecimalValue;
        ahorros: DecimalValue;
        total_tx: string | number;
        aprobadas: string | number;
        alertadas: string | number;
        bloqueadas: string | number;
      }[]
    >(
      `
      SELECT
        COALESCE(SUM(CASE WHEN estado IN ('CONFIRMADA', 'APROBADA') AND tipo_movimiento = 'INGRESO' THEN monto ELSE 0 END), 0)::numeric AS ingresos,
        COALESCE(SUM(CASE WHEN estado IN ('CONFIRMADA', 'APROBADA') AND tipo_movimiento = 'GASTO' THEN monto ELSE 0 END), 0)::numeric AS gastos,
        COALESCE(SUM(CASE WHEN estado IN ('CONFIRMADA', 'APROBADA') AND tipo_movimiento = 'AHORRO' THEN monto ELSE 0 END), 0)::numeric AS ahorros,
        COUNT(*)::bigint AS total_tx,
        COUNT(*) FILTER (WHERE estado IN ('CONFIRMADA', 'APROBADA'))::bigint AS aprobadas,
        COUNT(*) FILTER (
          WHERE estado = 'SOSPECHOSA'
            OR EXISTS (
              SELECT 1
              FROM trida.alertas_fraude a
              WHERE a.id_transaccion = transacciones.id_transaccion
            )
        )::bigint AS alertadas,
        COUNT(*) FILTER (WHERE estado = 'RECHAZADA')::bigint AS bloqueadas
      FROM trida.transacciones
      WHERE id_usuario = $1
        AND fecha_transaccion >= $2
        AND fecha_transaccion <= $3
        AND ($4::int IS NULL OR id_cuenta = $4 OR id_cuenta_destino = $4)
      `,
      userId,
      start,
      end,
      query.id_cuenta ?? null,
    );

    const r = rows[0] ?? {
      ingresos: 0,
      gastos: 0,
      ahorros: 0,
      total_tx: 0,
      aprobadas: 0,
      alertadas: 0,
      bloqueadas: 0,
    };

    const ingresos = r.ingresos;
    const gastos = r.gastos;
    const ahorros = r.ahorros;

    return {
      periodo: {
        fecha_inicio: start,
        fecha_fin: end,
      },
      totales: {
        ingresos: Number(ingresos),
        gastos: Number(gastos),
        ahorros: Number(ahorros),
        balance: calculateNetBalance(ingresos, gastos, ahorros).toNumber(),
      },
      transacciones: {
        total: Number(r.total_tx),
        aprobadas: Number(r.aprobadas),
        alertadas: Number(r.alertadas),
        bloqueadas: Number(r.bloqueadas),
      },
    };
  },

  async getByCategory(userId: number, query: ReportQueryInput) {
    const { start, end } = resolveDateRange(query);
    const tipo = query.tipo_movimiento ?? "GASTO";
    if (tipo === "TRANSFERENCIA") {
      return {
        periodo: { fecha_inicio: start, fecha_fin: end },
        tipo_movimiento: tipo,
        categorias: [],
      };
    }

    const rows = await queryRaw<
      Array<{
        id_categoria: number | null;
        nombre: string;
        icono: string | null;
        color: string | null;
        total: string | number;
        cantidad: bigint | number;
      }>
      >(
      `
      SELECT
        c.id_categoria,
        COALESCE(c.nombre, 'Sin categoría') AS nombre,
        c.icono,
        c.color,
        COALESCE(SUM(t.monto), 0)::numeric AS total,
        COUNT(*)::bigint AS cantidad
      FROM trida.transacciones t
      LEFT JOIN trida.categorias c ON c.id_categoria = t.id_categoria
      WHERE t.id_usuario = $1
        AND t.tipo_movimiento = $2
        AND t.fecha_transaccion >= $3
        AND t.fecha_transaccion <= $4
        AND t.estado IN ('CONFIRMADA', 'APROBADA')
        AND ($5::int IS NULL OR t.id_cuenta = $5 OR t.id_cuenta_destino = $5)
      GROUP BY c.id_categoria, c.nombre, c.icono, c.color
      ORDER BY total DESC
      `,
      userId,
      tipo,
      start,
      end,
      query.id_cuenta ?? null,
    );

    return {
      periodo: { fecha_inicio: start, fecha_fin: end },
      tipo_movimiento: tipo,
      categorias: rows.map((r) => ({
        id_categoria: r.id_categoria === null ? null : Number(r.id_categoria),
        nombre: r.nombre,
        icono: r.icono ?? null,
        color: r.color ?? null,
        total: Number(r.total),
        cantidad: Number(r.cantidad),
      })),
    };
  },

  async getTransactionsReport(userId: number, query: ReportQueryInput) {
    const { start, end } = resolveDateRange(query);
    const safeLimit = query.limit ?? 500;

    const conditions = [
      "t.id_usuario = $1",
      "t.fecha_transaccion >= $2",
      "t.fecha_transaccion <= $3",
      "t.estado IN ('CONFIRMADA', 'APROBADA')",
      "($4::int IS NULL OR t.id_cuenta = $4 OR t.id_cuenta_destino = $4)",
    ];
    const params: unknown[] = [userId, start, end, query.id_cuenta ?? null];
    let i = 5;

    if (query.tipo_movimiento) {
      params.push(query.tipo_movimiento);
      conditions.push(`t.tipo_movimiento = $${i++}`);
    }

    const [rows, countRows, merchantRows] = await Promise.all([
      queryRaw<
      Array<{
        id_transaccion: number;
        fecha_transaccion: Date;
        tipo_movimiento: string;
        monto: string | number;
        comercio: string | null;
        descripcion: string | null;
        estado: string;
        score_anomalia: string | number | null;
        ciudad: string | null;
        nombre_cuenta: string | null;
        nombre_cuenta_destino: string | null;
        nombre_categoria: string | null;
      }>
    >(
      `
      SELECT
        t.id_transaccion,
        t.fecha_transaccion,
        t.tipo_movimiento,
        t.monto,
        t.comercio,
        t.descripcion,
        t.estado,
        t.score_anomalia,
        u.ciudad,
        ct.nombre AS nombre_cuenta,
        cd.nombre AS nombre_cuenta_destino,
        cat.nombre AS nombre_categoria
      FROM trida.transacciones t
      LEFT JOIN trida.cuentas ct ON ct.id_cuenta = t.id_cuenta
      LEFT JOIN trida.cuentas cd ON cd.id_cuenta = t.id_cuenta_destino
      LEFT JOIN trida.categorias cat ON cat.id_categoria = t.id_categoria
      LEFT JOIN trida.ubicaciones u ON u.id_ubicacion = t.id_ubicacion
      WHERE ${conditions.join(" AND ")}
      ORDER BY t.fecha_transaccion DESC
      LIMIT $${i}
      `,
      ...params,
      safeLimit,
      ),
      queryRaw<{ total: string | number }[]>(
        `
        SELECT COUNT(*)::bigint AS total
        FROM trida.transacciones t
        WHERE ${conditions.join(" AND ")}
        `,
        ...params,
      ),
      queryRaw<
        Array<{ comercio: string; total: string | number; cantidad: string | number }>
      >(
        `
        SELECT
          COALESCE(NULLIF(BTRIM(t.comercio), ''), 'Sin comercio') AS comercio,
          SUM(t.monto)::numeric AS total,
          COUNT(*)::bigint AS cantidad
        FROM trida.transacciones t
        WHERE ${conditions.join(" AND ")}
          AND t.tipo_movimiento = 'GASTO'
        GROUP BY COALESCE(NULLIF(BTRIM(t.comercio), ''), 'Sin comercio')
        ORDER BY total DESC
        LIMIT 5
        `,
        ...params,
      ),
    ]);

    const total = Number(countRows[0]?.total ?? 0);

    return {
      periodo: { fecha_inicio: start, fecha_fin: end },
      total,
      truncated: total > rows.length,
      top_comercios: merchantRows.map((row) => ({
        comercio: row.comercio,
        total: Number(row.total),
        numero_transacciones: Number(row.cantidad),
      })),
      items: rows.map((r) => ({
        id_transaccion: Number(r.id_transaccion),
        fecha_transaccion: r.fecha_transaccion,
        tipo_movimiento: r.tipo_movimiento,
        monto: Number(r.monto),
        comercio: r.comercio ?? null,
        descripcion: r.descripcion ?? null,
        estado: r.estado,
        score_anomalia: r.score_anomalia !== null ? Number(r.score_anomalia) : 0,
        ciudad: r.ciudad ?? null,
        nombre_cuenta: r.nombre_cuenta ?? null,
        nombre_cuenta_destino: r.nombre_cuenta_destino ?? null,
        nombre_categoria: r.nombre_categoria ?? null,
      })),
    };
  },
};
