// ¿Qué? Servicio del dashboard con parseo inteligente del filtro de banco y estado en vivo.
// ¿Para qué? Convertir 'all' a NULL, enviar tipos estrictos a SQL y verificar conexión con la API externa.
// ¿Impacto? El Dashboard muestra TPS y latencia reales solo cuando hay flujo activo.

import { prisma } from "../../db/prisma.js";
import { config } from "../../config.js";

function parseBancoCode(banco?: string | null): string | null {
  if (!banco) return null;
  const clean = banco.trim().toLowerCase();
  if (
    clean === "all" ||
    clean === "todos" ||
    clean === "sin_asignar_todos" ||
    clean === ""
  ) {
    return null;
  }
  return banco;
}

export const dashboardService = {
  async getStats(bancoCodigo?: string | null) {
    const code = parseBancoCode(bancoCodigo);
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_dashboard_stats(${code}::VARCHAR)
    `;
    return rows[0] ?? null;
  },

  async getRecentAlerts(bancoCodigo?: string | null, limit: number = 15) {
    const code = parseBancoCode(bancoCodigo);
    return prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_alertas_recientes(
        ${code}::VARCHAR,
        ${limit}::INTEGER
      )
    `;
  },

  async getLiveStatus(bancoCodigo?: string | null) {
    const code = parseBancoCode(bancoCodigo);
    const windowSeconds = parseInt(config.LIVE_WINDOW_SECONDS, 10) || 30;

    // ── Capa 1: Actividad reciente en BD ──
    const [tpsRows, activityRows] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT * FROM trida.fn_dashboard_tps(${code}::VARCHAR)
      `,
      prisma.$queryRaw<any[]>`
        SELECT
          EXTRACT(EPOCH FROM (NOW() - MAX(fecha_transaccion)))::INTEGER AS seconds_since_last_tx
        FROM trida.transacciones t
        JOIN trida.bancos b ON b.id_banco = t.id_banco
        WHERE ${code}::VARCHAR IS NULL OR b.codigo = ${code}::VARCHAR
      `,
    ]);

    const tpsData = tpsRows[0] ?? {
      tps: 0,
      tiempo_promedio_ms: 0,
      transacciones_ultimo_m: 0,
    };
    const secondsSinceLastTx = Number(
      activityRows[0]?.seconds_since_last_tx ?? 9999,
    );
    const hasRecentActivity = secondsSinceLastTx <= windowSeconds;

    // ── Capa 2: Healthcheck al Simulador / API Externa ──
    let simulatorOnline = false;
    let simulatorStreaming = false;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${config.SIMULATOR_API_URL}/api/status`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (response.ok) {
        // Casteo explícito del contrato del simulador para evitar TS7006/TS2339
        const data = (await response.json()) as {
          success: boolean;
          status?: { isStreaming?: boolean };
        };
        simulatorOnline = true;
        simulatorStreaming = data?.status?.isStreaming === true;
      }
    } catch {
      simulatorOnline = false;
      simulatorStreaming = false;
    }

    // ── Determinar estado final ──
    // Corregido: Es LIVE si el simulador está inyectando activamente (aunque sean TX históricas)
    // O si hay actividad real reciente en la base de datos.
    let status: "LIVE" | "STANDBY" | "OFFLINE";

    if (simulatorStreaming || hasRecentActivity) {
      status = "LIVE";
    } else if (simulatorOnline) {
      status = "STANDBY";
    } else {
      status = "OFFLINE";
    }

    return {
      status,
      isLive: status === "LIVE",
      tps: status === "LIVE" ? Number(tpsData.tps ?? 0) : 0,
      latencyMs:
        status === "LIVE" ? Number(tpsData.tiempo_promedio_ms ?? 0) : 0,
      transactionsLastMinute: Number(tpsData.transacciones_ultimo_m ?? 0),
      simulator: {
        online: simulatorOnline,
        streaming: simulatorStreaming,
      },
      lastActivitySecondsAgo: secondsSinceLastTx,
    };
  },
};
