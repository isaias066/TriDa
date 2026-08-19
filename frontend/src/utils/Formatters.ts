// ¿Qué? Funciones de formateo de datos para presentación en la UI.
// ¿Para qué? Centralizar todos los formateos de moneda, fechas, números y porcentajes
//            que estaban duplicados en 5+ componentes del proyecto.
// ¿Impacto? Cualquier cambio de formato (locale, decimales, símbolos) se hace
//           en un solo lugar y se refleja en toda la aplicación.

import type { CurrencyCode } from '@app-types';

// ==============================================================================
// CONSTANTES DE CONFIGURACIÓN
// ==============================================================================

const DEFAULT_LOCALE = 'es-CO' as const;

const CURRENCY_DECIMALS: Record<string, number> = {
  COP: 0,
  USD: 2,
  EUR: 2,
  MXN: 2,
};

// ==============================================================================
// FORMATEO DE MONEDA
// ==============================================================================

/**
 * Formatea un monto como moneda con símbolo y separadores.
 *
 * ¿Qué? Convierte un número en string con formato de moneda del país.
 * ¿Para qué? Mostrar montos consistentemente en tablas, cards y detalles.
 * ¿Impacto? Reemplaza `fmtCOP` que estaba duplicado en 5 componentes.
 *
 * @param amount - Monto a formatear (puede ser null/undefined).
 * @param currency - Código ISO de moneda (default: 'COP').
 * @returns String formateado como "$ 100.000" o "US$ 1,000.00".
 *
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: CurrencyCode = 'COP'
): string {
  const value = amount ?? 0;
  const decimals = CURRENCY_DECIMALS[currency] ?? 2;

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style:                 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Alias corto de `formatCurrency` para pesos colombianos.
 */
export function formatCOP(amount: number | null | undefined): string {
  return formatCurrency(amount, 'COP');
}

// ==============================================================================
// FORMATEO DE NÚMEROS
// ==============================================================================

/**
 * Formatea un número con separadores de miles.
 *
 * @param value - Número a formatear.
 * @param decimals - Cantidad de decimales (default: 0).
 * @returns String formateado con separadores.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  const num = value ?? 0;
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Formatea un número como porcentaje.
 *
 * @param value - Valor entre 0 y 100 (o 0 y 1 si `isRatio` es true).
 * @param decimals - Cantidad de decimales (default: 1).
 * @param isRatio - Si es true, el valor viene de 0 a 1 y se multiplica por 100.
 * @returns String formateado como "95,5 %".
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1,
  isRatio: boolean = false
): string {
  const raw = value ?? 0;
  const num = isRatio ? raw * 100 : raw;

  return `${new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)} %`;
}

/**
 * Formatea un número de forma compacta (1.5M, 3.2K, etc.).
 *
 * ¿Qué? Convierte números grandes a notación abreviada.
 * ¿Para qué? Mostrar montos grandes en cards de estadísticas sin ocupar mucho espacio.
 * ¿Impacto? Útil en Dashboard para métricas como "monto protegido".
 *
 * @param value - Número a formatear.
 * @returns String compacto como "1,5M" o "3,2K".
 *
 * @example
 */
export function formatCompact(value: number | null | undefined): string {
  const num = value ?? 0;
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation:              'compact',
    maximumFractionDigits: 1,
  }).format(num);
}

// ==============================================================================
// FORMATEO DE FECHAS
// ==============================================================================

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY).
 *
 * @param date - Fecha en formato ISO 8601, Date o timestamp.
 * @returns String como "22/03/2026" o "--/--/----" si no hay fecha.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '--/--/----';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '--/--/----';

  return d.toLocaleDateString(DEFAULT_LOCALE, {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  });
}

/**
 * Formatea una hora en formato HH:MM.
 *
 * ¿Qué? Extrae solo la hora de una fecha completa.
 * ¿Para qué? Mostrar horas de alertas y transacciones en listados.
 * ¿Impacto? Reemplaza `fmtTime` que estaba en `dashboards.jsx`.
 *
 * @param date - Fecha en formato ISO 8601, Date o timestamp.
 * @param includeSeconds - Si es true, incluye segundos (HH:MM:SS).
 * @returns String como "14:30" o "--:--" si no hay fecha.
 */
export function formatTime(
  date: string | Date | null | undefined,
  includeSeconds: boolean = false
): string {
  if (!date) return includeSeconds ? '--:--:--' : '--:--';

  const d = new Date(date);
  if (isNaN(d.getTime())) return includeSeconds ? '--:--:--' : '--:--';

  return d.toLocaleTimeString(DEFAULT_LOCALE, {
    hour:   '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  });
}

/**
 * Formatea una fecha completa con hora (DD/MM/YYYY HH:MM).
 *
 * @param date - Fecha en formato ISO 8601, Date o timestamp.
 * @returns String como "22/03/2026 14:30".
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '--/--/---- --:--';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '--/--/---- --:--';

  return `${formatDate(d)} ${formatTime(d)}`;
}

/**
 * Formatea una fecha en formato relativo ("hace 5 minutos", "hace 2 horas").
 *
 * ¿Qué? Muestra tiempo transcurrido desde una fecha.
 * ¿Para qué? Mostrar alertas recientes de forma más humana.
 * ¿Impacto? Mejora la UX en listados de alertas y transacciones.
 *
 * @param date - Fecha en formato ISO 8601, Date o timestamp.
 * @returns String como "hace 5 minutos" o "hace 2 horas".
 *
 * @example
 * formatRelativeTime('2026-03-22T10:00:00Z')  // "hace 5 minutos"
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return 'Sin fecha';

  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';

  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60)  return 'hace unos segundos';
  if (minutes < 60)  return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  if (hours < 24)    return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  if (days < 7)      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;

  return formatDate(d);
}

// ==============================================================================
// FORMATEO DE SCORE DE RIESGO
// ==============================================================================

/**
 * Formatea un score de riesgo como porcentaje con un decimal.
 *
 * ¿Qué? Formato estandarizado del score del modelo IA.
 * ¿Para qué? Consistencia en toda la app (Alerts, Transactions, Map).
 * ¿Impacto? Cumple la restricción de "score con un decimal" del proyecto.
 *
 * @param score - Score entre 0 y 100.
 * @returns String como "85,5 %".
 */
export function formatRiskScore(score: number | null | undefined): string {
  return formatPercent(score ?? 0, 1);
}

// ==============================================================================
// FORMATEO DE STRINGS
// ==============================================================================

/**
 * Trunca un texto largo y añade puntos suspensivos.
 *
 * @param text - Texto original.
 * @param maxLength - Longitud máxima antes de truncar.
 * @returns Texto truncado con "..." al final.
 *
 * @example
 * truncateText('Este es un texto muy largo', 10)  // "Este es un..."
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50
): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Capitaliza la primera letra de un string.
 *
 * @param text - Texto original.
 * @returns Texto con la primera letra en mayúscula.
 *
 * @example
 * capitalize('bancolombia')  // "Bancolombia"
 */
export function capitalize(text: string | null | undefined): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convierte un texto a formato "Title Case" (Cada Palabra En Mayúscula).
 *
 * @param text - Texto original.
 * @returns Texto en Title Case.
 */
export function toTitleCase(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

// ==============================================================================
// FORMATEO DE ARCHIVOS Y TAMAÑOS
// ==============================================================================

/**
 * Formatea un tamaño en bytes a formato legible (KB, MB, GB).
 *
 * @param bytes - Tamaño en bytes.
 * @returns String como "1,5 MB".
 *
 * @example
 * formatFileSize(1024)      // "1 KB"
 * formatFileSize(1048576)   // "1 MB"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  const b = bytes ?? 0;
  if (b === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  const size = b / Math.pow(1024, i);

  return `${formatNumber(size, 1)} ${units[i]}`;
}