// ¿Qué? Funciones utilitarias avanzadas relacionadas con el score de riesgo y su clasificación.
// ¿Para qué? Centralizar la lógica de clasificación, comparación y mapeo de niveles
//            de riesgo que estaba duplicada en 4+ componentes del proyecto.
// ¿Impacto? Todas las páginas de Alertas, Transacciones, Mapa y Dashboard usan
//           esta lógica de forma consistente.

import {
  RISK_COLORS,
  RISK_LEVELS,
  RISK_THRESHOLDS,
  getRiskLevel as baseGetRiskLevel,
  type RiskLevel,
} from '@constants/Risk';

import type {
  AlertCriticalityRaw,
  AlertStatusRaw,
  TransactionStatusRaw,
} from '@app-types';

// ==============================================================================
// MAPEOS BACKEND → FRONTEND (niveles de criticidad)
// ==============================================================================

/**
 * Mapea el nivel de criticidad de la BD (español, MAYÚSCULAS) al frontend.
 *
 * ¿Qué? Convierte 'CRITICA' → 'critical', 'BAJA' → 'low', etc.
 * ¿Para qué? Normalizar el nivel de criticidad al recibirlo del backend.
 * ¿Impacto? Se usa en el normalizer de alertas (utils/Normalizers.ts).
 *
 * @param raw - Nivel tal como viene de la BD (BAJA, MEDIA, ALTA, CRITICA).
 * @returns Nivel normalizado ('low' | 'medium' | 'high' | 'critical').
 */
export function mapCriticalityRawToLevel(
  raw: AlertCriticalityRaw | string | null | undefined
): RiskLevel {
  const normalized = String(raw ?? '').toUpperCase().trim();

  switch (normalized) {
    case 'CRITICA':
    case 'CRÍTICA':
    case 'CRITICAL':
      return 'critical';
    case 'ALTA':
    case 'HIGH':
      return 'high';
    case 'MEDIA':
    case 'MEDIUM':
    case 'MODERATE':
      return 'medium';
    case 'BAJA':
    case 'LOW':
    default:
      return 'low';
  }
}

/**
 * Mapea el nivel del frontend al formato de la BD (para envíos al backend).
 *
 * @param level - Nivel del frontend ('low' | 'medium' | 'high' | 'critical').
 * @returns Nivel para el backend ('BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA').
 */
export function mapLevelToCriticalityRaw(level: RiskLevel): AlertCriticalityRaw {
  const map: Record<RiskLevel, AlertCriticalityRaw> = {
    low:      'BAJA',
    medium:   'MEDIA',
    high:     'ALTA',
    critical: 'CRITICA',
  };
  return map[level];
}

// ==============================================================================
// MAPEOS BACKEND → FRONTEND (estados de alerta / transacción)
// ==============================================================================

/**
 * Mapea el estado de una alerta desde el backend al frontend.
 *
 * @param raw - Estado tal como viene de la BD.
 * @returns Estado normalizado.
 */
export function mapAlertStatusRaw(
  raw: AlertStatusRaw | string | null | undefined
): 'active' | 'in_review' | 'resolved' | 'dismissed' {
  const normalized = String(raw ?? '').toUpperCase().trim();

  switch (normalized) {
    case 'EN_REVISION':
    case 'IN_REVIEW':
      return 'in_review';
    case 'RESUELTA':
    case 'RESOLVED':
      return 'resolved';
    case 'DESCARTADA':
    case 'DISMISSED':
      return 'dismissed';
    case 'ACTIVA':
    case 'ACTIVE':
    default:
      return 'active';
  }
}

/**
 * Mapea el estado de una transacción desde el backend al frontend.
 *
 * @param raw - Estado tal como viene de la BD.
 * @returns Estado normalizado.
 */
export function mapTransactionStatusRaw(
  raw: TransactionStatusRaw | string | null | undefined
): 'pending' | 'approved' | 'flagged' | 'blocked' {
  const normalized = String(raw ?? '').toUpperCase().trim();

  switch (normalized) {
    case 'BLOQUEADA':
    case 'BLOCKED':
    case 'RECHAZADA':
      return 'blocked';
    case 'ALERTADA':
    case 'FLAGGED':
    case 'MARCADA':
    case 'SOSPECHOSA':
      return 'flagged';
    case 'APROBADA':
    case 'APPROVED':
      return 'approved';
    case 'PENDIENTE':
    case 'PENDING':
    default:
      return 'pending';
  }
}

// ==============================================================================
// HELPERS DE CLASIFICACIÓN DE RIESGO
// ==============================================================================

/**
 * Determina el nivel de riesgo a partir de un score.
 *
 * ¿Qué? Reexporta la función base de `constants/Risk.ts` para acceso desde utils.
 * ¿Para qué? Mantener consistencia en imports (todo desde `@utils`).
 *
 * @param score - Score entre 0 y 100.
 * @returns Nivel de riesgo.
 */
export function getRiskLevel(score: number): RiskLevel {
  return baseGetRiskLevel(score);
}

/**
 * Obtiene el color asociado a un score de riesgo.
 *
 * ¿Qué? Combina `getRiskLevel()` + `RISK_COLORS` en una sola llamada.
 * ¿Para qué? Simplificar el uso en componentes que solo necesitan el color.
 * ¿Impacto? Reemplaza `getRiskColor()` que estaba en `dashboards.jsx`.
 *
 * @param score - Score entre 0 y 100.
 * @returns Color HEX del nivel correspondiente.
 */
export function getRiskColorFromScore(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}

/**
 * Obtiene el label legible del nivel de riesgo a partir de un score.
 *
 * @param score - Score entre 0 y 100.
 * @returns Label en español ("Bajo", "Medio", "Alto", "Crítico").
 */
export function getRiskLabelFromScore(score: number): string {
  return RISK_LEVELS[getRiskLevel(score)].label;
}

// ==============================================================================
// HELPERS DE VALIDACIÓN Y COMPARACIÓN
// ==============================================================================

/**
 * Determina si un score requiere bloqueo automático.
 *
 * ¿Qué? Compara el score con el umbral crítico.
 * ¿Para qué? Frontend puede mostrar UI diferenciada para transacciones que
 *            serán bloqueadas automáticamente por el sistema.
 * ¿Impacto? Debe coincidir con la lógica del backend.
 *
 * @param score - Score entre 0 y 100.
 * @returns `true` si el score supera el umbral de bloqueo (≥ 80).
 */
export function isAutoBlockScore(score: number): boolean {
  return score >= RISK_THRESHOLDS.critical.min;
}

/**
 * Determina si un score genera alerta (no es solo "bajo").
 *
 * @param score - Score entre 0 y 100.
 * @returns `true` si el score genera algún tipo de alerta (≥ 30).
 */
export function shouldGenerateAlert(score: number): boolean {
  return score >= RISK_THRESHOLDS.medium.min;
}

/**
 * Compara dos niveles de riesgo para ordenamiento.
 *
 * ¿Qué? Retorna un valor numérico para comparación (útil en sort()).
 * ¿Para qué? Ordenar listas de alertas por nivel de criticidad.
 *
 * @param a - Primer nivel.
 * @param b - Segundo nivel.
 * @returns Negativo si a < b, positivo si a > b, cero si iguales.
 *
 */
export function compareRiskLevels(a: RiskLevel, b: RiskLevel): number {
  const priority: Record<RiskLevel, number> = {
    low:      1,
    medium:   2,
    high:     3,
    critical: 4,
  };
  return priority[a] - priority[b];
}

/**
 * Verifica si un nivel de riesgo es más grave que otro.
 *
 * @param level - Nivel a comparar.
 * @param threshold - Nivel de referencia.
 * @returns `true` si `level` es más grave o igual que `threshold`.
 *
 * @example
 * isAtLeastLevel('critical', 'medium')  // true
 * isAtLeastLevel('low', 'medium')       // false
 */
export function isAtLeastLevel(level: RiskLevel, threshold: RiskLevel): boolean {
  return compareRiskLevels(level, threshold) >= 0;
}

// ==============================================================================
// HELPERS DE AGRUPACIÓN
// ==============================================================================

/**
 * Cuenta la cantidad de items por nivel de riesgo.
 *
 * ¿Qué? Recibe un array de items con propiedad `alertLevel` y cuenta por nivel.
 * ¿Para qué? Generar contadores para chips y badges (usado en Alerts).
 *
 * @param items - Array de items con propiedad `alertLevel`.
 * @returns Objeto con conteo por nivel.
 */
export function countByRiskLevel<T extends { alertLevel: RiskLevel }>(
  items: T[]
): Record<RiskLevel, number> {
  const counts: Record<RiskLevel, number> = {
    low:      0,
    medium:   0,
    high:     0,
    critical: 0,
  };

  for (const item of items) {
    counts[item.alertLevel]++;
  }

  return counts;
}

/**
 * Agrupa items por nivel de riesgo.
 *
 * @param items - Array de items con propiedad `alertLevel`.
 * @returns Objeto con arrays de items por nivel.
 *
 */
export function groupByRiskLevel<T extends { alertLevel: RiskLevel }>(
  items: T[]
): Record<RiskLevel, T[]> {
  const groups: Record<RiskLevel, T[]> = {
    low:      [],
    medium:   [],
    high:     [],
    critical: [],
  };

  for (const item of items) {
    groups[item.alertLevel].push(item);
  }

  return groups;
}

// ==============================================================================
// HELPERS DE PRIORIDAD
// ==============================================================================

/**
 * Convierte un nivel de riesgo a un valor de prioridad numérico (1-10).
 *
 * ¿Qué? Traduce el nivel a la escala de prioridad usada en la tabla `alertas`.
 * ¿Para qué? Sincronizar con el campo `prioridad` de la BD.
 * ¿Impacto? Debe coincidir con `chk_prioridad` (rango 1-10).
 *
 * @param level - Nivel de riesgo.
 * @returns Prioridad numérica (1 = baja, 10 = máxima).
 */
export function levelToPriority(level: RiskLevel): number {
  const map: Record<RiskLevel, number> = {
    low:      2,
    medium:   5,
    high:     7,
    critical: 10,
  };
  return map[level];
}