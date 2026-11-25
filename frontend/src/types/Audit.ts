export interface AuditEvent {
  id_log: number;
  tipo_accion: string;
  entidad_afectada: string;
  id_entidad: number | null;
  descripcion: string | null;
  fecha_accion: string;
}

export interface AuditHistoryPage {
  items: AuditEvent[];
  has_more: boolean;
  next_cursor: number | null;
}
