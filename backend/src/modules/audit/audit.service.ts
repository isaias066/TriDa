import { prisma } from "../../db/prisma.js";
import type { AuditHistoryQuery } from "./audit.schemas.js";

export class AuditService {
  async getOwnHistory(userId: number, query: AuditHistoryQuery) {
    const records = await prisma.log_auditoria.findMany({
      where: {
        id_usuario: userId,
        ...(query.before_id === undefined ? {} : { id_log: { lt: query.before_id } }),
      },
      select: {
        id_log: true,
        tipo_accion: true,
        entidad_afectada: true,
        id_entidad: true,
        descripcion: true,
        fecha_accion: true,
      },
      orderBy: { id_log: "desc" },
      take: query.limit + 1,
    });

    const hasMore = records.length > query.limit;
    const items = hasMore ? records.slice(0, query.limit) : records;
    return {
      items,
      has_more: hasMore,
      next_cursor: hasMore ? (items[items.length - 1]?.id_log ?? null) : null,
    };
  }
}

export const auditService = new AuditService();
