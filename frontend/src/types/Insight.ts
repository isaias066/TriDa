export interface InsightSummary {
  ingresos: number;
  gastos: number;
  ahorros: number;
  balance: number;
  tasa_ahorro: number;
  total_transacciones: number;
  score_riesgo_promedio: number;
  total_alertas: number;
  alertas_criticas: number;
}

export interface InsightCategory {
  nombre: string;
  icono: string | null;
  color: string | null;
  total: number;
  cantidad: number;
}

export interface InsightMerchant {
  comercio: string;
  total: number;
  cantidad: number;
}

export interface ScamRiskReport {
  nivel: "BAJO" | "MODERADO" | "ALTO";
  score_promedio: number;
  total_alertas: number;
  alertas_criticas: number;
  bloqueo_automatico: boolean;
  diagnostico: string;
}

export interface MessageScanResult {
  score_riesgo: number;
  nivel_riesgo: "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
  es_sospechoso: boolean;
  bloqueo_automatico: boolean;
  montos_detectados: string[];
  urls_detectadas: string[];
  hallazgos: string[];
  guia_proteccion: string[];
}

export interface InsightsOverview {
  periodo_dias: number;
  resumen: InsightSummary;
  top_categorias: InsightCategory[];
  top_comercios: InsightMerchant[];
  consejos: string[];
  guias_seguridad?: string[];
  reporte_riesgo_estafa?: ScamRiskReport | null;
}
