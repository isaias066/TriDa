export interface CategoryReportItem {
  id_categoria: number | null;
  nombre: string;
  tipo: "INGRESO" | "GASTO";
  total: number;
  porcentaje: number;
  numero_transacciones: number;
  color: string | null;
}

export interface MerchantReportItem {
  comercio: string;
  total: number;
  numero_transacciones: number;
  porcentaje: number;
}

export interface FinancialReportSummary {
  total_ingresos: number;
  total_gastos: number;
  balance_neto: number;
  tasa_ahorro: number;
}

export interface ReportTransaction {
  id_transaccion: number;
  fecha_transaccion: string;
  tipo_movimiento: "INGRESO" | "GASTO" | "AHORRO" | "TRANSFERENCIA";
  monto: number;
  comercio: string | null;
  descripcion: string | null;
  estado: string;
  score_anomalia: number;
  ciudad: string | null;
  nombre_cuenta: string | null;
  nombre_cuenta_destino?: string | null;
  nombre_categoria: string | null;
}

export interface FinancialReportData {
  resumen: FinancialReportSummary;
  gastos_por_categoria: CategoryReportItem[];
  ingresos_por_categoria: CategoryReportItem[];
  top_comercios: MerchantReportItem[];
  transacciones: ReportTransaction[];
  total_transacciones: number;
  transacciones_truncadas: boolean;
  periodo: {
    fecha_inicio: string;
    fecha_fin: string;
  };
}

export type TipoPeriodoReporte =
  | "MES_ACTUAL"
  | "ULTIMOS_3_MESES"
  | "ULTIMOS_6_MESES"
  | "ANIO_ACTUAL"
  | "PERSONALIZADO";

export interface ReportFilters {
  tipo_periodo?: TipoPeriodoReporte;
  fecha_inicio?: string;
  fecha_fin?: string;
  id_cuenta?: number;
}
