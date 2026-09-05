// ¿Qué? Constantes y utilidades del score de riesgo de fraude TriDa.
// ¿Para qué? Única fuente de verdad de colores, labels y umbrales en toda la app.
// ¿Impacto? Backend (risk.service) y frontend (badges, mapa, dashboard) deben coincidir.

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskLevelMetadata {
  label: string;
  color: string;
  description: string;
}

export interface RiskThreshold {
  min: number;
  max: number;
}

/** Colores canónicos de riesgo — NO duplicar estos hex en otros archivos. */
export const RISK_COLORS: Record<RiskLevel, string> = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#F97316',
  critical: '#EF4444',
};

export const RISK_LEVELS: Record<RiskLevel, RiskLevelMetadata> = {
  low: {
    label: 'Bajo',
    color: RISK_COLORS.low,
    description: 'Operación con bajo nivel de riesgo',
  },
  medium: {
    label: 'Medio',
    color: RISK_COLORS.medium,
    description: 'Riesgo moderado — requiere revisión',
  },
  high: {
    label: 'Alto',
    color: RISK_COLORS.high,
    description: 'Riesgo elevado — alerta generada',
  },
  critical: {
    label: 'Crítico',
    color: RISK_COLORS.critical,
    description: 'Riesgo crítico — bloqueo automático',
  },
};

/** Umbrales alineados con risk.service.ts y fn_dashboard_stats (50 / 80 / 95). */
export const RISK_THRESHOLDS: Record<RiskLevel, RiskThreshold> = {
  low: { min: 0, max: 49 },
  medium: { min: 50, max: 79 },
  high: { min: 80, max: 94 },
  critical: { min: 95, max: 100 },
};

export const AUTO_BLOCK_THRESHOLD = 95;

/** Orden de mayor a menor criticidad (dashboard, leyendas, rings). */
export const RISK_LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

export function getRiskLevel(score: number): RiskLevel {
  if (score >= RISK_THRESHOLDS.critical.min) return 'critical';
  if (score >= RISK_THRESHOLDS.high.min) return 'high';
  if (score >= RISK_THRESHOLDS.medium.min) return 'medium';
  return 'low';
}

export function getRiskColor(level: RiskLevel): string {
  return RISK_COLORS[level];
}

export function getRiskColorFromScore(score: number): string {
  return RISK_COLORS[getRiskLevel(score)];
}

export function getRiskLabelFromScore(score: number): string {
  return RISK_LEVELS[getRiskLevel(score)].label;
}

export function shouldAutoBlock(score: number): boolean {
  return score >= AUTO_BLOCK_THRESHOLD;
}

/**
 * Color de acento con alpha (fondos de icono, glows).
 * @example riskColorAlpha('critical', 0.15) → "rgba(239, 68, 68, 0.15)"
 */
export function riskColorAlpha(level: RiskLevel, alpha: number): string {
  const hex = RISK_COLORS[level].replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
