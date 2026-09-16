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

    // 5. Evaluar transacción con Random Forest
const startTime = Date.now();

const riskAnalysis = await this.calculateRisk(
  data,
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
    timestamp: Date,
  ) {
    const diaSemana = timestamp.getDay();
    const hora = timestamp.getHours();

    const iaUrl = process.env.IA_URL || "http://127.0.0.1:5000";

    const response = await fetch(`${iaUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monto: Number(data.amount),
        tipo_transaccion: data.type,
        hora,
        dia_semana: diaSemana,
        es_fin_de_semana: [0, 6].includes(diaSemana) ? 1 : 0,
        es_madrugada: hora >= 23 || hora < 6 ? 1 : 0,
        tiempo_de_procesamiento: 2,
        moneda: data.currency,
        canal: data.channel,
      }),
    });

    if (!response.ok) {
      throw new Error(`La IA respondió con HTTP ${response.status}`);
    }

const resultado = (await response.json()) as {
  score_riesgo: number;
  nivel_riesgo: string;
  fraude: boolean;
};

return {
  score: Number(resultado.score_riesgo),
  reasons: [
    `RANDOM_FOREST: Nivel de riesgo ${resultado.nivel_riesgo}`,
    ...(resultado.fraude
      ? ["MODELO_IA: Posible fraude detectado"]
      : ["MODELO_IA: Comportamiento aparentemente legítimo"]),
  ],
};  }
}

