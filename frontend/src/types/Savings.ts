export type EstadoMeta = "ACTIVA" | "COMPLETADA" | "CANCELADA" | "PAUSADA";

export interface SavingsGoal {
  id_meta: number;
  nombre: string;
  monto_objetivo: number;
  monto_actual: number;
  progreso: number;
  fecha_limite: string | null;
  estado: EstadoMeta;
  fecha_creacion: string;
}

export interface CreateSavingsGoalPayload {
  nombre: string;
  monto_objetivo: number;
  monto_actual?: number;
  fecha_limite?: string;
}

export interface UpdateSavingsGoalPayload {
  nombre?: string;
  monto_objetivo?: number;
  fecha_limite?: string | null;
  estado?: EstadoMeta;
}

export interface CreateContributionPayload {
  id_meta: number;
  monto: number;
}

export interface SavingsSummary {
  total_ahorrado: number;
  total_objetivo: number;
  metas_activas: number;
  metas_completadas: number;
  porcentaje_general: number;
}
