// ¿Qué? Tipos e interfaces relacionados a alertas de fraude del sistema TriDa.
// ¿Para qué? Definir la estructura de datos de las alertas generadas por el modelo IA
//            que se muestran en Alerts, Dashboard, Sidebar (badge) y Analytics.
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.alertas` de la BD.

import type { RiskLevel } from '@constants/Risk';
import type { TransactionStatus } from './Transaction';

// ==============================================================================
// ENUMS DE LA BD
// ==============================================================================

export type AlertCriticalityRaw =
  | 'BAJA'
  | 'MEDIA'
  | 'ALTA'
  | 'CRITICA';


export type AlertCriticality = RiskLevel;
 
export type AlertStatusRaw =
  | 'ACTIVA'
  | 'EN_REVISION'
  | 'RESUELTA'
  | 'DESCARTADA';


export type AlertStatus =
  | 'active'
  | 'in_review'
  | 'resolved'
  | 'dismissed';


export type AlertClassificationRaw =
  | 'FRAUDE_CONFIRMADO'
  | 'FALSO_POSITIVO'
  | 'PENDIENTE_INVESTIGACION'
  | 'REQUIERE_CONTACTO_CLIENTE';


export type AlertClassification =
  | 'confirmed_fraud'
  | 'false_positive'
  | 'pending_investigation'
  | 'requires_customer_contact';

// ==============================================================================
// ESTRUCTURA RAW (tal como viene del backend)
// ==============================================================================

/**
 * Estructura de una alerta tal como viene del backend.
 *
 * ¿Qué? Datos completos de una alerta desde la BD.
 * ¿Para qué? Consumo del endpoint `GET /api/alertas`.
 * ¿Impacto? Coincide con la tabla `trida.alertas` y sus joins con
 *           `transacciones`, `clientes`, `bancos`.
 *
 * NOTE: Los campos vienen en snake_case (columnas de la BD).
 */
export interface AlertRaw {
  id_alerta:               number;
  id_transaccion?:         number;
  nivel_criticidad?:       AlertCriticalityRaw;
  nivel?:                  string;
  criticidad?:             string;
  fecha_generacion?:       string;
  factores_sospechosos?:   string | null;
  estado_alerta?:          AlertStatusRaw;
  prioridad?:              number;

  cliente?:                string;
  cuenta?:                 string;
  banco?:                  string;
  banco_codigo?:           string;
  banco_color?:            string;
  tipo_transaccion?:       string;
  monto?:                  number | string;
  score_riesgo?:           number | string;
  ciudad?:                 string;
  canal?:                  string;
  dispositivo?:            string;
  estado_transaccion?:     TransactionStatus;

  descripcion?:            string;
  mensaje?:                string;
  fecha?:                  string;
  createdAt?:              string;
  timestamp?:              string;
  origen?:                 string;
  tipo?:                   string;
  categoria?:              string;
}

// ==============================================================================
// ESTRUCTURA NORMALIZADA (para uso en el frontend)
// ==============================================================================

/**
 * Alerta normalizada para uso consistente en toda la aplicación.
 *
 * ¿Qué? Versión limpia de `AlertRaw` con estructura anidada y en inglés.
 * ¿Para qué? Consumo en la página Alerts, tabla de alertas, panel de detalle.
 * ¿Impacto? El normalizer convierte `AlertRaw` → `Alert` antes de usar.
 */
export interface Alert {
  id: string;
  timestamp: string;
  user: string;
  account: string;
  type: string;
  amount: number;
  riskScore: number;
  alertLevel: AlertCriticality;
  alertStatus: AlertStatus;
  status: TransactionStatus;
  priority: number;
  factors: string | null;
  isFraud: boolean;
  channel: string;
  bank: {
    id:    string;
    name:  string;
    color: string;
  };
  location: {
    city: string;
  };
  device: {
    type: string;
  };
}

// ==============================================================================
// ALERTA SIMPLIFICADA (para el Dashboard)
// ==============================================================================

/**
 * Estructura simplificada de una alerta para el Dashboard.
 *
 * ¿Qué? Subset mínimo de una alerta para el panel "Alertas Recientes".
 * ¿Para qué? Reducir el payload cuando solo se necesitan datos básicos.
 * ¿Impacto? Se usa en el endpoint `/api/dashboard/alertas-recientes`.
 */
export interface RecentAlert {
  id: string;
  timestamp: string;
  description: string;
  amount: number | null;
  origin: string | null;
  level: AlertCriticality;
  color: string;
}

// ==============================================================================
// VALIDACIONES MANUALES DE ANALISTAS
// ==============================================================================

/**
 * Payload para clasificar manualmente una alerta.
 *
 * ¿Qué? Datos que envía un analista al validar una alerta.
 * ¿Para qué? Consumo del endpoint de validación (POST /api/alertas/:id/validar).
 * ¿Impacto? Se persiste en la tabla `trida.validaciones` y alimenta el
 *           reentrenamiento del modelo IA.
 *
 */
export interface ValidateAlertPayload {
  alertId: string;
  classification: AlertClassification;
  comments?: string;
  actionTaken?: string;
}


export interface ValidationRaw {
  id_validacion:      number;
  id_alerta:          number;
  id_usuario:         number;
  clasificacion:      AlertClassificationRaw;
  comentarios:        string | null;
  fecha_validacion:   string;
  accion_tomada:      string | null;
  analista?:          string;
  rol_analista?:      string;
}


export interface Validation {
  id: number;
  alertId: number;
  analystId: number;
  analystName: string;
  analystRole: string;
  classification: AlertClassification;
  comments: string | null;
  timestamp: string;
  actionTaken: string | null;
}

// ==============================================================================
// FILTROS Y ESTADÍSTICAS
// ==============================================================================


export interface AlertFilters {
  level?: AlertCriticality | 'all';
  status?: TransactionStatus | 'all';
  search?: string;
  bankId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Estadísticas generales de alertas.
 *
 * ¿Qué? Contadores agregados para el header de Alerts.
 * ¿Para qué? Consumo en los chips de resumen.
 */
export interface AlertStats {
  total:    number;
  critical: number;
  high:     number;
  medium:   number;
  low:      number;
  blocked:  number;
  flagged:  number;
  resolved: number;
}