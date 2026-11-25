import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import type { ExternalTransactionInput } from "./transactions.schemas.js";

export interface TransactionArchiveCsvRow {
  id_transaccion: number;
  id_cuenta: number | null;
  nombre_cuenta: string | null;
  id_cuenta_destino: number | null;
  nombre_cuenta_destino: string | null;
  fecha_transaccion: Date;
  tipo_movimiento: string;
  monto: Prisma.Decimal;
  moneda: string;
  comercio: string | null;
  descripcion: string | null;
  canal: string;
  estado: string;
  id_categoria: number | null;
  nombre_categoria: string | null;
  score_anomalia: Prisma.Decimal | null;
  fuente_externa: string | null;
  id_evento_externo: string | null;
  alertas: Array<{
    severidad: string;
    motivo: string;
    estado: string;
    fecha_detectada: Date;
    fecha_resuelta: Date | null;
    accion_usuario: string | null;
  }>;
}

export const fingerprintExternalEvent = (data: ExternalTransactionInput): string => {
  const canonicalPayload = [
    data.id_cuenta,
    data.id_cuenta_destino ?? null,
    new Prisma.Decimal(data.monto).toFixed(2),
    data.tipo_movimiento,
    data.comercio ?? null,
    data.descripcion ?? null,
    data.fecha_transaccion ? new Date(data.fecha_transaccion).toISOString() : null,
    data.es_recurrente ?? false,
  ];

  return createHash("sha256").update(JSON.stringify(canonicalPayload)).digest("hex");
};

const escapeCsvCell = (value: string | number | null): string => {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

export const buildTransactionArchiveCsv = (transactions: TransactionArchiveCsvRow[]): string => {
  const columns = [
    "id_transaccion",
    "id_cuenta",
    "nombre_cuenta",
    "id_cuenta_destino",
    "nombre_cuenta_destino",
    "fecha_transaccion",
    "tipo_movimiento",
    "monto",
    "moneda",
    "comercio",
    "descripcion",
    "canal",
    "estado",
    "id_categoria",
    "nombre_categoria",
    "score_anomalia",
    "fuente_externa",
    "id_evento_externo",
    "alertas",
  ] as const;

  const rows = transactions.map((transaction) => {
    const values: Record<(typeof columns)[number], string | number | null> = {
      id_transaccion: transaction.id_transaccion,
      id_cuenta: transaction.id_cuenta,
      nombre_cuenta: transaction.nombre_cuenta,
      id_cuenta_destino: transaction.id_cuenta_destino,
      nombre_cuenta_destino: transaction.nombre_cuenta_destino,
      fecha_transaccion: transaction.fecha_transaccion.toISOString(),
      tipo_movimiento: transaction.tipo_movimiento,
      monto: transaction.monto.toFixed(2),
      moneda: transaction.moneda,
      comercio: transaction.comercio,
      descripcion: transaction.descripcion,
      canal: transaction.canal,
      estado: transaction.estado,
      id_categoria: transaction.id_categoria,
      nombre_categoria: transaction.nombre_categoria,
      score_anomalia: transaction.score_anomalia?.toFixed(2) ?? null,
      fuente_externa: transaction.fuente_externa,
      id_evento_externo: transaction.id_evento_externo,
      alertas: JSON.stringify(
        transaction.alertas.map((alert) => ({
          severidad: alert.severidad,
          motivo: alert.motivo,
          estado: alert.estado,
          fecha_detectada: alert.fecha_detectada.toISOString(),
          fecha_resuelta: alert.fecha_resuelta?.toISOString() ?? null,
          accion_usuario: alert.accion_usuario,
        })),
      ),
    };

    return columns.map((column) => escapeCsvCell(values[column])).join(",");
  });

  return `\uFEFF${[columns.join(","), ...rows].join("\r\n")}`;
};
