// ¿Qué? Tipos e interfaces relacionados a dispositivos registrados en el sistema TriDa.
// ¿Para qué? Definir la estructura de datos de los dispositivos usados por clientes
//            bancarios para realizar transacciones (móviles, computadoras, POS, ATMs).
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.dispositivos` de la BD.

// ==============================================================================
// TIPOS DE CATEGORÍAS DE DISPOSITIVOS
// ==============================================================================

/**
 * Categorías generales de dispositivos.
 *
 * ¿Qué? Clasificación por tipo físico de dispositivo.
 * ¿Para qué? Renderizar iconos y agrupar dispositivos en estadísticas.
 * ¿Impacto? El helper `getDeviceCategory()` mapea strings variables a estos valores.
 */
export type DeviceCategory =
  | 'mobile'
  | 'desktop'
  | 'tablet'
  | 'pos'
  | 'atm'
  | 'unknown';

/**
 * Palabras clave usadas para detectar dispositivos móviles.
 * NOTE: Extraído del helper `isMobile()` de users.jsx.
 */
export const MOBILE_KEYWORDS: readonly string[] = [
  'iphone',
  'galaxy',
  'pixel',
  'redmi',
  'huawei',
  'mobile',
  'android',
  'celular',
  'smartphone',
] as const;

/**
 * Palabras clave usadas para detectar tablets.
 */
export const TABLET_KEYWORDS: readonly string[] = [
  'ipad',
  'tablet',
  'tab',
  'galaxy tab',
] as const;

// ==============================================================================
// ESTRUCTURA RAW (tal como viene del backend)
// ==============================================================================

/**
 * Estructura de un dispositivo tal como viene del backend.
 *
 * ¿Qué? Datos completos de un dispositivo desde la BD.
 * ¿Para qué? Consumo del endpoint `GET /api/dispositivos`.
 * ¿Impacto? Coincide con la tabla `trida.dispositivos` y sus joins.
 *
 */
export interface DeviceRaw {
  id_dispositivo?:      number | string;
  id_cliente?:          number;
  tipo_dispositivo?:    string;
  identificador_unico?: string;
  sistema_operativo?:   string;
  navegador?:           string;
  fecha_primer_uso?:    string;
  fecha_ultimo_uso?:    string;

  cliente?:      string;   
  banco?:        string;   
  banco_codigo?: string;   
  banco_color?: string;   
}

// ==============================================================================
// ESTRUCTURA NORMALIZADA (para uso en el frontend)
// ==============================================================================

/**
 * Dispositivo normalizado para uso consistente en toda la aplicación.
 *
 * ¿Qué? Versión limpia de `DeviceRaw` con estructura anidada y en inglés.
 * ¿Para qué? Consumo en la página Users (tab de dispositivos) y en detalles.
 * ¿Impacto? El normalizer convierte `DeviceRaw` → `Device` antes de usar.
 */
export interface Device {
  id: string;
  clientId: number;
  clientName: string;
  type: string;
  category: DeviceCategory;
  operatingSystem: string;
  browser: string;
  fingerprint: string;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  bank: {
    id:    string;
    name:  string;
    color: string;
  };
}

// ==============================================================================
// AGRUPACIONES Y ESTADÍSTICAS
// ==============================================================================

/**
 * Dispositivos agrupados por cliente.
 *
 * ¿Qué? Mapa de ID de cliente a la lista de sus dispositivos.
 * ¿Para qué? Renderizar los dispositivos dentro de la card de cada cliente.
 * ¿Impacto? Se usa en la página Users al expandir un cliente.
 */
export type DevicesByClient = Map<number, Device[]>;

/**
 * Estadísticas de dispositivos por categoría.
 *
 * ¿Qué? Contadores agregados por tipo de dispositivo.
 * ¿Para qué? Consumo en gráficos de Analytics y cards del Dashboard.
 */
export interface DeviceStats {
  /** Total de dispositivos. */
  total: number;
  /** Total por categoría. */
  byCategory: Record<DeviceCategory, number>;
  /** Cantidad de clientes únicos con al menos un dispositivo. */
  uniqueClients: number;
}

// ==============================================================================
// FILTROS
// ==============================================================================

/**
 * Filtros aplicables a la lista de dispositivos.
 */
export interface DeviceFilters {
  /** Filtro por categoría de dispositivo. */
  category?: DeviceCategory | 'all';
  /** Filtro por código de banco. */
  bankId?: string;
  /** Búsqueda de texto libre (cliente, OS, navegador). */
  search?: string;
}