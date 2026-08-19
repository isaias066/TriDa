// ¿Qué? Tipos e interfaces relacionados a bancos monitoreados por el sistema TriDa.
// ¿Para qué? Definir la estructura de datos de los bancos que se muestra en el
//            selector de bancos (Sidebar), asignaciones de clientes y filtros globales.
// ¿Impacto? Los cambios deben coincidir con la tabla `trida.bancos` de la BD.

// ==============================================================================
// ESTRUCTURA RAW (tal como viene del backend)
// ==============================================================================

/**
 * Estructura de un banco tal como viene del backend.
 *
 * ¿Qué? Datos completos de un banco desde la BD.
 * ¿Para qué? Consumo del endpoint `GET /api/bancos`.
 * ¿Impacto? Coincide con la tabla `trida.bancos` de la BD.
 *
 */
export interface BankRaw {
  id_banco?:      number;
  codigo?:        string;
  codigo_banco?:  string;
  nombre?:        string;
  nombre_banco?:  string;
  name?:          string;
  color?:         string;
  estado?:        boolean;
  fecha_creacion?: string;
}

// ==============================================================================
// ESTRUCTURA NORMALIZADA (para uso en el frontend)
// ==============================================================================

/**
 * Banco normalizado para uso consistente en toda la aplicación.
 *
 * ¿Qué? Versión limpia del `BankRaw` con nombres estables.
 * ¿Para qué? Consumo en Sidebar, Settings, filtros y badges.
 * ¿Impacto? El normalizer convierte `BankRaw` → `Bank` antes de usar.
 */
export interface Bank {
  id: string;
  name: string;
  color: string;
}

// ==============================================================================
// OPCIÓN ESPECIAL "TODOS LOS BANCOS"
// ==============================================================================

/**
 * ID reservado para la opción "Todos los bancos" en filtros.
 *
 * ¿Qué? Cadena literal que representa el "sin filtro de banco".
 * ¿Para qué? Cuando se selecciona esta opción, no se envía el parámetro
 *            `?banco=xxx` al backend, obteniendo todos los datos disponibles.
 * ¿Impacto? Cambiar este valor requiere actualizar toda la lógica de filtrado.
 */
export const ALL_BANKS_ID = 'all' as const;

/** Tipo del ID cuando se selecciona la opción "Todos los bancos". */
export type AllBanksId = typeof ALL_BANKS_ID;

/**
 * Tipo del banco actualmente seleccionado en el filtro global.
 * Puede ser un banco específico o "todos".
 */
export type SelectedBankId = string | AllBanksId;

/**
 * Banco especial que representa "Todos los bancos" en el selector.
 * Se agrega manualmente al inicio de la lista de bancos en el Sidebar.
 */
export const ALL_BANKS_OPTION: Bank = {
  id:    ALL_BANKS_ID,
  name:  'Todos los bancos',
  color: '#6366F1', // Color índigo por defecto
};

// ==============================================================================
// CONSTANTES POR DEFECTO
// ==============================================================================

/**
 * Color por defecto para bancos sin color asignado en la BD.
 * NOTE: Coincide con el fallback usado en el proyecto original.
 */
export const DEFAULT_BANK_COLOR = '#6366F1';

/**
 * ID del banco por defecto en la BD cuando no se especifica ninguno.
 * Coincide con el registro 'sin_asignar' (id_banco = 1).
 */
export const UNASSIGNED_BANK_ID = 'sin_asignar';