export type AlertSeverity = "BAJA" | "MEDIA" | "ALTA" | "CRITICA";
export type AlertStatus = "PENDIENTE" | "CONFIRMADA" | "DESCARTADA";
export type AlertUserAction = "FUI_YO" | "NO_FUI_YO" | "BLOQUEAR_TARJETA";

export interface FraudAlert {
  id_alerta: number;
  id_usuario: number;
  id_transaccion: number;
  severidad: AlertSeverity;
  motivo: string;
  estado: AlertStatus;
  fecha_detectada: string;
  fecha_resuelta?: string | null;
  accion_usuario?: AlertUserAction | null;

  // Datos extendidos devueltos por el backend
  transaccion?: {
    monto: number;
    comercio?: string | null;
    tipo_movimiento: string;
    fecha_transaccion: string;
  };
}

export interface ListAlertsQueryParams {
  id_cuenta?: number;
  estado?: AlertStatus;
  severidad?: AlertSeverity;
  limit?: number;
  offset?: number;
  sort_by?: "fecha_detectada" | "severidad" | "estado";
  sort_order?: "asc" | "desc";
}

export interface UpdateAlertStatusPayload {
  estado: "CONFIRMADA" | "DESCARTADA";
  accion_usuario: AlertUserAction;
}
