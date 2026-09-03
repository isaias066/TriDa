// ¿Qué? Servicio de datos geográficos para el mapa.
// ¿Para qué? Obtener estadísticas y ubicaciones de transacciones.
// ¿Impacto? Alimenta el mapa de calor / marcadores del frontend.

import { prisma } from '../../db/prisma.js';

export const mapService = {
  async getStats(bancoCodigo?: string | null) {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_mapa_stats(${bancoCodigo ?? null})
    `;
    return rows[0] ?? null;
  },

  async getLocations(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_mapa_ubicaciones(${bancoCodigo ?? null})
    `;
  },
};