// ¿Qué? Servicio de transacciones con mapeo de estados, niveles y ordenamiento.
// ¿Para qué? Paginación, filtros y sorting directamente en PostgreSQL (alto rendimiento).

import { prisma } from "../../db/prisma.js";
import { config } from "../../config.js";

interface ResultadoIA {
  fraude: boolean;
  score_riesgo: number;
  nivel_riesgo: "BAJO" | "MEDIO" | "ALTO";
}

export interface FiltrosTransacciones {
  status?: string;
  level?: string;
  channel?: string;
  search?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface SortTransacciones {
  field?: string;
  direction?: "asc" | "desc";
}

function sqlNivelRiesgo(level: string): string | null {
  const lvl = level.toLowerCase();
  if (lvl === "low" || lvl === "baja") return `t.score_riesgo < 25`;
  if (lvl === "medium" || lvl === "media")
    return `t.score_riesgo >= 25 AND t.score_riesgo < 50`;
  if (lvl === "high" || lvl === "alta")
    return `t.score_riesgo >= 50 AND t.score_riesgo < 75`;
  if (lvl === "critical" || lvl === "critica" || lvl === "crítica")
    return `t.score_riesgo >= 75`;
  return null;
}

function mapEstadoTransaccion(status: string): string | null {
  const s = status.toLowerCase().trim();
  const map: Record<string, string> = {
    all: "",
    todos: "",
    approved: "APROBADA",
    aprobada: "APROBADA",
    aprobadas: "APROBADA",
    blocked: "BLOQUEADA",
    bloqueada: "BLOQUEADA",
    bloqueadas: "BLOQUEADA",
    alerted: "ALERTADA",
    alertada: "ALERTADA",
    alertadas: "ALERTADA",
    marked: "ALERTADA",
    marcada: "ALERTADA",
    marcadas: "ALERTADA",
    pending: "PENDIENTE",
    pendiente: "PENDIENTE",
    pendientes: "PENDIENTE",
  };
  if (s in map) return map[s] || null;
  const up = status.toUpperCase();
  if (["PENDIENTE", "APROBADA", "ALERTADA", "BLOQUEADA"].includes(up))
    return up;
  return null;
}

function resolveOrderBy(sort?: SortTransacciones): string {
  const dir = sort?.direction === "asc" ? "ASC" : "DESC";
  const field = (sort?.field ?? "timestamp").toLowerCase();

  // Whitelist para prevenir SQL Injection en el ORDER BY
  const map: Record<string, string> = {
    id: "t.id_transaccion",
    timestamp: "t.fecha_transaccion",
    fecha: "t.fecha_transaccion",
    user: "c.nombre_completo",
    usuario: "c.nombre_completo",
    amount: "t.monto",
    monto: "t.monto",
    riskscore: "t.score_riesgo",
    risk_score: "t.score_riesgo",
    score: "t.score_riesgo",
    type: "t.tipo_transaccion",
    status: "t.estado_transaccion",
    bank: "b.nombre",
    channel: "t.canal",
    city: "u.ciudad",
    location: "u.ciudad",
  };

  const column = map[field] ?? "t.fecha_transaccion";
  return `${column} ${dir} NULLS LAST, t.id_transaccion DESC`;
}

function buildFilters(
  bancoCodigo: string | null,
  filtros: FiltrosTransacciones,
): { whereSql: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (bancoCodigo) {
    params.push(bancoCodigo);
    conditions.push(`b.codigo = $${i++}`);
  }

  if (filtros.status && filtros.status !== "all") {
    const estado = mapEstadoTransaccion(filtros.status);
    if (estado) {
      params.push(estado);
      conditions.push(`t.estado_transaccion = $${i++}`);
    }
  }

  if (filtros.level && filtros.level !== "all") {
    const nivelSql = sqlNivelRiesgo(filtros.level);
    if (nivelSql) conditions.push(nivelSql);
  }

  if (filtros.channel && filtros.channel !== "all") {
    params.push(filtros.channel.toLowerCase());
    conditions.push(`t.canal = $${i++}`);
  }

  if (filtros.amountMin !== undefined && !Number.isNaN(filtros.amountMin)) {
    params.push(filtros.amountMin);
    conditions.push(`t.monto >= $${i++}`);
  }
  if (filtros.amountMax !== undefined && !Number.isNaN(filtros.amountMax)) {
    params.push(filtros.amountMax);
    conditions.push(`t.monto <= $${i++}`);
  }

  if (filtros.search && filtros.search.trim() !== "") {
    params.push(`%${filtros.search.trim()}%`);
    const p = `$${i++}`;
    conditions.push(`(
      t.id_transaccion::text ILIKE ${p}
      OR t.cuenta_origen ILIKE ${p}
      OR t.cuenta_destino ILIKE ${p}
      OR t.tipo_transaccion ILIKE ${p}
      OR c.nombre_completo ILIKE ${p}
    )`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
}

async function consultarIA(data: any): Promise<ResultadoIA> {
  const ahora = new Date();
  const diaSemana = ahora.getDay();
  const hora = ahora.getHours();

  const response = await fetch(`${config.IA_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      monto: Number(data.monto),
      tipo_transaccion: data.tipo_transaccion,
      hora,
      dia_semana: diaSemana,
      es_fin_de_semana: [0, 6].includes(diaSemana) ? 1 : 0,
      es_madrugada: hora >= 23 || hora < 6 ? 1 : 0,
      tiempo_de_procesamiento: data.tiempo_de_procesamiento ?? 2,
      moneda: data.moneda,
      canal: data.canal,
    }),
  });

  if (!response.ok) {
    throw new Error(`La IA respondió con HTTP ${response.status}`);
  }
  return (await response.json()) as ResultadoIA;
}

export const transactionsService = {
  async list(
    bancoCodigo: string | null = null,
    limit: number = 30,
    offset: number = 0,
    filtros: FiltrosTransacciones = {},
    sort?: SortTransacciones,
  ) {
    const safeLimit = Math.max(1, Math.min(limit || 30, 2000));
    const safeOffset = Math.max(0, offset || 0);
    const { whereSql, params } = buildFilters(bancoCodigo, filtros);
    const orderBy = resolveOrderBy(sort);

    const baseFrom = `
      FROM trida.transacciones t
      JOIN trida.clientes c               ON c.id_cliente   = t.id_cliente
      JOIN trida.bancos b                 ON b.id_banco     = t.id_banco
      JOIN trida.historico_de_ubicacion u ON u.id_ubicacion = t.id_ubicacion
      ${whereSql}
    `;

    const itemsSql = `
      SELECT
        t.id_transaccion,
        t.fecha_transaccion,
        c.nombre_completo AS cliente,
        b.nombre  AS banco,
        b.codigo  AS banco_codigo,
        b.color   AS banco_color,
        t.tipo_transaccion,
        t.monto,
        t.score_riesgo,
        t.estado_transaccion,
        t.canal,
        u.ciudad,
        u.pais
      ${baseFrom}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const countSql = `SELECT COUNT(*)::bigint AS total ${baseFrom}`;

    const items = await prisma.$queryRawUnsafe<any[]>(
      itemsSql,
      ...params,
      safeLimit,
      safeOffset,
    );
    const countRows = await prisma.$queryRawUnsafe<
      { total: string | number }[]
    >(countSql, ...params);

    const total = countRows[0]?.total ? Number(countRows[0].total) : 0;

    return {
      items,
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  },

  async countsByLevel(bancoCodigo: string | null = null) {
    const params: unknown[] = [];
    let bancoSql = "";
    if (bancoCodigo) {
      params.push(bancoCodigo);
      bancoSql = `AND b.codigo = $1`;
    }

    const rows = await prisma.$queryRawUnsafe<
      {
        total: string | number;
        low: string | number;
        medium: string | number;
        high: string | number;
        critical: string | number;
      }[]
    >(
      `
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE t.score_riesgo < 25)::bigint AS low,
        COUNT(*) FILTER (WHERE t.score_riesgo >= 25 AND t.score_riesgo < 50)::bigint AS medium,
        COUNT(*) FILTER (WHERE t.score_riesgo >= 50 AND t.score_riesgo < 75)::bigint AS high,
        COUNT(*) FILTER (WHERE t.score_riesgo >= 75)::bigint AS critical
      FROM trida.transacciones t
      JOIN trida.bancos b ON b.id_banco = t.id_banco
      WHERE 1=1 ${bancoSql}
      `,
      ...params,
    );

    const r = rows[0];
    return {
      all: Number(r?.total ?? 0),
      low: Number(r?.low ?? 0),
      medium: Number(r?.medium ?? 0),
      high: Number(r?.high ?? 0),
      critical: Number(r?.critical ?? 0),
    };
  },

  async create(data: any) {
    const resultadoIA = await consultarIA(data);
    const score = Number(resultadoIA.score_riesgo);
    const fraude = Boolean(resultadoIA.fraude);

    let estadoTransaccion: "APROBADA" | "ALERTADA" | "BLOQUEADA";
    let nivel: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

    if (score >= 95) {
      estadoTransaccion = "BLOQUEADA";
      nivel = "CRITICA";
    } else if (score >= 80) {
      estadoTransaccion = "ALERTADA";
      nivel = "ALTA";
    } else if (score >= 50) {
      estadoTransaccion = "ALERTADA";
      nivel = "MEDIA";
    } else if (score >= 30) {
      estadoTransaccion = "ALERTADA";
      nivel = "BAJA";
    } else {
      estadoTransaccion = "APROBADA";
      nivel = "BAJA";
    }

    const nuevaTx = await prisma.transaccion.create({
      data: {
        id_cliente: data.id_cliente,
        id_dispositivo: data.id_dispositivo,
        id_ubicacion: data.id_ubicacion,
        id_banco: data.id_banco,
        tipo_transaccion: data.tipo_transaccion,
        monto: data.monto,
        cuenta_origen: data.cuenta_origen,
        cuenta_destino: data.cuenta_destino,
        score_riesgo: score,
        estado_transaccion: estadoTransaccion,
        canal: data.canal,
        moneda: data.moneda,
      },
    });

    let alertaGenerada = null;
    if (score >= 30) {
      alertaGenerada = await prisma.alerta.create({
        data: {
          id_transaccion: nuevaTx.id_transaccion,
          nivel_criticidad: nivel,
          factores_sospechosos: fraude
            ? "Detectado por modelo Random Forest"
            : "Riesgo detectado por modelo Random Forest",
          estado_alerta: "ACTIVA",
          prioridad: score >= 80 ? 10 : 5,
        },
      });
    }

    return {
      transaccion: nuevaTx,
      evaluacionRiesgo: {
        score,
        fraude,
        nivel,
        estadoTransaccion,
        nivelRiesgoIA: resultadoIA.nivel_riesgo,
      },
      alerta: alertaGenerada,
    };
  },
};
