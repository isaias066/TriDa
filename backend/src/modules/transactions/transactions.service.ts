// ¿Qué? Servicio de consulta y procesamiento de transacciones.
// ¿Para qué? Registrar transacciones, consultar el modelo IA y generar alertas.
// ¿Impacto? Conecta PostgreSQL + Backend + Random Forest de TriDa.
//           Soporta paginación honesta de 3 parámetros (Día 4).

import { prisma } from "../../db/prisma.js";
import { config } from "../../config.js";

interface ResultadoIA {
  fraude: boolean;
  score_riesgo: number;
  nivel_riesgo: "BAJO" | "MEDIO" | "ALTO";
}

async function consultarIA(data: any): Promise<ResultadoIA> {
  const ahora = new Date();
  const diaSemana = ahora.getDay();
  const hora = ahora.getHours();

  const response = await fetch(`${config.IA_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      monto: Number(data.monto),
      tipo_transaccion: data.tipo_transaccion,
      hora: hora,
      dia_semana: diaSemana,
      es_fin_de_semana: [0, 6].includes(diaSemana) ? 1 : 0,
      es_madrugada: hora >= 23 || hora < 6 ? 1 : 0,
      tiempo_de_procesamiento: data.tiempo_de_procesamiento ?? 2,
      moneda: data.moneda,
      canal: data.canal,
    }),
  });

  if (!response.ok) {
    throw new Error(`La IA respondió con HTTP ${response.status}`);
  }

  return (await response.json()) as ResultadoIA;
}

export const transactionsService = {
  // ── LISTADO PAGINADO (Día 4 — Paginación honesta) ──────────────────────────
  async list(
    bancoCodigo: string | null = null,
    limit: number = 500,
    offset: number = 0,
  ) {
    // 1. Obtener los registros paginados de la BD
    const items = await prisma.$queryRaw<any[]>`
      SELECT * FROM trida.fn_transacciones(
        ${bancoCodigo}::text,
        ${limit}::integer,
        ${offset}::integer
      )
    `;

    // 2. Obtener el total real utilizando la función count del Día 4
    const countRows = await prisma.$queryRaw<
      { count: string | number | bigint }[]
    >`
      SELECT trida.fn_transacciones_count(${bancoCodigo}::text) as count
    `;

    const total = countRows[0]?.count ? Number(countRows[0].count) : 0;
    const hasMore = offset + items.length < total;

    // 3. Retornar el contrato completo de paginación
    return {
      items,
      total,
      limit,
      offset,
      hasMore,
    };
  },

  // ── CREAR TRANSACCIÓN ──────────────────────────────────────────────────────
  async create(data: any) {
    // 1. Consultar el modelo Random Forest de TriDa
    const resultadoIA = await consultarIA(data);

    const score = Number(resultadoIA.score_riesgo);
    const fraude = Boolean(resultadoIA.fraude);

    // 2. Determinar estado y nivel según el score de la IA
    let estadoTransaccion: "APROBADA" | "ALERTADA" | "BLOQUEADA";
    let nivel: "BAJA" | "MEDIA" | "ALTA" | "CRITICA";

    if (score >= 95) {
      estadoTransaccion = "BLOQUEADA";
      nivel = "CRITICA";
    } else if (score >= 80) {
      estadoTransaccion = "ALERTADA";
      nivel = "ALTA";
    } else if (score >= 50) {
      estadoTransaccion = "ALERTADA";
      nivel = "MEDIA";
    } else if (score >= 30) {
      estadoTransaccion = "ALERTADA";
      nivel = "BAJA";
    } else {
      estadoTransaccion = "APROBADA";
      nivel = "BAJA";
    }

    // 3. Guardar la transacción en PostgreSQL
    const nuevaTx = await prisma.transaccion.create({
      data: {
        id_cliente: data.id_cliente,
        id_dispositivo: data.id_dispositivo,
        id_ubicacion: data.id_ubicacion,
        id_banco: data.id_banco,
        tipo_transaccion: data.tipo_transaccion,
        monto: data.monto,
        cuenta_origen: data.cuenta_origen,
        cuenta_destino: data.cuenta_destino,

        // Resultado del Random Forest
        score_riesgo: score,
        estado_transaccion: estadoTransaccion,
        canal: data.canal,
        moneda: data.moneda,
      },
    });

    // 4. Generar alerta cuando el score sea >= 30
    let alertaGenerada = null;

    if (score >= 30) {
      alertaGenerada = await prisma.alerta.create({
        data: {
          id_transaccion: nuevaTx.id_transaccion,
          nivel_criticidad: nivel,
          factores_sospechosos: fraude
            ? "Detectado por modelo Random Forest"
            : "Riesgo detectado por modelo Random Forest",
          estado_alerta: "ACTIVA",
          prioridad: score >= 80 ? 10 : 5,
        },
      });
    }

    // 5. Devolver resultado completo
    return {
      transaccion: nuevaTx,
      evaluacionRiesgo: {
        score,
        fraude,
        nivel,
        estadoTransaccion,
        nivelRiesgoIA: resultadoIA.nivel_riesgo,
      },
      alerta: alertaGenerada,
    };
  },
};
