// ¿Qué? Métricas y agregaciones analíticas alineadas al schema TriDa + KPIs derivados.
// ¿Para qué? Completar tasa de detección, FP%, monto protegido y fraudes por dimensión.
// ¿Impacto? AnalyticsPage deja de mostrar ceros por campos ausentes en fn_analytics_metricas.

import { prisma } from "../../db/prisma.js";

function num(v: unknown, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === "bigint" ? Number(v) : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const analyticsService = {
  async getMetrics(bancoCodigo?: string | null) {
    const banco = bancoCodigo?.trim() || null;

    const rows = await prisma.$queryRawUnsafe<
      {
        total_analizadas: string | number | bigint;
        monto_promedio: string | number;
        total_fraude: string | number | bigint;
        falsos_positivos: string | number | bigint;
        fraudes_detectados: string | number | bigint;
        bloqueadas: string | number | bigint;
        alertadas: string | number | bigint;
        monto_protegido: string | number;
        tiempo_promedio_respuesta: string | number;
        verdaderos_positivos: string | number | bigint;
      }[]
    >(
      `
      WITH base AS (
        SELECT t.*
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE $1::text IS NULL OR b.codigo = $1
      ),
      fp AS (
        SELECT COUNT(*)::bigint AS falsos_positivos
        FROM trida.validaciones v
        JOIN trida.alertas a ON a.id_alerta = v.id_alerta
        JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE v.clasificacion = 'FALSO_POSITIVO'
          AND ($1::text IS NULL OR b.codigo = $1)
      ),
      vp AS (
        SELECT COUNT(*)::bigint AS verdaderos_positivos
        FROM trida.validaciones v
        JOIN trida.alertas a ON a.id_alerta = v.id_alerta
        JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE v.clasificacion = 'FRAUDE_CONFIRMADO'
          AND ($1::text IS NULL OR b.codigo = $1)
      )
      SELECT
        (SELECT COUNT(*) FROM base)::bigint AS total_analizadas,
        COALESCE((SELECT AVG(monto) FROM base), 0) AS monto_promedio,
        (SELECT COUNT(*) FROM base WHERE estado_transaccion = 'ALERTADA')::bigint AS total_fraude,
        (SELECT COUNT(*) FROM base WHERE estado_transaccion IN ('ALERTADA', 'BLOQUEADA'))::bigint AS fraudes_detectados,
        (SELECT COUNT(*) FROM base WHERE estado_transaccion = 'BLOQUEADA')::bigint AS bloqueadas,
        (SELECT COUNT(*) FROM base WHERE estado_transaccion = 'ALERTADA')::bigint AS alertadas,
        COALESCE((
          SELECT SUM(monto) FROM base WHERE estado_transaccion = 'BLOQUEADA'
        ), 0) AS monto_protegido,
        COALESCE((SELECT AVG(tiempo_de_procesamiento) FROM base), 0) AS tiempo_promedio_respuesta,
        COALESCE((SELECT falsos_positivos FROM fp), 0)::bigint AS falsos_positivos,
        COALESCE((SELECT verdaderos_positivos FROM vp), 0)::bigint AS verdaderos_positivos
      `,
      banco,
    );

    const r = rows[0];
    if (!r) {
      return {
        total_analizadas: 0,
        monto_promedio: 0,
        total_fraude: 0,
        fraudes_detectados: 0,
        falsos_positivos: 0,
        falsos_positivos_count: 0,
        tasa_deteccion: 0,
        tasa_falsos_positivos: 0,
        monto_protegido: 0,
        tiempo_promedio_respuesta: 0,
      };
    }

    const totalAnalizadas = num(r.total_analizadas);
    const fraudesDetectados = num(r.fraudes_detectados);
    const fpCount = num(r.falsos_positivos);
    const vpCount = num(r.verdaderos_positivos);

    // Si no hay validaciones aún: aproximación operativa
    // detección = (alertadas+bloqueadas) / total
    // FP% = 0 hasta que existan validaciones
    const labeled = vpCount + fpCount;
    const tasaDeteccion =
      labeled > 0
        ? (vpCount / labeled) * 100
        : totalAnalizadas > 0
          ? (fraudesDetectados / totalAnalizadas) * 100
          : 0;

    const tasaFalsosPositivos =
      labeled > 0
        ? (fpCount / labeled) * 100
        : fraudesDetectados > 0
          ? (fpCount / fraudesDetectados) * 100
          : 0;

    return {
      total_analizadas: totalAnalizadas,
      monto_promedio: num(r.monto_promedio),
      total_fraude: num(r.total_fraude),
      fraudes_detectados: fraudesDetectados,
      falsos_positivos: tasaFalsosPositivos, // % para el FE (nombre legacy)
      falsos_positivos_count: fpCount,
      tasa_deteccion: tasaDeteccion,
      tasa_falsos_positivos: tasaFalsosPositivos,
      monto_protegido: num(r.monto_protegido),
      tiempo_promedio_respuesta: num(r.tiempo_promedio_respuesta),
      bloqueadas: num(r.bloqueadas),
      alertadas: num(r.alertadas),
    };
  },

  async getAggregations(bancoCodigo?: string | null) {
    const banco = bancoCodigo?.trim() || null;

    const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          t.tipo_transaccion AS tipo_transaccion,
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (
            WHERE t.estado_transaccion IN ('ALERTADA', 'BLOQUEADA')
               OR t.es_fraude_real IS TRUE
          )::bigint AS fraude,
          COALESCE(SUM(t.monto), 0) AS monto
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE $1::text IS NULL OR b.codigo = $1
        GROUP BY t.tipo_transaccion
        ORDER BY total DESC
        `,
        banco,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          u.ciudad AS ciudad,
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (
            WHERE t.estado_transaccion IN ('ALERTADA', 'BLOQUEADA')
               OR t.es_fraude_real IS TRUE
          )::bigint AS fraude
        FROM trida.transacciones t
        JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE $1::text IS NULL OR b.codigo = $1
        GROUP BY u.ciudad
        ORDER BY total DESC
        LIMIT 15
        `,
        banco,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          t.canal AS canal,
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (
            WHERE t.estado_transaccion IN ('ALERTADA', 'BLOQUEADA')
               OR t.es_fraude_real IS TRUE
          )::bigint AS fraude
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE $1::text IS NULL OR b.codigo = $1
        GROUP BY t.canal
        ORDER BY total DESC
        `,
        banco,
      ),
      prisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          b.nombre AS banco,
          b.codigo AS banco_codigo,
          b.color AS banco_color,
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (
            WHERE t.estado_transaccion IN ('ALERTADA', 'BLOQUEADA')
               OR t.es_fraude_real IS TRUE
          )::bigint AS total_fraude
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE $1::text IS NULL OR b.codigo = $1
        GROUP BY b.nombre, b.codigo, b.color
        ORDER BY total_fraude DESC, total DESC
        `,
        banco,
      ),
    ]);

    return { porTipo, porCiudad, porCanal, porBanco };
  },
};
