// ¿Qué? Servicio de clientes bancarios.
// ¿Para qué? Listar clientes (con o sin detalle de banco).
// ¿Impacto? Reemplaza la ruta mal nombrada /tareas por /customers.

import { prisma } from '../../db/prisma.js';

export const customersService = {
  async list(bancoCodigo?: string | null) {
    // fn_usuarios ya trae cliente + banco; si no hay filtro usa todos
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_usuarios(${bancoCodigo ?? null})
    `;
  },

  async listRaw() {
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_clientes()
    `;
  },
};