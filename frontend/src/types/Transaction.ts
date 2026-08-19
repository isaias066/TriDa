// ¿Qué? Tipos e interfaces relacionados a transacciones bancarias del sistema TriDa.
// ¿Para qué? Definir la estructura de datos de las transacciones que se procesan,
//            analizan y visualizan en Dashboard, Alerts, Transactions y Map.
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.transacciones` y sus
//           constraints de la BD.

import type { RiskLevel } from '@constants/Risk';

// ==============================================================================
// ENUMS DE LA BD
// ==============================================================================


export type TransactionStatusRaw =
  | 'PENDIENTE'
  | 'APROBADA'
  | 'ALERTADA'
  | 'BLOQUEADA';


export type TransactionStatus =
  | 'pending'
  | 'approved'
  | 'flagged'
  | 'blocked';


export type TransactionChannel =
  | 'mobile'
  | 'web'
  | 'pos'
  | 'atm'
  | 'branch';


export type CurrencyCode = 'COP' | 'USD' | 'EUR' | string;

// ==============================================================================
// ESTRUCTURA RAW (tal como viene del backend)
// ==============================================================================

/**
 * Estructura de una transacción tal como viene del backend.
 *
 * ¿Qué? Datos completos de una transacción desde la BD.
 * ¿Para qué? Consumo del endpoint `GET /api/transacciones`.
 * ¿Impacto? Coincide con la tabla `trida.transacciones` y sus joins.
 *
 */
export interface TransactionRaw {
  id_transaccion:           number;
  id_cliente?:              number;
  id_dispositivo?:          number;
  id_ubicacion?:            number;
  id_banco?:                number;
  tipo_transaccion?:        string;
  monto?:                   number | string;
  cuenta_origen?:           string;
  cuenta_destino?:          string;
  fecha_transaccion?:       string;
  score_riesgo?:            number | string;
  estado_transaccion?:      TransactionStatusRaw;
  es_fraude_real?:          boolean | null;
  tiempo_de_procesamiento?: number;
  tiempo_proceso?:          number;
  moneda?:                  CurrencyCode;
  canal?:                   TransactionChannel;

  cliente?:                 string;   
  nombre_completo?:         string;   
  banco?:                   string;   
  banco_codigo?:            string;   
  banco_color?:             string;   
  color_banco?:             string;   
  ciudad?:                  string;   
  latitud?:                 number | string;
  longitud?:                number | string;
  tipo_dispositivo?:        string;   
  cuenta?:                  string;   
}

// ==============================================================================
// ESTRUCTURA NORMALIZADA (para uso en el frontend)
// ==============================================================================

/**
 * Transacción normalizada para uso consistente en toda la aplicación.
 *
 * ¿Qué? Versión limpia de `TransactionRaw` con estructura anidada y en inglés.
 * ¿Para qué? Consumo en tablas, cards, mapas, gráficos y modales de detalle.
 * ¿Impacto? El normalizer convierte `TransactionRaw` → `Transaction` antes de usar.
 */
export interface Transaction {
  id: string;
  timestamp: string | null;
  user: string;
  account: string;
  type: string;
  amount: number;
  currency: CurrencyCode;
  riskScore: number;
  alertLevel: RiskLevel;
  status: TransactionStatus;
  isFraud: boolean;
  processingTime: number;
  channel: TransactionChannel;
  bank: {
    id:    string;
    name:  string;
    color: string;
  };
  location: {
    city:      string;
    latitude:  number | null;
    longitude: number | null;
  };
  device: {
    type: string;
  };
}

// ==============================================================================
// FILTROS Y CONSULTAS
// ==============================================================================

/**
 * Filtros aplicables a la lista de transacciones.
 *
 * ¿Qué? Estructura de todos los filtros que puede aplicar el usuario.
 * ¿Para qué? Consumo en la página Transactions y en los hooks de filtrado.
 * ¿Impacto? Facilita agregar nuevos filtros sin cambiar múltiples archivos.
 */
export interface TransactionFilters {
  search?: string;
  level?: RiskLevel | 'all';
  status?: TransactionStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  channel?: TransactionChannel | 'all';
  bankId?: string;
}

/**
 * Configuración de ordenamiento para la tabla de transacciones.
 */
export interface TransactionSort {
  field: TransactionSortField;
  direction: 'asc' | 'desc';
}

export type TransactionSortField =
  | 'id'
  | 'timestamp'
  | 'amount'
  | 'riskScore'
  | 'user'
  | 'bank';

// ==============================================================================
// AGRUPACIONES Y ESTADÍSTICAS
// ==============================================================================

/**
 * Estadísticas generales de un conjunto de transacciones.
 *
 * ¿Qué? Resumen agregado para el Dashboard.
 * ¿Para qué? Consumo en los cards de métricas.
 */
export interface TransactionStats {
  total:      number;
  approved:   number;
  flagged:    number;
  blocked:    number;
  pending:    number;
  fraudCount: number;
  totalAmount:   number;
  averageAmount: number;
  fraudRate: number;
}

// ==============================================================================
// PAYLOAD DE UBICACIÓN EN MAPA
// ==============================================================================

/**
 * Datos mínimos de una transacción para renderizar en el mapa.
 *
 * ¿Qué? Subset de `Transaction` con las coordenadas garantizadas.
 * ¿Para qué? Consumo en la página TransactionMap.
 * ¿Impacto? Se filtran las transacciones sin coordenadas válidas.
 */
export interface TransactionMapPoint {
  id: string;
  riskScore: number;
  alertLevel: RiskLevel;
  status: TransactionStatus;
  user: string;
  type: string;
  amount: number;
  currency: CurrencyCode;
  channel: TransactionChannel;
  bank: {
    name:  string;
    color: string;
  };
  location: {
    city:      string;
    latitude:  number;
    longitude: number;
  };
}