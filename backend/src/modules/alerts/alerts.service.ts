// ¿Qué? Servicio de alertas con paginación, filtros, sort y conteos por nivel.
// ¿Para qué? Paridad con transacciones; badges fijos y filtros SQL reales.
// ¿Impacto? Centro de Alertas deja de truncar y de filtrar solo en memoria.

import { prisma } from "../../db/prisma.js";

export interface FiltrosAlertas {
  level?: string;
  status?: string;
  search?: string;
}

export interface SortAlertas {
  field?: string;
  direction?: "asc" | "desc";
}

function mapNivel(level: string): string | null {
  const l = level.toLowerCase().trim();
  const map: Record<string, string> = {
    low: "BAJA",
    baja: "BAJA",
    medium: "MEDIA",
    media: "MEDIA",
    high: "ALTA",
    alta: "ALTA",
    critical: "CRITICA",
    critica: "CRITICA",
    crítica: "CRITICA",
  };
  return map[l] ?? null;
}

/** Chip "Estado" de AlertsPage: blocked/flagged = estado de la TX */
function mapEstadoTransaccion(status: string): string | null {
  const s = status.toLowerCase().trim();
  const map: Record<string, string> = {
    blocked: "BLOQUEADA",
    bloqueada: "BLOQUEADA",
    bloqueadas: "BLOQUEADA",
    flagged: "ALERTADA",
    alerted: "ALERTADA",
    marcada: "ALERTADA",
    marcadas: "ALERTADA",
    alertada: "ALERTADA",
    approved: "APROBADA",
    pending: "PENDIENTE",
  };
  return map[s] ?? null;
}

/** Estado del workflow de la alerta */
function mapEstadoAlerta(status: string): string | null {
  const s = status.toLowerCase().trim();
  const map: Record<string, string> = {
    active: "ACTIVA",
    activa: "ACTIVA",
    review: "EN_REVISION",
    en_revision: "EN_REVISION",
    "en-revision": "EN_REVISION",
    resolved: "RESUELTA",
    resuelta: "RESUELTA",
    dismissed: "DESCARTADA",
    descartada: "DESCARTADA",
  };
  if (s in map) return map[s];
  const up = status.toUpperCase();
  if (["ACTIVA", "EN_REVISION", "RESUELTA", "DESCARTADA"].includes(up))
    return up;
  return null;
}

function resolveOrderBy(sort?: SortAlertas): string {
  const dir = sort?.direction === "asc" ? "ASC" : "DESC";
  const field = (sort?.field ?? "timestamp").toLowerCase();

  const map: Record<string, string> = {
    id: "a.id_alerta",
    timestamp: "a.fecha_generacion",
    fecha: "a.fecha_generacion",
    user: "c.nombre_completo",
    amount: "t.monto",
    monto: "t.monto",
    riskscore: "t.score_riesgo",
    score: "t.score_riesgo",
    level: "a.nivel_criticidad",
    alertlevel: "a.nivel_criticidad",
    status: "t.estado_transaccion",
    alertstatus: "a.estado_alerta",
    priority: "a.prioridad",
    bank: "b.nombre",
    type: "t.tipo_transaccion",
    location: "u.ciudad",
    city: "u.ciudad",
  };

  const column = map[field] ?? "a.fecha_generacion";
  return `${column} ${dir} NULLS LAST, a.id_alerta DESC`;
}

function buildFilters(
  bancoCodigo: string | null,
  filtros: FiltrosAlertas,
): { whereSql: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  if (bancoCodigo) {
    params.push(bancoCodigo);
    conditions.push(`b.codigo = $${i++}`);
  }

  if (filtros.level && filtros.level !== "all") {
    const nivel = mapNivel(filtros.level);
    if (nivel) {
      params.push(nivel);
      conditions.push(`a.nivel_criticidad = $${i++}`);
    }
  }

  if (filtros.status && filtros.status !== "all") {
    const estadoTx = mapEstadoTransaccion(filtros.status);
    const estadoAlerta = mapEstadoAlerta(filtros.status);

    if (estadoTx) {
      params.push(estadoTx);
      conditions.push(`t.estado_transaccion = $${i++}`);
    } else if (estadoAlerta) {
      params.push(estadoAlerta);
      conditions.push(`a.estado_alerta = $${i++}`);
    }
  }

  if (filtros.search && filtros.search.trim() !== "") {
    params.push(`%${filtros.search.trim()}%`);
    const p = `$${i++}`;
    conditions.push(`(
      a.id_alerta::text ILIKE ${p}
      OR t.id_transaccion::text ILIKE ${p}
      OR c.nombre_completo ILIKE ${p}
      OR COALESCE(a.factores_sospechosos, '') ILIKE ${p}
      OR t.tipo_transaccion ILIKE ${p}
      OR b.nombre ILIKE ${p}
      OR u.ciudad ILIKE ${p}
    )`);
  }

  const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return { whereSql, params };
}

const SELECT_ALERTAS = `
  a.id_alerta,
  a.nivel_criticidad,
  a.fecha_generacion,
  a.factores_sospechosos,
  a.estado_alerta,
  a.prioridad,
  c.nombre_completo AS cliente,
  t.id_transaccion,
  t.monto,
  t.score_riesgo,
  t.tipo_transaccion,
  t.canal,
  t.estado_transaccion,
  b.nombre  AS banco,
  b.codigo  AS banco_codigo,
  b.color   AS banco_color,
  u.ciudad,
  d.tipo_dispositivo AS dispositivo
`;

const FROM_ALERTAS = `
  FROM trida.alertas a
  JOIN trida.transacciones t          ON t.id_transaccion = a.id_transaccion
  JOIN trida.clientes c               ON c.id_cliente     = t.id_cliente
  JOIN trida.bancos b                 ON b.id_banco       = t.id_banco
  JOIN trida.historico_de_ubicacion u ON u.id_ubicacion   = t.id_ubicacion
  JOIN trida.dispositivos d           ON d.id_dispositivo = t.id_dispositivo
`;

export const alertsService = {
  async list(
    bancoCodigo: string | null = null,
    limit = 30,
    offset = 0,
    filtros: FiltrosAlertas = {},
    sort?: SortAlertas,
  ) {
    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 2000);
    const safeOffset = Math.max(Number(offset) || 0, 0);
    const { whereSql, params } = buildFilters(bancoCodigo, filtros);
    const orderBy = resolveOrderBy(sort);
    const baseFrom = `${FROM_ALERTAS} ${whereSql}`;

    const itemsSql = `
      SELECT ${SELECT_ALERTAS}
      ${baseFrom}
      ORDER BY ${orderBy}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const countSql = `SELECT COUNT(*)::bigint AS total ${baseFrom}`;

    const [items, countRows] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(itemsSql, ...params, safeLimit, safeOffset),
      prisma.$queryRawUnsafe<{ total: string | number }[]>(countSql, ...params),
    ]);

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
      bancoSql = "AND b.codigo = $1";
    }

    const rows = await prisma.$queryRawUnsafe<
      {
        total: string | number;
        low: string | number;
        medium: string | number;
        high: string | number;
        critical: string | number;
        active: string | number;
      }[]
    >(
      `
      SELECT
        COUNT(*)::bigint AS total,
        COUNT(*) FILTER (WHERE a.nivel_criticidad = 'BAJA')::bigint AS low,
        COUNT(*) FILTER (WHERE a.nivel_criticidad = 'MEDIA')::bigint AS medium,
        COUNT(*) FILTER (WHERE a.nivel_criticidad = 'ALTA')::bigint AS high,
        COUNT(*) FILTER (WHERE a.nivel_criticidad = 'CRITICA')::bigint AS critical,
        COUNT(*) FILTER (WHERE a.estado_alerta = 'ACTIVA')::bigint AS active
      FROM trida.alertas a
      JOIN trida.transacciones t ON t.id_transaccion = a.id_transaccion
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
      active: Number(r?.active ?? 0),
    };
  },

  async updateStatus(idAlerta: number, idUsuario: number, data: any) {
    const alertaActualizada = await prisma.alerta.update({
      where: { id_alerta: idAlerta },
      data: { estado_alerta: data.estado_alerta },
    });

    let validacion = null;
    if (data.clasificacion) {
      validacion = await prisma.validacion.create({
        data: {
          id_alerta: idAlerta,
          id_usuario: idUsuario,
          clasificacion: data.clasificacion,
          comentarios: data.comentarios ?? "Sin comentarios adicionales",
          accion_tomada: `Cambiado a ${data.estado_alerta}`,
        },
      });
    }
    return { alerta: alertaActualizada, validacion };
  },
};
