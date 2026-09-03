// ¿Qué? Servicio de métricas y agregaciones analíticas.
// ¿Para qué? Calcular KPIs y desgloses por tipo, ciudad, canal y banco.
// ¿Impacto? Soporta la página de Analítica del dashboard.

import { prisma } from '../../db/prisma.js';

export const analyticsService = {
  async getMetrics(bancoCodigo?: string | null) {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_analytics_metricas(${bancoCodigo ?? null})
    `;
    return rows[0] ?? null;
  },

  async getAggregations(bancoCodigo?: string | null) {
    const banco = bancoCodigo ?? null;

    const [porTipo, porCiudad, porCanal, porBanco] = await Promise.all([
      prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_analytics_por_tipo(${banco})`,
      prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_analytics_por_ciudad(${banco})`,
      prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_analytics_por_canal(${banco})`,
      prisma.$queryRaw<any[]>`SELECT * FROM trida.fn_analytics_por_banco_fraude(${banco})`,
    ]);

    return {
      porTipo,
      porCiudad,
      porCanal,
      porBanco,
    };
  },
};