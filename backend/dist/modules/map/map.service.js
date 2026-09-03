// ¿Qué? Servicio de datos geográficos para el mapa.
// ¿Para qué? Obtener estadísticas y ubicaciones de transacciones.
// ¿Impacto? Alimenta el mapa de calor / marcadores del frontend.
import { prisma } from '../../db/prisma.js';
export const mapService = {
    async getStats(bancoCodigo) {
        const rows = await prisma.$queryRaw `
      SELECT * FROM trida.fn_mapa_stats(${bancoCodigo ?? null})
    `;
        return rows[0] ?? null;
    },
    async getLocations(bancoCodigo) {
        return prisma.$queryRaw `
      SELECT * FROM trida.fn_mapa_ubicaciones(${bancoCodigo ?? null})
    `;
    },
};
//# sourceMappingURL=map.service.js.map