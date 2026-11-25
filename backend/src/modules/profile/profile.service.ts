import { prisma } from "../../db/prisma.js";
import { queryRaw } from "../../db/queryRaw.js";
import type { UpdateProfileInput } from "../auth/auth.schemas.js";
import { AppError } from "../../utils/AppError.js";
import { RISK_THRESHOLDS } from "../../utils/risk.js";

export class ProfileError extends AppError {
  constructor(message: string, statusCode = 400, code = "PROFILE_ERROR") {
    super(message, statusCode, code);
  }
}

const profileSelect = {
  id_usuario: true,
  nombre_completo: true,
  email: true,
  telefono: true,
  pais: true,
  ciudad: true,
  rol: true,
  estado: true,
  fecha_registro: true,
  ultimo_acceso: true,
} as const;

export class ProfileService {
  async getProfile(userId: number) {
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: profileSelect,
    });

    if (!user) {
      throw new ProfileError("Usuario no encontrado", 404);
    }

    return user;
  }

  async updateProfile(userId: number, data: UpdateProfileInput) {
    return prisma.usuario.update({
      where: { id_usuario: userId },
      data: {
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
      },
      select: profileSelect,
    });
  }

  async getBehaviorPattern(userId: number) {
    const [statsRows, categoryRows] = await Promise.all([
      queryRaw<
        Array<{
          total_transacciones: number;
          monto_promedio: number;
          monto_maximo: number;
          transacciones_sospechosas: number;
        }>
      >(
        `
          SELECT
            COUNT(*)::int AS total_transacciones,
            COALESCE(AVG(t.monto), 0)::float AS monto_promedio,
            COALESCE(MAX(t.monto), 0)::float AS monto_maximo,
            COUNT(*) FILTER (
              WHERE t.score_anomalia >= ${RISK_THRESHOLDS.HIGH}
                OR EXISTS (
                  SELECT 1
                  FROM trida.alertas_fraude a
                  WHERE a.id_transaccion = t.id_transaccion
                )
            )::int AS transacciones_sospechosas
          FROM trida.transacciones t
          WHERE t.id_usuario = $1
            AND t.estado IN ('CONFIRMADA', 'APROBADA')
        `,
        userId,
      ),
      queryRaw<Array<{ id_categoria: number; nombre: string; cantidad: number }>>(
        `
          SELECT c.id_categoria, c.nombre, COUNT(*)::int AS cantidad
          FROM trida.transacciones t
          JOIN trida.categorias c ON c.id_categoria = t.id_categoria
          WHERE t.id_usuario = $1
            AND t.estado IN ('CONFIRMADA', 'APROBADA')
          GROUP BY c.id_categoria, c.nombre
          ORDER BY cantidad DESC
          LIMIT 5
        `,
        userId,
      ),
    ]);

    const stats = statsRows[0];
    return {
      id_usuario: userId,
      total_transacciones: Number(stats?.total_transacciones ?? 0),
      monto_promedio: Number(stats?.monto_promedio ?? 0),
      monto_maximo: Number(stats?.monto_maximo ?? 0),
      transacciones_sospechosas: Number(stats?.transacciones_sospechosas ?? 0),
      categorias_frecuentes: categoryRows,
      patron_evaluado_en: new Date(),
    };
  }
}

export const profileService = new ProfileService();
