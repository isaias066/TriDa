// ¿Qué? Servicio de métricas y agregaciones analíticas.
// ¿Para qué? Calcular KPIs y desgloses por tipo, ciudad, canal y banco.
// ¿Impacto? Soporta la página de Analítica del dashboard.
import { prisma } from '../../db/prisma.js';
export const analyticsService = {
    async getMetrics(bancoCodigo) {
        const rows = await prisma.$queryRaw `
      SELECT * FROM trida.fn_analytics_metricas(${bancoCodigo ?? null})
    `;
        return rows[0] ?? null;
    },
    async getAggregations(bancoCodigo) {
        const banco = bancoCodigo ?? null;
        const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
            prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_tipo(${banco})`,
            prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_ciudad(${banco})`,
            prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_canal(${banco})`,
            prisma.$queryRaw `SELECT * FROM trida.fn_analytics_por_banco_fraude(${banco})`,
        ]);
        return {
            porTipo,
            porCiudad,
            porCanal,
            porBanco,
        };
    },
};
//# sourceMappingURL=analytics.service.js.map