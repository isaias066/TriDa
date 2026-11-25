import type { TipoMovimiento, NivelRiesgo } from "./Transaction";

export interface GeoTransactionCategory {
  nombre: string;
  color: string | null;
  icono: string | null;
}

export interface GeoTransaction {
  id_transaccion: number;
  monto: number;
  tipo_movimiento: TipoMovimiento;
  comercio: string | null;
  estado: string;
  score_anomalia: number;
  ciudad: string | null;
  pais: string | null;
  latitud: number;
  longitud: number;
  fecha_transaccion: string;
  nombre_cuenta: string | null;
  nombre_categoria: string | null;
  categoria: GeoTransactionCategory | null;
  es_sospechosa: boolean;
  nivel_riesgo: NivelRiesgo;
}

export interface MapSummary {
  total_geolocalizadas: number;
  ciudades_distintas: number;
  paises_distintos: number;
  transacciones_riesgo_alto: number;
  score_promedio: number;
}

export interface MapLocationResult {
  items: GeoTransaction[];
  total: number;
  truncated: boolean;
}

export interface MapFilters {
  id_cuenta?: number;
  limit?: number;
  nivel_riesgo?: NivelRiesgo | "ALL";
  estado?:
    | "PENDIENTE"
    | "CONFIRMADA"
    | "APROBADA"
    | "SOSPECHOSA"
    | "RECHAZADA"
    | "ALL";
  fecha_inicio?: string;
  fecha_fin?: string;
}
