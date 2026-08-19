// ¿Qué? Funciones que convierten datos crudos del backend (formato snake_case, español)
//        al formato normalizado del frontend (camelCase, inglés, tipos estrictos).
// ¿Para qué? Centralizar TODA la lógica de normalización que estaba dispersa en 6+ componentes.
// ¿Impacto? Cualquier cambio en la estructura del backend se refleja aquí y se propaga
//           automáticamente a toda la aplicación.

import {
  DEFAULT_BANK_COLOR,
  UNASSIGNED_BANK_ID,
  hasValidCoordinates,
  type Alert,
  type AlertRaw,
  type Bank,
  type BankRaw,
  type BankClient,
  type BankClientRaw,
  type Device,
  type DeviceRaw,
  type Location,
  type LocationRaw,
  type SystemUser,
  type SystemUserRaw,
  type Transaction,
  type TransactionRaw,
  type RecentAlert,
} from '@app-types';

import {
  getRiskLevel,
  getRiskColorFromScore,
  mapCriticalityRawToLevel,
  mapAlertStatusRaw,
  mapTransactionStatusRaw,
} from './Risk';

import { getDeviceCategory } from './Device';
import { getInitials } from './User';

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/** Convierte cualquier valor a número seguro (con fallback a 0). */
function toNumber(value: unknown, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const n = typeof value === 'string' ? parseFloat(value) : Number(value);
  return isNaN(n) ? fallback : n;
}

/** Construye el objeto de banco embebido en otros normalizers. */
function buildBankInfo(
  name?: string | null,
  id?: string | null,
  color?: string | null
): Bank {
  return {
    id:    id    ?? UNASSIGNED_BANK_ID,
    name:  name  ?? 'Sin banco',
    color: color ?? DEFAULT_BANK_COLOR,
  };
}

// ==============================================================================
// NORMALIZERS — BANCOS
// ==============================================================================

/**
 * Normaliza un banco desde el backend al formato del frontend.
 *
 * ¿Qué? Convierte `BankRaw` con múltiples nombres de campo posibles a `Bank` estable.
 * ¿Para qué? Reemplaza la lógica que estaba en `store/context.js`.
 *
 * @param raw - Banco tal como viene del backend.
 * @returns Banco normalizado.
 */
export function normalizeBank(raw: BankRaw): Bank {
  return {
    id:    raw.codigo ?? raw.codigo_banco ?? String(raw.id_banco ?? UNASSIGNED_BANK_ID),
    name:  raw.nombre ?? raw.nombre_banco ?? raw.name ?? 'Sin nombre',
    color: raw.color ?? DEFAULT_BANK_COLOR,
  };
}

/** Normaliza un array de bancos. */
export function normalizeBanks(rawList: BankRaw[]): Bank[] {
  return (rawList ?? []).map(normalizeBank);
}

// ==============================================================================
// NORMALIZERS — USUARIOS DEL SISTEMA
// ==============================================================================

/**
 * Normaliza un usuario del sistema desde el backend.
 *
 * ¿Qué? Convierte `SystemUserRaw` (BD) a `SystemUser` (frontend).
 * ¿Para qué? Reemplaza la normalización inline en `settings.jsx`.
 *
 * @param raw - Usuario tal como viene del backend.
 * @returns Usuario normalizado.
 */
export function normalizeSystemUser(raw: SystemUserRaw): SystemUser {
  const name = raw.nombre_completo ?? 'Usuario sin nombre';

  return {
    id:        raw.id_usuario,
    name,
    email:     raw.email,
    role:      raw.rol,
    status:    raw.estado ? 'active' : 'inactive',
    avatar:    getInitials(name),
    createdAt: raw.fecha_creacion,
    lastLogin: raw.ultimo_acceso,
    createdBy: raw.id_usuario_generador,
  };
}

/** Normaliza un array de usuarios del sistema. */
export function normalizeSystemUsers(rawList: SystemUserRaw[]): SystemUser[] {
  return (rawList ?? []).map(normalizeSystemUser);
}

// ==============================================================================
// NORMALIZERS — CLIENTES BANCARIOS
// ==============================================================================

/**
 * Normaliza un cliente bancario desde el backend.
 *
 * ¿Qué? Convierte `BankClientRaw` a `BankClient` con estructura anidada.
 * ¿Para qué? Reemplaza `normalizeClientes()` de `users.jsx`.
 *
 * NOTE: Ya no se genera riesgo con Math.random() (bug del proyecto original).
 *       Si el backend no envía el riesgo real, se muestra 0 y se marca como pendiente.
 *
 * @param raw - Cliente tal como viene del backend.
 * @returns Cliente normalizado.
 */
export function normalizeBankClient(raw: BankClientRaw): BankClient {
  const name = raw.nombre_completo ?? 'Cliente sin nombre';

  return {
    id:           raw.id_cliente,
    name,
    email:        raw.email ?? 'sin-correo@dominio.com',
    phone:        raw.telefono ?? 'N/D',
    country:      raw.pais ?? 'N/D',
    city:         raw.ciudad ?? 'N/D',
    avatar:       getInitials(name),
    status:       raw.estado ? 'active' : 'inactive',
    registeredAt: raw.fecha_registro,
    bank:         buildBankInfo(raw.banco, raw.banco_codigo, raw.banco_color),
    riskScore:    toNumber(raw.riesgo, 0),
  };
}

/** Normaliza un array de clientes bancarios. */
export function normalizeBankClients(rawList: BankClientRaw[]): BankClient[] {
  return (rawList ?? []).map(normalizeBankClient);
}

// ==============================================================================
// NORMALIZERS — DISPOSITIVOS
// ==============================================================================

/**
 * Normaliza un dispositivo desde el backend.
 *
 * ¿Qué? Convierte `DeviceRaw` a `Device` con categoría clasificada.
 * ¿Para qué? Reemplaza `normalizeDispositivos()` de `users.jsx`.
 *
 * @param raw - Dispositivo tal como viene del backend.
 * @returns Dispositivo normalizado.
 */
export function normalizeDevice(raw: DeviceRaw): Device {
  const type = raw.tipo_dispositivo ?? 'Desconocido';

  return {
    id:              String(raw.id_dispositivo ?? ''),
    clientId:        raw.id_cliente ?? 0,
    clientName:      raw.cliente ?? 'Sin cliente',
    type,
    category:        getDeviceCategory(type),
    operatingSystem: raw.sistema_operativo ?? 'N/D',
    browser:         raw.navegador ?? 'N/D',
    fingerprint:     raw.identificador_unico ?? '',
    firstUsedAt:     raw.fecha_primer_uso ?? null,
    lastUsedAt:      raw.fecha_ultimo_uso ?? null,
    bank:            buildBankInfo(raw.banco, raw.banco_codigo, raw.banco_color),
  };
}

/** Normaliza un array de dispositivos. */
export function normalizeDevices(rawList: DeviceRaw[]): Device[] {
  return (rawList ?? []).map(normalizeDevice);
}

// ==============================================================================
// NORMALIZERS — UBICACIONES
// ==============================================================================

/**
 * Normaliza una ubicación desde el backend.
 *
 * ¿Qué? Convierte `LocationRaw` a `Location` con coordenadas validadas.
 * ¿Para qué? Consumo en el mapa y en detalles de transacciones.
 *
 * @param raw - Ubicación tal como viene del backend.
 * @returns Ubicación normalizada.
 */
export function normalizeLocation(raw: LocationRaw): Location {
  const lat = toNumber(raw.latitud, 0);
  const lng = toNumber(raw.longitud, 0);

  return {
    id:           raw.id_ubicacion ?? 0,
    latitude:     lat,
    longitude:    lng,
    city:         raw.ciudad ?? 'Desconocida',
    country:      raw.pais ?? 'N/D',
    ipAddress:    raw.direccion_ip ?? '',
    registeredAt: raw.fecha_registro ?? '',
  };
}

/** Normaliza un array de ubicaciones filtrando las que tengan coordenadas inválidas. */
export function normalizeLocations(rawList: LocationRaw[]): Location[] {
  return (rawList ?? [])
    .filter(raw => hasValidCoordinates(raw.latitud, raw.longitud))
    .map(normalizeLocation);
}

// ==============================================================================
// NORMALIZERS — TRANSACCIONES
// ==============================================================================

/**
 * Normaliza una transacción desde el backend.
 *
 * ¿Qué? Convierte `TransactionRaw` a `Transaction` completo con nivel de riesgo calculado.
 * ¿Para qué? Reemplaza `normalize()` de `transactions.jsx` y lógica inline de otros archivos.
 * ¿Impacto? Fuente única de verdad para toda la app.
 *
 * @param raw - Transacción tal como viene del backend.
 * @returns Transacción normalizada.
 */
export function normalizeTransaction(raw: TransactionRaw): Transaction {
  const score = toNumber(raw.score_riesgo, 0);
  const level = getRiskLevel(score);

  return {
    id:             String(raw.id_transaccion),
    timestamp:      raw.fecha_transaccion ?? null,
    user:           raw.cliente ?? raw.nombre_completo ?? 'Desconocido',
    account:        raw.cuenta ?? raw.cuenta_origen ?? 'N/D',
    type:           raw.tipo_transaccion ?? 'Sin tipo',
    amount:         toNumber(raw.monto),
    currency:       raw.moneda ?? 'COP',
    riskScore:      score,
    alertLevel:     level,
    status:         mapTransactionStatusRaw(raw.estado_transaccion),
    isFraud:        raw.es_fraude_real ?? false,
    processingTime: toNumber(raw.tiempo_de_procesamiento ?? raw.tiempo_proceso),
    channel:        raw.canal ?? 'web',
    bank:           buildBankInfo(raw.banco, raw.banco_codigo, raw.banco_color ?? raw.color_banco),
    location: {
      city:      raw.ciudad ?? 'N/D',
      latitude:  raw.latitud !== undefined ? toNumber(raw.latitud) : null,
      longitude: raw.longitud !== undefined ? toNumber(raw.longitud) : null,
    },
    device: {
      type: raw.tipo_dispositivo ?? 'Desconocido',
    },
  };
}

/** Normaliza un array de transacciones. */
export function normalizeTransactions(rawList: TransactionRaw[]): Transaction[] {
  return (rawList ?? []).map(normalizeTransaction);
}

// ==============================================================================
// NORMALIZERS — ALERTAS
// ==============================================================================

/**
 * Normaliza una alerta desde el backend.
 *
 * ¿Qué? Convierte `AlertRaw` a `Alert` completo con nivel y estados normalizados.
 * ¿Para qué? Reemplaza `normalizeAlert()` de `alerts.jsx`.
 *
 * @param raw - Alerta tal como viene del backend.
 * @returns Alerta normalizada.
 */
export function normalizeAlert(raw: AlertRaw): Alert {
  const score = toNumber(raw.score_riesgo, 0);

  // Determina nivel: usa el del backend si existe, si no lo calcula del score
  const level = raw.nivel_criticidad
    ? mapCriticalityRawToLevel(raw.nivel_criticidad)
    : getRiskLevel(score);

  const transactionStatus = mapTransactionStatusRaw(raw.estado_transaccion);

  return {
    id:          String(raw.id_alerta),
    timestamp:   raw.fecha_generacion ?? raw.fecha ?? raw.timestamp ?? new Date().toISOString(),
    user:        raw.cliente ?? 'Usuario Desconocido',
    account:     raw.cuenta ?? 'N/D',
    type:        raw.tipo_transaccion ?? raw.tipo ?? 'Actividad Inusual',
    amount:      toNumber(raw.monto),
    riskScore:   score,
    alertLevel:  level,
    alertStatus: mapAlertStatusRaw(raw.estado_alerta),
    status:      transactionStatus,
    priority:    toNumber(raw.prioridad, 1),
    factors:     raw.factores_sospechosos ?? raw.descripcion ?? raw.mensaje ?? null,
    isFraud:     level === 'critical' || transactionStatus === 'blocked',
    channel:     raw.canal ?? 'web',
    bank:        buildBankInfo(raw.banco, raw.banco_codigo, raw.banco_color),
    location: {
      city: raw.ciudad ?? 'Desconocida',
    },
    device: {
      type: raw.dispositivo ?? 'Desconocido',
    },
  };
}

/** Normaliza un array de alertas. */
export function normalizeAlerts(rawList: AlertRaw[]): Alert[] {
  return (rawList ?? []).map(normalizeAlert);
}

/**
 * Normaliza una alerta al formato simplificado para el Dashboard.
 *
 * ¿Qué? Extrae solo los datos mínimos necesarios para el panel "Alertas Recientes".
 * ¿Para qué? Consumo en Dashboard (evita cargar toda la info de la alerta).
 *
 * @param raw - Alerta tal como viene del backend.
 * @returns Alerta simplificada.
 */
export function normalizeRecentAlert(raw: AlertRaw): RecentAlert {
  const score = toNumber(raw.score_riesgo, 0);
  const level = raw.nivel_criticidad
    ? mapCriticalityRawToLevel(raw.nivel_criticidad)
    : getRiskLevel(score);

  return {
    id:          String(raw.id_alerta),
    timestamp:   raw.fecha_generacion ?? raw.fecha ?? raw.timestamp ?? new Date().toISOString(),
    description: raw.descripcion ?? raw.mensaje ?? raw.factores_sospechosos ?? 'Actividad sospechosa detectada',
    amount:      raw.monto !== undefined ? toNumber(raw.monto) : null,
    origin:      raw.origen ?? raw.tipo ?? raw.categoria ?? null,
    level,
    color:       getRiskColorFromScore(score),
  };
}

/** Normaliza un array de alertas recientes. */
export function normalizeRecentAlerts(rawList: AlertRaw[]): RecentAlert[] {
  return (rawList ?? []).map(normalizeRecentAlert);
}