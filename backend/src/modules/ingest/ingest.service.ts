import { prisma } from "../../db/prisma.js";
import { TransactionIngestInput } from "./ingest.schemas.js";

export class IngestService {
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

    // 5. Motor de Riesgo Determinista de 7 Factores
    const riskAnalysis = await this.calculateRisk(
      data,
      cliente.id_cliente,
      timestamp,
    );

    // Determinar Estado de la transacción según Score
    let estado_transaccion:
      | "APROBADA"
      | "PENDIENTE"
      | "ALERTADA"
      | "BLOQUEADA" = "APROBADA";
    if (riskAnalysis.score >= 75) {
      estado_transaccion = "BLOQUEADA";
    } else if (riskAnalysis.score >= 50) {
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
        es_fraude_real: null,
        tiempo_de_procesamiento: Math.floor(Math.random() * 800) + 100,
        moneda: data.currency,
        canal: data.channel,
      },
    });

    // 7. Crear Alerta Automática si el score de riesgo es medio, alto o crítico
    let alerta = null;
    if (riskAnalysis.score >= 25) {
      let nivel_criticidad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA" = "MEDIA";
      let prioridad: number = 1;

      if (riskAnalysis.score >= 75) {
        nivel_criticidad = "CRITICA";
        prioridad = 9;
      } else if (riskAnalysis.score >= 50) {
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

    // FACTOR 1: Monto Extremo (Máx +20)
    if (data.amount >= 10000000) {
      score += 20;
      reasons.push("MONTO_EXTREMO: Superior a 10M COP");
    } else if (data.amount >= 2000000) {
      score += 10;
      reasons.push("MONTO_ELEVADO: Superior a 2M COP");
    }

    // FACTOR 2: Horario Sospechoso (Máx +15)
    const hora = timestamp.getUTCHours();
    if (hora >= 2 && hora <= 5) {
      score += 15;
      reasons.push(
        "HORARIO_SOSPECHOSO: Operación realizada en madrugada (2am-5am UTC)",
      );
    }

    // FACTOR 3: Países de Alto Riesgo o Desajuste Geográfico (Máx +20)
    const paisesRiesgo = ["NG", "KP", "SY", "RU", "VE"];
    if (paisesRiesgo.includes(data.country.toUpperCase())) {
      score += 20;
      reasons.push(`PAIS_ALTO_RIESGO: Ubicación reportada en ${data.country}`);
    } else if (data.country !== data.customer_country) {
      score += 10;
      reasons.push(
        "DESAJUSTE_GEOGRAFICO: El país de la transacción no coincide con el del cliente",
      );
    }

    // FACTOR 4: Canal Inusual (Máx +10)
    if (data.channel === "atm" && data.amount > 1000000) {
      score += 10;
      reasons.push("CANAL_RIESGOSO: Retiro ATM de alto valor");
    }

    // FACTOR 5: Dispositivo Sospechoso (Máx +15)
    if (
      data.browser.toLowerCase().includes("unknown") ||
      data.os.toLowerCase().includes("linux")
    ) {
      score += 15;
      reasons.push(
        "DISPOSITIVO_SOSPECHOSO: Agente de navegador no convencional o Linux",
      );
    }

    // FACTOR 6: Frecuencia (Ráfagas) (Máx +20)
    const haceDosMinutos = new Date(timestamp.getTime() - 2 * 60 * 1000);
    const transaccionesRecientes = await prisma.transaccion.count({
      where: {
        id_cliente,
        fecha_transaccion: {
          gte: haceDosMinutos,
        },
      },
    });

    if (transaccionesRecientes >= 3) {
      score += 20;
      reasons.push(
        `RAFAGA_DETECTADA: ${transaccionesRecientes} operaciones consecutivas en menos de 2 min`,
      );
    }

    // Asegurar límites [0, 100]
    score = Math.min(Math.max(score, 0), 100);

    return {
      score,
      reasons: reasons.length > 0 ? reasons : ["COMPORTAMIENTO_NORMAL"],
    };
  }
}
