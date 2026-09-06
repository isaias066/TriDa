// ¿Qué? Servicio de datos geográficos para el mapa.
// ¿Para qué? Obtener estadísticas, ubicaciones reales de transacciones y metadatos de conteo.
// ¿Impacto? Alimenta el mapa con límites reales y casteo de tipos explícito para PostgreSQL.

import { prisma } from "../../db/prisma.js";

export const mapService = {
  async getStats(bancoCodigo?: string | null) {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_mapa_stats(${bancoCodigo ?? null}::VARCHAR)
    `;
    return rows[0] ?? null;
  },

  async getLocations(bancoCodigo?: string | null, limit: number = 500) {
    const [items, countResult] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT * FROM trida.fn_mapa_ubicaciones(
          ${bancoCodigo ?? null}::VARCHAR, 
          ${limit}::INTEGER
        )
      `,
      prisma.$queryRaw<any[]>`
        SELECT trida.fn_mapa_ubicaciones_count(
          ${bancoCodigo ?? null}::VARCHAR
        ) AS total
      `,
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return {
      items,
      total,
      truncated: total > items.length,
    };
  },
};
