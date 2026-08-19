// ¿Qué? Constantes y utilidades relacionadas al score de riesgo de fraude del sistema TriDa.
// ¿Para qué? Centralizar los colores, labels y umbrales de riesgo para evitar duplicación
//            entre módulos como Alerts, Transactions, Map, Dashboard y Users.
// ¿Impacto? Cualquier cambio en la clasificación de riesgo debe hacerse aquí, y se refleja
//           automáticamente en todos los componentes que consumen estas constantes.

// ==============================================================================
// TYPES / INTERFACES
// ==============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/** Estructura de metadatos para cada nivel de riesgo. */
export interface RiskLevelMetadata {
  label: string;
  color: string;
  description: string;
}

/** Rango de score para clasificar transacciones. */
export interface RiskThreshold {
  min: number;
  max: number;
}

// ==============================================================================
// COLORES DE RIESGO
// ==============================================================================

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:      '#34D399', 
  medium:   '#FBBF24', 
  high:     '#F97316', 
  critical: '#EF4444', 
};

// ==============================================================================
// METADATOS DE NIVELES DE RIESGO
// ==============================================================================

export const RISK_LEVELS: Record<RiskLevel, RiskLevelMetadata> = {
  low: {
    label:       'Bajo',
    color:       RISK_COLORS.low,
    description: 'Operación completamente legítima',
  },
  medium: {
    label:       'Medio',
    color:       RISK_COLORS.medium,
    description: 'Merece atención — revisión sugerida',
  },
  high: {
    label:       'Alto',
    color:       RISK_COLORS.high,
    description: 'Alerta seria — requiere validación del analista',
  },
  critical: {
    label:       'Crítico',
    color:       RISK_COLORS.critical,
    description: 'Máxima alerta — bloqueo automático',
  },
};

// ==============================================================================
// UMBRALES DE SCORE DE RIESGO
// ==============================================================================


export const RISK_THRESHOLDS: Record<RiskLevel, RiskThreshold> = {
  low:      { min: 0,  max: 29  },
  medium:   { min: 30, max: 59  },
  high:     { min: 60, max: 79  },
  critical: { min: 80, max: 100 },
};

export const AUTO_BLOCK_THRESHOLD = 95;

// ==============================================================================
// FUNCIONES UTILITARIAS
// ==============================================================================

/**
 * Determina el nivel de riesgo a partir de un score numérico.
 *
 * ¿Qué? Convierte un score (0-100) en un nivel de riesgo tipado.
 * ¿Para qué? Centralizar la lógica de clasificación de riesgo que estaba
 *            duplicada en `alerts.jsx`, `transactions.jsx`, `users.jsx` y `map.jsx`.
 * ¿Impacto? Cualquier ajuste de umbrales solo se hace aquí.
 *
 * @param score 
 * @returns 
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical';
  if (score >= RISK_THRESHOLDS.high.min)     return 'high';
  if (score >= RISK_THRESHOLDS.medium.min)   return 'medium';
  return 'low';
}

/**
 * Obtiene el color asociado a un nivel de riesgo.
 *
 * @param level - Nivel de riesgo.
 * @returns Color HEX.
 */

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

/**
 * Obtiene el color asociado directamente desde un score.
 *
 * @param score - Puntaje de riesgo entre 0 y 100.
 * @returns Color HEX.
 */

export function getRiskColorFromScore(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}

/**
 * Obtiene el label legible en español a partir de un score.
 *
 * @param score - Puntaje de riesgo entre 0 y 100.
 * @returns Etiqueta legible en español.
 */
export function getRiskLabelFromScore(score: number): string {
  return RISK_LEVELS[getRiskLevel(score)].label;
}

/**
 * Determina si un score requiere bloqueo automático.
 *
 * ¿Qué? Compara el score con el umbral de bloqueo automático.
 * ¿Para qué? Que el frontend pueda mostrar UI diferenciada para transacciones bloqueadas.
 * ¿Impacto? Debe coincidir con la lógica del backend para evitar inconsistencias.
 *
 * @param score - Puntaje de riesgo entre 0 y 100.
 * @returns `true` si el score supera el umbral de bloqueo.
 */
export function shouldAutoBlock(score: number): boolean {
  return score >= AUTO_BLOCK_THRESHOLD;
}