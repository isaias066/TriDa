// ¿Qué? Tipos e interfaces relacionados a métricas, agregaciones y análisis del sistema TriDa.
// ¿Para qué? Definir la estructura de datos de las métricas del modelo IA, dashboard,
//            reportes y agregaciones consumidas en Analytics, Dashboard y Reports.
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.reportes` de la BD
//           y los endpoints de agregación del backend.

import type { AlertCriticality } from './Alert';
import { CityStats } from './Location';
import type { TransactionChannel } from './Transaction';

// ==============================================================================
// MÉTRICAS GLOBALES DEL MODELO IA
// ==============================================================================

/**
 * Estructura raw de métricas globales tal como viene del backend.
 * NOTE: Múltiples nombres de campo por compatibilidad con backends antiguos.
 * Endpoint: `GET /api/analytics/metricas`
 */
export interface AnalyticsMetricsRaw {
  tasa_deteccion?:     number | string;
  detection_rate?:     number | string;
  falsos_positivos?:   number | string;
  false_positives?:    number | string;
  fp?:                 number | string;
  monto_promedio?:     number | string;
  avg_amount?:         number | string;
  avg?:                number | string;
  total_analizadas?:   number;
  total?:              number;
  count?:              number;
  tiempo_promedio_respuesta?: number;
  monto_protegido?:    number;
  fraudes_detectados?: number;
}

/**
 * Métricas globales normalizadas del modelo IA.
 *
 * ¿Qué? Indicadores clave de efectividad del modelo.
 * ¿Para qué? Consumo en la página Analytics y reportes ejecutivos.
 * ¿Impacto? Los valores se calculan periódicamente por el backend.
 */
export interface AnalyticsMetrics {
  detectionRate: number;
  falsePositiveRate: number;
  averageAmount: number;
  totalAnalyzed: number;
  averageResponseTime: number;
  protectedAmount: number;
  fraudsDetected: number;
}

// ==============================================================================
// AGREGACIONES POR DIMENSIÓN
// ==============================================================================

/**
 * Agregación de transacciones por tipo (transferencia, retiro, compra, etc.).
 */
export interface TransactionTypeAggregation {
  type: string;
  count: number;
  fraud: number;
  amount?: number;
}

/**
 * Agregación de transacciones por canal (mobile, web, pos, atm, branch).
 */
export interface ChannelAggregation {
  channel: TransactionChannel | string;
  count: number;
  fraud?: number;
}

/**
 * Agregación de transacciones por banco.
 */
export interface BankAggregation {
  bank: string;
  bankId?: string;
  count: number;
  fraud: number;
  color: string;
}

/**
 * Respuesta completa del endpoint `GET /api/analytics/agregaciones`.
 *
 * ¿Qué? Todas las agregaciones que se muestran en la página Analytics.
 * ¿Para qué? Consumo en gráficos de barras (por tipo, ciudad, canal, banco).
 * ¿Impacto? Cambios aquí requieren actualizar la página Analytics completa.
 */
export interface AnalyticsAggregations {
  porTipo:   TransactionTypeAggregation[];
  porCiudad: CityStats[];
  porCanal:  ChannelAggregation[];
  porBanco:  BankAggregation[];
}

/**
 * Estructura raw de agregación por ciudad (referenciado desde types/Location).
 * NOTE: Duplicado ligero para evitar dependencia circular.
 */
export interface CityAggregationRaw {
  ciudad?:   string;
  city?:     string;
  nombre?:   string;
  count?:    number;
  cantidad?: number;
  total?:    number;
}

// ==============================================================================
// ESTADÍSTICAS DEL DASHBOARD
// ==============================================================================

/**
 * Estructura raw de estadísticas del dashboard tal como viene del backend.
 * Endpoint: `GET /api/dashboard/stats`
 */
export interface DashboardStatsRaw {
  total_transacciones?: number;
  total?: number;
  total_criticas?: number;
  crit?: number;
  total_altas?: number;
  high?: number;
  total_aprobadas?: number;
  app?: number;
  total_bloqueadas?: number;
  blk?: number;
  monto_total?: number;
  total_clientes?: number;
  total_fraudes?: number;
}

/**
 * Estadísticas normalizadas del Dashboard principal.
 *
 * ¿Qué? Resumen ejecutivo del estado del sistema en tiempo real.
 * ¿Para qué? Consumo en los cards de estadísticas del Dashboard.
 * ¿Impacto? Se actualiza cada vez que cambia el banco seleccionado.
 */
export interface DashboardStats {
  totalTransactions: number;
  totalClients: number;
  totalFrauds: number;
  totalBlocked: number;
  totalAmount: number;
  fraudRate: number;
  alertsByLevel: Record<AlertCriticality, number>;
}

// ==============================================================================
// ESTADÍSTICAS DEL MAPA
// ==============================================================================

/**
 * Estructura raw de estadísticas del mapa tal como viene del backend.
 * Endpoint: `GET /api/mapa/stats`
 */
export interface MapStatsRaw {
  total_transacciones?: number;
  total?: number;
  total_criticas?: number;
  crit?: number;
  total_altas?: number;
  high?: number;
  total_aprobadas?: number;
  app?: number;
  total_bloqueadas?: number;
  blk?: number;
}

/**
 * Estadísticas normalizadas del mapa global.
 *
 * ¿Qué? Contadores overlay que se muestran sobre el mapa.
 * ¿Para qué? Consumo en la página TransactionMap.
 */
export interface MapStats {
  total: number;
  critical: number;
  high: number;
  approved: number;
  blocked: number;
}

// ==============================================================================
// REPORTES GENERADOS
// ==============================================================================

/**
 * Tipos de reportes generados por el sistema.
 */
export type ReportType =
  | 'DIARIO'
  | 'SEMANAL'
  | 'MENSUAL'
  | 'PERSONALIZADO';


export type ExportFormat = 'csv' | 'pdf' | 'xlsx' | 'json';


export interface ReportRaw {
  id_reporte:                  number;
  id_usuario_generador?:       number;
  tipo_reporte:                ReportType;
  fecha_inicio:                string;
  fecha_fin:                   string;
  total_transacciones?:        number;
  total_alertas_generadas?:    number;
  fraudes_detectados?:         number;
  falsos_positivos?:           number;
  tasa_deteccion?:             number | string;
  tiempo_promedio_respuesta?:  number | string;
  monto_protegido?:            number | string;
  fecha_generacion:            string;
  ruta_archivo:                string;
}

export interface Report {
  id: number;
  generatedBy: number | null;
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  filePath: string;
  metrics: {
    totalTransactions: number;
    totalAlerts: number;
    fraudsDetected: number;
    falsePositives: number;
    detectionRate: number;
    averageResponseTime: number;
    protectedAmount: number;
  };
}


export interface GenerateReportPayload {
  type: ReportType;
  dateFrom: string;
  dateTo: string;
  format: ExportFormat;
  bankId?: string;
}

// ==============================================================================
// EXPORTACIÓN DE DATOS
// ==============================================================================

/**
 * Metadatos de un archivo exportado.
 *
 * ¿Qué? Información sobre el archivo generado localmente.
 * ¿Para qué? Consumo en el modal de vista previa de exportación.
 */
export interface ExportMetadata {
  format: ExportFormat;
  count: number;
  sample: unknown[];
  filename?: string;
}


export interface ExportOptions {
  dateFrom?: string;
  dateTo?: string;
  detailLevel?: 'summary' | 'detailed' | 'full';
  metrics?: string[];
  format: ExportFormat;
}