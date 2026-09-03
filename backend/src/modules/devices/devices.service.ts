// ¿Qué? Servicio de dispositivos de clientes.
// ¿Para qué? Listar dispositivos usados en transacciones.
// ¿Impacto? Apoya análisis de riesgo por dispositivo desconocido.

import { prisma } from '../../db/prisma.js';

export const devicesService = {
  async list(bancoCodigo?: string | null) {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_dispositivos(${bancoCodigo ?? null})
    `;
  },
};