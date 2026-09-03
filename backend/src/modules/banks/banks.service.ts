// ¿Qué? Servicio del catálogo de bancos.
// ¿Para qué? Listar bancos activos para filtros del frontend.
// ¿Impacto? Permite filtrar todo el sistema por entidad financiera.

import { prisma } from '../../db/prisma.js';

export const banksService = {
  async list() {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_bancos()
    `;
  },
};