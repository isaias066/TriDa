// ¿Qué? Tipos e interfaces relacionados a ubicaciones geográficas en TriDa.
// ¿Para qué? Definir la estructura de datos de las ubicaciones registradas
//            desde las que se realizan transacciones (mapa, agregaciones, geolocalización).
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.historico_de_ubicacion`
//           y los constraints de latitud/longitud.

// ==============================================================================
// CONSTANTES DE VALIDACIÓN
// ==============================================================================

/**
 * Rangos válidos de coordenadas según constraints de la BD.
 */
export const COORDINATE_LIMITS = {
  LATITUDE_MIN:  -90,
  LATITUDE_MAX:   90,
  LONGITUDE_MIN: -180,
  LONGITUDE_MAX:  180,
} as const;


export const DEFAULT_COORDINATES = {
  latitude:  4.6097,
  longitude: -74.0817,
} as const;

// ==============================================================================
// ESTRUCTURA RAW (tal como viene del backend)
// ==============================================================================

/**
 * Estructura de una ubicación tal como viene del backend.
 *
 * ¿Qué? Datos completos de un registro de ubicación desde la BD.
 * ¿Para qué? Consumo de endpoints que retornan ubicaciones (mapa, transacciones).
 * ¿Impacto? Coincide con la tabla `trida.historico_de_ubicacion`.
 *
 * NOTE: Los campos vienen en snake_case (columnas de la BD).
 *       Las coordenadas pueden venir como string o number según el driver.
 */
export interface LocationRaw {
  id_ubicacion?:    number;
  id_dispositivo?:  number;
  direccion_ip?:    string;
  pais?:            string;
  ciudad?:          string;
  latitud?:         number | string | null;
  longitud?:        number | string | null;
  fecha_registro?:  string;
}

// ==============================================================================
// ESTRUCTURAS NORMALIZADAS (para uso en el frontend)
// ==============================================================================

/**
 * Ubicación geográfica completa con coordenadas.
 *
 * ¿Qué? Punto geográfico validado para renderizar en el mapa.
 * ¿Para qué? Consumo en `TransactionMap` para marcadores y popups.
 * ¿Impacto? Solo se muestran en el mapa las ubicaciones con lat/lng válidas.
 */
export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  ipAddress: string;
  registeredAt: string;
}

/**
 * Información textual de ubicación sin coordenadas.
 *
 * ¿Qué? Datos de ubicación cuando solo se necesita mostrar texto.
 * ¿Para qué? Consumo en cards de cliente, filas de tabla, badges.
 * ¿Impacto? Alternativa ligera a `Location` cuando no se requiere el mapa.
 */
export interface LocationInfo {
  city: string;
  country: string;
}

/**
 * Coordenadas geográficas básicas.
 *
 * ¿Qué? Solo latitud y longitud.
 * ¿Para qué? Uso en cálculos de distancia y agrupación de puntos.
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// ==============================================================================
// AGREGACIONES POR CIUDAD
// ==============================================================================

/**
 * Estadísticas agregadas de una ciudad.
 *
 * ¿Qué? Cantidad de transacciones y fraudes registrados en una ciudad.
 * ¿Para qué? Consumo en Analytics y ranking de ciudades más activas.
 * ¿Impacto? Se calcula desde el backend en `/api/analytics/agregaciones`.
 */
export interface CityStats {
  city: string;
  country: string;
  transactionCount: number;
  fraudCount: number;
  totalAmount?: number;
}

/**
 * Estructura raw de una agregación por ciudad desde el backend.
 */
export interface CityStatsRaw {
  ciudad?:   string;
  city?:     string;
  nombre?:   string;
  pais?:     string;
  country?:  string;
  count?:    number;
  cantidad?: number;
  total?:    number;
  fraud?:    number;
  fraude?:   number;
  fraudes?:  number;
  amount?:   number;
  monto?:    number;
}

// ==============================================================================
// PUNTOS DEL MAPA
// ==============================================================================

/**
 * Punto en el mapa asociado a una transacción.
 *
 * ¿Qué? Ubicación con datos mínimos de la transacción para renderizar en el mapa.
 * ¿Para qué? Consumo en `TransactionMap` para marcadores con popup.
 * ¿Impacto? Se filtran las ubicaciones inválidas antes de renderizar.
 */
export interface MapPoint {
  id: string;
  coordinates: Coordinates;
  city: string;
  riskLevel: string;
  color: string;
  size: number;
}

// ==============================================================================
// FUNCIONES UTILITARIAS DE VALIDACIÓN
// ==============================================================================

/**
 * Verifica si una latitud es válida.
 *
 * @param lat - Latitud a validar.
 * @returns `true` si está en el rango [-90, 90].
 */
export function isValidLatitude(lat: number | string | null | undefined): lat is number {
  const n = typeof lat === 'string' ? parseFloat(lat) : lat;
  return (
    typeof n === 'number' &&
    !isNaN(n) &&
    n >= COORDINATE_LIMITS.LATITUDE_MIN &&
    n <= COORDINATE_LIMITS.LATITUDE_MAX
  );
}

/**
 * Verifica si una longitud es válida.
 *
 * @param lng - Longitud a validar.
 * @returns `true` si está en el rango [-180, 180].
 */
export function isValidLongitude(lng: number | string | null | undefined): lng is number {
  const n = typeof lng === 'string' ? parseFloat(lng) : lng;
  return (
    typeof n === 'number' &&
    !isNaN(n) &&
    n >= COORDINATE_LIMITS.LONGITUDE_MIN &&
    n <= COORDINATE_LIMITS.LONGITUDE_MAX
  );
}

/**
 * Verifica si un par de coordenadas es válido y NO es (0, 0).
 *
 * ¿Qué? Filtro combinado de validación.
 * ¿Para qué? Excluir del mapa ubicaciones sin datos reales
 *            (muchas veces vienen como 0,0 cuando faltan).
 * ¿Impacto? Se usa antes de renderizar puntos en `TransactionMap`.
 *
 * @param lat - Latitud.
 * @param lng - Longitud.
 * @returns `true` si el par de coordenadas es válido y no es el origen.
 */
export function hasValidCoordinates(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined
): boolean {
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) return false;
  const nLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const nLng = typeof lng === 'string' ? parseFloat(lng) : lng;
  return !(nLat === 0 && nLng === 0);
}