import { prisma } from "../../db/prisma.js";
import { TransactionIngestInput } from "./ingest.schemas.js";
import { config } from "../../config.js";

export class IngestService {
  private async predictWithIA(
  data: TransactionIngestInput,
  timestamp: Date,
  tiempoDeProcesamiento: number,
) {
  const response = await fetch(`${config.IA_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      monto: data.amount,
      tipo_transaccion: data.type,
      hora: timestamp.getHours(),
      dia_semana: timestamp.getDay() === 0 ? 6 : timestamp.getDay() - 1,
      es_fin_de_semana: [0, 6].includes(timestamp.getDay()) ? 1 : 0,
      es_madrugada:
        timestamp.getHours() >= 0 && timestamp.getHours() < 6 ? 1 : 0,
      tiempo_de_procesamiento: tiempoDeProcesamiento,
      moneda: data.currency,
      canal: data.channel,
    }),
  });

  if (!response.ok) {
    throw new Error(`La IA respondió con HTTP ${response.status}`);
  }

  return response.json() as Promise<{
    fraude: boolean;
    score_riesgo: number;
    nivel_riesgo: string;
  }>;
}
  async processTransaction(data: TransactionIngestInput) {
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    // 1. Resolver Banco por código (asigna por defecto id 1 'sin_asignar' si no existe)
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

    // 3. Buscar o Crear Dispositivo asignado al cliente
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

// 5. Preparar datos y consultar la IA
  const tiempoDeProcesamiento =
    Math.floor(Math.random() * 800) + 100;

  const iaAnalysis = await this.predictWithIA(
    data,
    timestamp,
    tiempoDeProcesamiento,
);


        // Determinar Estado de la transacción según Score de la IA
    let estado_transaccion:
      | "APROBADA"
      | "PENDIENTE"
      | "ALERTADA"
      | "BLOQUEADA" = "APROBADA";

    if (iaAnalysis.score_riesgo >= 80) {
      estado_transaccion = "BLOQUEADA";
    } else if (iaAnalysis.score_riesgo >= 50) {
      estado_transaccion = "ALERTADA";
    } else if (iaAnalysis.score_riesgo >= 30) {
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

        // El score ahora viene directamente de la IA
        score_riesgo: iaAnalysis.score_riesgo,

        estado_transaccion,
        es_fraude_real: null,

        // Usamos el mismo tiempo enviado a la IA
        tiempo_de_procesamiento: tiempoDeProcesamiento,

        moneda: data.currency,
        canal: data.channel,
      },
    });

    // 7. Crear Alerta Automática según el score de la IA
    let alerta = null;

    if (iaAnalysis.score_riesgo >= 30) {
      let nivel_criticidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" =
        "BAJA";

      let prioridad = 1;

      if (iaAnalysis.score_riesgo >= 80) {
        nivel_criticidad = "CRITICA";
        prioridad = 9;
      } else if (iaAnalysis.score_riesgo >= 50) {
        nivel_criticidad = "ALTA";
        prioridad = 6;
      } else {
        nivel_criticidad = "MEDIA";
        prioridad = 3;
      }

      alerta = await prisma.alerta.create({
        data: {
          id_transaccion: transaccion.id_transaccion,
          nivel_criticidad,
          fecha_generacion: timestamp,

          // Por ahora la API de IA devuelve nivel_riesgo,
          // no el detalle individual de factores.
          factores_sospechosos: `IA: ${iaAnalysis.nivel_riesgo}`,

          estado_alerta: "ACTIVA",
          prioridad,
        },
      });
    }

    return {
      transaccion_id: transaccion.id_transaccion,

      // Resultado REAL de la IA
      score: iaAnalysis.score_riesgo,
      nivel_riesgo: iaAnalysis.nivel_riesgo,
      fraude: iaAnalysis.fraude,

      estado_transaccion,

      alerta_generada: !!alerta,
      alerta_id: alerta?.id_alerta || null,
      nivel_criticidad: alerta?.nivel_criticidad || null,

      factores: [`IA: ${iaAnalysis.nivel_riesgo}`],
    };
  }
}