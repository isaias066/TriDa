// ¿Qué? Funciones utilitarias para clasificación y detección de dispositivos.
// ¿Para qué? Centralizar la lógica que estaba dispersa en users.jsx (isMobile),
//            y expandirla para soportar categorización completa de dispositivos.
// ¿Impacto? Todos los componentes que muestren íconos, labels o filtren por
//           tipo de dispositivo usan estas funciones de forma consistente.

import {
  MOBILE_KEYWORDS,
  TABLET_KEYWORDS,
  type DeviceCategory,
} from '@app-types/Device';

// ==============================================================================
// PALABRAS CLAVE PARA CLASIFICACIÓN
// ==============================================================================

const POS_KEYWORDS: readonly string[] = [
  'pos',
  'punto de venta',
  'terminal',
  'datafono',
  'dataphone',
  'verifone',
  'ingenico',
] as const;

const ATM_KEYWORDS: readonly string[] = [
  'atm',
  'cajero',
  'automatic teller',
  'wincor',
  'diebold',
  'ncr',
] as const;

const DESKTOP_KEYWORDS: readonly string[] = [
  'desktop',
  'windows',
  'macos',
  'linux',
  'chrome',
  'firefox',
  'edge',
  'safari',
  'opera',
  'pc',
  'laptop',
] as const;

// ==============================================================================
// CLASIFICACIÓN DE DISPOSITIVOS
// ==============================================================================

/**
 * Clasifica un dispositivo en una categoría estándar.
 *
 * ¿Qué? Analiza el string del tipo de dispositivo y lo mapea a una categoría.
 * ¿Para qué? Reemplaza el helper primitivo `isMobile()` de `users.jsx` y añade
 *            soporte para tablets, POS, ATMs y desktops.
 * ¿Impacto? Se usa en el normalizer de dispositivos y en el renderizado de íconos.
 *
 * @param typeString - String del tipo de dispositivo (ej: "iPhone 13", "Chrome Desktop").
 * @returns Categoría del dispositivo.
 *
 */
export function getDeviceCategory(typeString: string | null | undefined): DeviceCategory {
  if (!typeString) return 'unknown';

  const value = String(typeString).toLowerCase().trim();

  if (!value) return 'unknown';

  // Se evalúan en orden de especificidad (tablet ANTES de mobile para evitar
  // que "galaxy tab" caiga en mobile por la palabra "galaxy").
  if (TABLET_KEYWORDS.some(kw => value.includes(kw)))  return 'tablet';
  if (MOBILE_KEYWORDS.some(kw => value.includes(kw)))  return 'mobile';
  if (POS_KEYWORDS.some(kw => value.includes(kw)))     return 'pos';
  if (ATM_KEYWORDS.some(kw => value.includes(kw)))     return 'atm';
  if (DESKTOP_KEYWORDS.some(kw => value.includes(kw))) return 'desktop';

  return 'unknown';
}

/**
 * Verifica si un dispositivo es móvil (compatibilidad con `isMobile` del proyecto original).
 *
 * ¿Qué? Wrapper simple para detección binaria mobile / no-mobile.
 * ¿Para qué? Mantener compatibilidad con código existente que solo necesita saber
 *            si el dispositivo es móvil o no (renderizado condicional simple).
 *
 * @param typeString - Tipo de dispositivo.
 * @returns `true` si es móvil o tablet, `false` en caso contrario.
 */
export function isMobileDevice(typeString: string | null | undefined): boolean {
  const category = getDeviceCategory(typeString);
  return category === 'mobile' || category === 'tablet';
}

// ==============================================================================
// LABELS E ÍCONOS
// ==============================================================================

/**
 * Obtiene el label legible en español de una categoría de dispositivo.
 *
 * ¿Qué? Convierte la categoría técnica a texto para el usuario.
 * ¿Para qué? Mostrar en badges, filtros y detalles.
 * ¿Impacto? Cumple RL-002 (texto al usuario en español).
 *
 * @param category - Categoría del dispositivo.
 * @returns Label en español.
 *
 */
export function getDeviceCategoryLabel(category: DeviceCategory): string {
  const labels: Record<DeviceCategory, string> = {
    mobile:  'Móvil',
    tablet:  'Tablet',
    desktop: 'Computador',
    pos:     'Punto de Venta',
    atm:     'Cajero Automático',
    unknown: 'Desconocido',
  };

  return labels[category];
}

/**
 * Obtiene el emoji/ícono que representa una categoría de dispositivo.
 *
 * ¿Qué? Emoji unicode asociado a cada tipo de dispositivo.
 * ¿Para qué? Renderizado rápido sin depender de librerías de íconos.
 *
 * NOTE: Cuando se implemente el diseño final, estos emojis serán reemplazados
 *       por íconos de `lucide-react` en el componente `DeviceIcon`.
 *
 * @param category - Categoría del dispositivo.
 * @returns Emoji unicode.
 *
 * @example
 * getDeviceCategoryEmoji('mobile')  // "📱"
 * getDeviceCategoryEmoji('atm')     // "🏧"
 */
export function getDeviceCategoryEmoji(category: DeviceCategory): string {
  const emojis: Record<DeviceCategory, string> = {
    mobile:  '📱',
    tablet:  '📱',
    desktop: '💻',
    pos:     '💳',
    atm:     '🏧',
    unknown: '❓',
  };

  return emojis[category];
}

/**
 * Wrapper que obtiene el emoji directamente desde el tipo de dispositivo.
 *
 * @param typeString - Tipo de dispositivo.
 * @returns Emoji unicode.
 */
export function getDeviceEmoji(typeString: string | null | undefined): string {
  return getDeviceCategoryEmoji(getDeviceCategory(typeString));
}

// ==============================================================================
// DETECCIÓN DE SISTEMA OPERATIVO
// ==============================================================================

/**
 * Categorías de sistemas operativos.
 */
export type OperatingSystemCategory =
  | 'ios'
  | 'android'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'unknown';

/**
 * Clasifica un sistema operativo a partir de su nombre.
 *
 * @param osString - String del sistema operativo.
 * @returns Categoría del OS.
 *
 */
export function getOSCategory(osString: string | null | undefined): OperatingSystemCategory {
  if (!osString) return 'unknown';

  const value = String(osString).toLowerCase().trim();

  if (value.includes('ios') || value.includes('iphone') || value.includes('ipad'))    return 'ios';
  if (value.includes('android'))                                                       return 'android';
  if (value.includes('windows') || value.includes('win '))                             return 'windows';
  if (value.includes('mac') || value.includes('darwin'))                               return 'macos';
  if (value.includes('linux') || value.includes('ubuntu') || value.includes('debian')) return 'linux';

  return 'unknown';
}

/**
 * Obtiene el label legible del sistema operativo.
 *
 * @param category - Categoría del OS.
 * @returns Label en español.
 */
export function getOSCategoryLabel(category: OperatingSystemCategory): string {
  const labels: Record<OperatingSystemCategory, string> = {
    ios:     'iOS',
    android: 'Android',
    windows: 'Windows',
    macos:   'macOS',
    linux:   'Linux',
    unknown: 'Desconocido',
  };

  return labels[category];
}

// ==============================================================================
// DETECCIÓN DE NAVEGADOR
// ==============================================================================

/**
 * Categorías de navegadores.
 */
export type BrowserCategory =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'unknown';

/**
 * Clasifica un navegador a partir de su nombre.
 *
 * @param browserString - String del navegador.
 * @returns Categoría del navegador.
 *
 */
export function getBrowserCategory(
  browserString: string | null | undefined
): BrowserCategory {
  if (!browserString) return 'unknown';

  const value = String(browserString).toLowerCase().trim();

  if (value.includes('chrome') && !value.includes('edge')) return 'chrome';
  if (value.includes('firefox'))                            return 'firefox';
  if (value.includes('safari') && !value.includes('chrome')) return 'safari';
  if (value.includes('edge'))                               return 'edge';
  if (value.includes('opera'))                              return 'opera';

  return 'unknown';
}

// ==============================================================================
// ANÁLISIS DE RIESGO DE DISPOSITIVO
// ==============================================================================

/**
 * Detecta si un dispositivo tiene características sospechosas para el modelo de riesgo.
 *
 * ¿Qué? Aplica reglas heurísticas simples para identificar dispositivos anómalos.
 * ¿Para qué? Ayudar al analista a visualizar rápidamente dispositivos que requieren
 *            atención especial en la revisión manual.
 * ¿Impacto? Solo es una ayuda visual — la decisión real de riesgo la toma el modelo IA
 *           en el backend, no esta función.
 *
 * @param device - Objeto con información del dispositivo.
 * @returns `true` si el dispositivo tiene características sospechosas.
 */
export function isSuspiciousDevice(device: {
  type?: string | null;
  operatingSystem?: string | null;
  browser?: string | null;
  firstUsedAt?: string | null;
}): boolean {
  if (!device.type || !device.operatingSystem) return true;

  if (getDeviceCategory(device.type) === 'unknown')      return true;
  if (getOSCategory(device.operatingSystem) === 'unknown') return true;

  if (device.firstUsedAt) {
    const firstUse = new Date(device.firstUsedAt).getTime();
    const now      = Date.now();
    const hoursAge = (now - firstUse) / (1000 * 60 * 60);

    if (hoursAge < 24) return true;
  }

  return false;
}

/**
 * Calcula un score simple de "confianza" del dispositivo (0-100).
 *
 * ¿Qué? Puntúa qué tan confiable parece un dispositivo según su antigüedad y datos.
 * ¿Para qué? Complementar el score del modelo IA con una métrica visual rápida.
 * ¿Impacto? NO reemplaza el modelo — es solo una heurística de UI.
 *
 * @param device - Objeto con información del dispositivo.
 * @returns Score de confianza entre 0 y 100.
 */

export function getDeviceTrustScore(device: {
  type?: string | null;
  operatingSystem?: string | null;
  browser?: string | null;
  firstUsedAt?: string | null;
  lastUsedAt?: string | null;
}): number {
  let score = 0;

  if (device.type && getDeviceCategory(device.type) !== 'unknown') {
    score += 25;
  }

  if (device.operatingSystem && getOSCategory(device.operatingSystem) !== 'unknown') {
    score += 25;
  }

  if (device.browser && getBrowserCategory(device.browser) !== 'unknown') {
    score += 25;
  }

  if (device.firstUsedAt) {
    const firstUse = new Date(device.firstUsedAt).getTime();
    const now      = Date.now();
    const daysAge  = (now - firstUse) / (1000 * 60 * 60 * 24);

    if (daysAge >= 30) score += 25;
    else if (daysAge >= 7) score += 15;
    else if (daysAge >= 1) score += 5;
  }

  return score;
}