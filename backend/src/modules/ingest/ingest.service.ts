// ¿Qué? Servicio de ingesta con scoring de riesgo ajustado y generación garantizada de alertas.
// ¿Para qué? Evaluar transacciones en tiempo real e insertar siempre las alertas en trida.alertas.
// ¿Impacto? Dispara popups/toasts in-app en el Dashboard al detectar fraudes del simulador.

import { prisma } from "../../db/prisma.js";
import { TransactionIngestInput } from "./ingest.schemas.js";

export class IngestService {
  async processTransaction(data: TransactionIngestInput) {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    // 1. Resolver Banco por código
    let banco = await prisma.banco.findUnique({
      where: { codigo: data.bank_code },
    });

    if (!banco) {
      banco = await prisma.banco.findFirst({
        where: { id_banco: 1 },
      });
    }

    const id_banco = banco ? banco.id_banco : 1;

    // 2. Buscar o Crear Cliente
    let cliente = await prisma.cliente.findUnique({
      where: { email: data.customer_email },
    });
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          id_banco,
          nombre_completo: data.customer_name,
          email: data.customer_email,
          telefono: data.customer_phone,
          pais: data.customer_country,
          ciudad: data.customer_city,
          estado: true,
        },
      });
    }

    // 3. Buscar o Crear Dispositivo
    let dispositivo = await prisma.dispositivo.findUnique({
      where: { identificador_unico: data.device_fingerprint },
    });
    if (!dispositivo) {
      dispositivo = await prisma.dispositivo.create({
        data: {
          id_cliente: cliente.id_cliente,
          tipo_dispositivo: data.device_type,
          identificador_unico: data.device_fingerprint,
          sistema_operativo: data.os,
          navegador: data.browser,
          fecha_primer_uso: timestamp,
          fecha_ultimo_uso: timestamp,
        },
      });
    }

    // 4. Crear Historial de Ubicación
    const ubicacion = await prisma.historicoUbicacion.create({
      data: {
        id_dispositivo: dispositivo.id_dispositivo,
        direccion_ip: data.ip_address,
        pais: data.country,
        ciudad: data.city,
        latitud: data.latitude,
        longitud: data.longitude,
        fecha_registro: timestamp,
      },
    });

    // 5. Motor de Riesgo Calibrado
    const startTime = Date.now();
    const riskAnalysis = await this.calculateRisk(
      data,
      cliente.id_cliente,
      timestamp,
    );
    const processingTime = Date.now() - startTime;

    // Determinar Estado de la transacción según Score Real
    let estado_transaccion:
      | "APROBADA"
      | "PENDIENTE"
      | "ALERTADA"
      | "BLOQUEADA" = "APROBADA";

    if (riskAnalysis.score >= 75) {
      estado_transaccion = "BLOQUEADA";
    } else if (riskAnalysis.score >= 45) {
      estado_transaccion = "ALERTADA";
    } else if (riskAnalysis.score >= 25) {
      estado_transaccion = "PENDIENTE";
    }

    // 6. Crear Transacción
    const transaccion = await prisma.transaccion.create({
      data: {
        id_cliente: cliente.id_cliente,
        id_dispositivo: dispositivo.id_dispositivo,
        id_ubicacion: ubicacion.id_ubicacion,
        id_banco,
        tipo_transaccion: data.type,
        monto: data.amount,
        cuenta_origen: data.account_origen,
        cuenta_destino: data.account_destino,
        fecha_transaccion: timestamp,
        score_riesgo: riskAnalysis.score,
        estado_transaccion,
        es_fraude_real: riskAnalysis.score >= 75 ? true : null,
        tiempo_de_procesamiento: processingTime,
        moneda: data.currency,
        canal: data.channel,
      },
    });

    // 7. Generar Alerta Automática si el score es >= 25
    let alerta = null;
    if (riskAnalysis.score >= 25) {
      let nivel_criticidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" = "MEDIA";
      let prioridad: number = 3;

      if (riskAnalysis.score >= 75) {
        nivel_criticidad = "CRITICA";
        prioridad = 9;
      } else if (riskAnalysis.score >= 50) {
        nivel_criticidad = "ALTA";
        prioridad = 6;
      }

      alerta = await prisma.alerta.create({
        data: {
          id_transaccion: transaccion.id_transaccion,
          nivel_criticidad,
          fecha_generacion: new Date(), // Hora actual del servidor para asegurar que sea detectada por el Dashboard
          factores_sospechosos: riskAnalysis.reasons.join(" | "),
          estado_alerta: "ACTIVA",
          prioridad,
        },
      });
    }

    return {
      transaccion_id: transaccion.id_transaccion,
      score: riskAnalysis.score,
      estado_transaccion,
      alerta_generada: !!alerta,
      alerta_id: alerta?.id_alerta || null,
      nivel_criticidad: alerta?.nivel_criticidad || null,
      factores: riskAnalysis.reasons,
    };
  }

  private async calculateRisk(
    data: TransactionIngestInput,
    id_cliente: number,
    timestamp: Date,
  ) {
    let score = 0;
    const reasons: string[] = [];

    // FACTOR 1: Montos Altos y Extremos
    if (data.amount >= 10000000) {
      score += 35;
      reasons.push("MONTO_EXTREMO: Operación superior a $10M COP");
    } else if (data.amount >= 2000000) {
      score += 20;
      reasons.push("MONTO_ELEVADO: Operación superior a $2M COP");
    } else if (data.amount >= 800000) {
      score += 10;
      reasons.push("MONTO_ATIPICO: Operación superior a $800K COP");
    }

    // FACTOR 2: Horario Sospechoso (Madrugada 23:00 - 05:00 UTC/Local)
    const hora = timestamp.getHours();
    if (hora >= 23 || hora <= 5) {
      score += 20;
      reasons.push(
        `HORARIO_SOSPECHOSO: Operación en madrugada (${hora}:00 hs)`,
      );
    }

    // FACTOR 3: Operación Internacional / Desajuste Geográfico
    const countryUpper = (data.country || "").toUpperCase().trim();
    const customerCountryUpper = (data.customer_country || "CO")
      .toUpperCase()
      .trim();

    if (countryUpper !== "CO" && countryUpper !== "COLOMBIA") {
      score += 35;
      reasons.push(
        `TRANSACCION_INTERNACIONAL: Operación procesada en ${data.country}`,
      );
    } else if (countryUpper !== customerCountryUpper) {
      score += 20;
      reasons.push(
        "DESAJUSTE_GEOGRAFICO: País de origen no coincide con el cliente",
      );
    }

    // FACTOR 4: Canales Inusuales
    if (data.channel === "atm" && data.amount > 1000000) {
      score += 15;
      reasons.push("CANAL_ATM_ALTO_VALOR: Retiro en cajero superior a $1M");
    } else if (data.channel === "web" && data.amount > 3000000) {
      score += 10;
      reasons.push("CANAL_WEB_ALTO_VALOR: Transferencia web elevada");
    }

    // FACTOR 5: Ráfaga / Frecuencia de transacciones recientes
    const haceCincoMinutos = new Date(timestamp.getTime() - 5 * 60 * 1000);
    const transaccionesRecientes = await prisma.transaccion.count({
      where: {
        id_cliente,
        fecha_transaccion: {
          gte: haceCincoMinutos,
        },
      },
    });

    if (transaccionesRecientes >= 2) {
      score += 25;
      reasons.push(
        `RAFAGA_DETECTADA: ${transaccionesRecientes} operaciones en menos de 5 min`,
      );
    }

    // Garantizar rango [0, 100]
    score = Math.min(Math.max(score, 0), 100);

    return {
      score,
      reasons: reasons.length > 0 ? reasons : ["COMPORTAMIENTO_NORMAL"],
    };
  }
}
