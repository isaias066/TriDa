import { Prisma } from "@prisma/client";
import { haversineDistance } from "../../utils/geo.js";
import { getRiskLevel } from "../../utils/risk.js";

export interface EvaluateRiskInput {
  id_usuario: number;
  monto: number;
  tipo_movimiento: "INGRESO" | "GASTO" | "AHORRO" | "TRANSFERENCIA";
  ubicacion_lat?: number;
  ubicacion_lon?: number;
  id_dispositivo?: number;
  comercio?: string;
  canal?: string;
  fecha_transaccion: Date;
}

export interface RiskEvaluationResult {
  score_riesgo: number;
  nivel_riesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  estado_evaluacion: "APROBADA" | "REVISAR";
  razones: string[];
  id_dispositivo_validado: number | null;
}

export const MIN_GEO_DISTANCE_KM = 100;
export const MIN_HISTORICAL_TRANSACTIONS_FOR_AVERAGE = 10;
const BURST_WINDOW_MINUTES = 10;
const IA_SERVICE_URL = process.env.IA_SERVICE_URL || "http://127.0.0.1:5000";

export function getGeoRiskPenalty(distanceKm: number, speedKmH: number) {
  if (distanceKm <= MIN_GEO_DISTANCE_KM) return null;

  if (speedKmH > 800) {
    return {
      score: 50,
      reason: `Velocidad de desplazamiento imposible: ${Math.round(speedKmH)} km/h (${distanceKm.toFixed(1)} km)`,
    };
  }

  if (speedKmH > 200) {
    return {
      score: 30,
      reason: `Desplazamiento inusualmente rápido: ${Math.round(speedKmH)} km/h`,
    };
  }

  return null;
}

export class RiskService {
  async evaluateRisk(
    input: EvaluateRiskInput,
    transaction: Prisma.TransactionClient,
  ): Promise<RiskEvaluationResult> {
    const razonesFallback: string[] = [];
    let fallbackScore = 0;
    let id_dispositivo_validado: number | null = null;

    // Factor 1: Promedio histórico (últimos 90 días)
    const stats = await transaction.transaccion.aggregate({
      where: {
        id_usuario: input.id_usuario,
        tipo_movimiento: input.tipo_movimiento,
        estado: { in: ["CONFIRMADA", "APROBADA"] },
        fecha_transaccion: {
          gte: new Date(input.fecha_transaccion.getTime() - 90 * 24 * 60 * 60 * 1000),
          lt: input.fecha_transaccion,
        },
      },
      _avg: { monto: true },
      _count: { id_transaccion: true },
    });

    const avgMonto = Number(stats._avg.monto ?? 0);
    const countTx = stats._count.id_transaccion;
    const ratioMontoPromedio = avgMonto > 0 ? input.monto / avgMonto : 1.0;

    if (countTx >= MIN_HISTORICAL_TRANSACTIONS_FOR_AVERAGE && avgMonto > 0) {
      if (ratioMontoPromedio > 5) {
        fallbackScore += 40;
        razonesFallback.push(
          `Monto (${input.monto.toFixed(2)}) excede 5 veces el promedio del usuario (${avgMonto.toFixed(2)})`,
        );
      } else if (ratioMontoPromedio > 3) {
        fallbackScore += 25;
        razonesFallback.push(
          `Monto (${input.monto.toFixed(2)}) excede 3 veces el promedio del usuario (${avgMonto.toFixed(2)})`,
        );
      }
    }

    // Factor 6: Ráfaga de movimientos en 10 minutos
    let txUltimos10Min = 0;
    if (input.tipo_movimiento === "GASTO") {
      txUltimos10Min = await transaction.transaccion.count({
        where: {
          id_usuario: input.id_usuario,
          tipo_movimiento: "GASTO",
          estado: { in: ["PENDIENTE", "CONFIRMADA", "APROBADA"] },
          fecha_transaccion: {
            gte: new Date(input.fecha_transaccion.getTime() - BURST_WINDOW_MINUTES * 60 * 1000),
            lt: input.fecha_transaccion,
          },
        },
      });

      if (txUltimos10Min >= 2) {
        fallbackScore += 30;
        razonesFallback.push(
          `Ráfaga de gastos: 3 o más movimientos en ${BURST_WINDOW_MINUTES} minutos`,
        );
      }
    }

    // Factor 5: Dispositivo confiable
    let dispositivoConfiable = 1;
    if (input.id_dispositivo) {
      const dispositivo = await transaction.dispositivo.findFirst({
        where: { id_dispositivo: input.id_dispositivo, id_usuario: input.id_usuario },
      });

      if (!dispositivo) {
        dispositivoConfiable = 0;
        fallbackScore += 20;
        razonesFallback.push("Dispositivo no registrado previamente para este usuario");
      } else {
        id_dispositivo_validado = dispositivo.id_dispositivo;
        if (dispositivo.confiable === false) {
          dispositivoConfiable = 0;
          fallbackScore += 30;
          razonesFallback.push("Dispositivo marcado como no confiable");
        }
      }
    }

    // Factor 3: Ubicación / Velocidad geográfica (Haversine)
    let speedKmH = 0;
    if (input.ubicacion_lat !== undefined && input.ubicacion_lon !== undefined) {
      const lastTx = await transaction.transaccion.findFirst({
        where: {
          id_usuario: input.id_usuario,
          estado: { in: ["CONFIRMADA", "APROBADA"] },
          id_ubicacion: { not: null },
          fecha_transaccion: { lt: input.fecha_transaccion },
        },
        include: {
          ubicacion: { select: { latitud: true, longitud: true } },
        },
        orderBy: { fecha_transaccion: "desc" },
      });

      const lastLat = lastTx?.ubicacion?.latitud;
      const lastLon = lastTx?.ubicacion?.longitud;
      if (lastTx && lastLat !== null && lastLat !== undefined && lastLon !== null && lastLon !== undefined) {
        const distanceKm = haversineDistance(
          Number(lastLat),
          Number(lastLon),
          input.ubicacion_lat,
          input.ubicacion_lon,
        );
        const timeDiffHours =
          Math.abs(input.fecha_transaccion.getTime() - new Date(lastTx.fecha_transaccion).getTime()) / 3600000;

        if (timeDiffHours > 0) {
          speedKmH = distanceKm / timeDiffHours;
          const geoPenalty = getGeoRiskPenalty(distanceKm, speedKmH);
          if (geoPenalty) {
            fallbackScore += geoPenalty.score;
            razonesFallback.push(`${geoPenalty.reason} (${timeDiffHours.toFixed(2)}h)`);
          }
        }
      }
    }

    // Factor 4: Comercio frecuente
    let comercioNuevo = 0;
    if (input.comercio) {
      const prevComercio = await transaction.transaccion.findFirst({
        where: {
          id_usuario: input.id_usuario,
          comercio: input.comercio,
          estado: { in: ["CONFIRMADA", "APROBADA"] },
        },
        select: { id_transaccion: true },
      });
      comercioNuevo = prevComercio ? 0 : 1;
    }

    // Factor 2 y 7: Hora local en Bogotá y canal
    const bogotaHour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        hour: "numeric",
        hour12: false,
      }).format(input.fecha_transaccion),
    ) % 24;
    const dayOfWeek = input.fecha_transaccion.getUTCDay();
    const esFinDeSemana = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

    // Consultar microservicio Random Forest local (timeout 800ms para cero latencia perceptible)
    try {
      const response = await fetch(`${IA_SERVICE_URL}/api/ia/evaluar-riesgo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(800),
        body: JSON.stringify({
          monto: input.monto,
          ratio_monto_promedio: ratioMontoPromedio,
          hora: bogotaHour,
          es_fin_de_semana: esFinDeSemana,
          velocidad_kmh: speedKmH,
          comercio_nuevo: comercioNuevo,
          dispositivo_confiable: dispositivoConfiable,
          tx_ultimos_10_min: txUltimos10Min,
          tipo_movimiento: input.tipo_movimiento,
          canal: input.canal ?? "web",
        }),
      });

      if (response.ok) {
        const iaResult = (await response.json()) as {
          score_riesgo: number;
          nivel_riesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
          estado_evaluacion: "APROBADA" | "REVISAR";
          razones: string[];
        };

        return {
          score_riesgo: iaResult.score_riesgo,
          nivel_riesgo: iaResult.nivel_riesgo,
          estado_evaluacion: iaResult.estado_evaluacion,
          razones: iaResult.razones.length > 0 ? iaResult.razones : razonesFallback,
          id_dispositivo_validado,
        };
      }
    } catch {
      // Si el servicio Python está apagado, continúa con el respaldo heurístico local
    }

    const finalScore = Math.min(fallbackScore, 100);
    const nivel_riesgo = getRiskLevel(finalScore);
    const estado_evaluacion =
      nivel_riesgo === "CRITICO"
        ? "REVISAR"
        : nivel_riesgo === "BAJO"
          ? "APROBADA"
          : "REVISAR";

    return {
      score_riesgo: finalScore,
      nivel_riesgo,
      estado_evaluacion,
      razones: razonesFallback,
      id_dispositivo_validado,
    };
  }
}

export const riskService = new RiskService();
