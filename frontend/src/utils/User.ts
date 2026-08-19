// ¿Qué? Funciones utilitarias para manejo de nombres, iniciales y datos sensibles de usuarios.
// ¿Para qué? Centralizar la lógica de presentación de usuarios que estaba duplicada
//            en Sidebar, Settings y Users, y garantizar el mascarado consistente de PII.
// ¿Impacto? Todos los componentes que muestren info de usuarios usan estas funciones,
//           cumpliendo la restricción DF-002 (nunca exponer PII completa en logs/UI).

// ==============================================================================
// FORMATEO DE NOMBRES
// ==============================================================================

/**
 * Extrae las iniciales de un nombre completo.
 *
 * ¿Qué? Toma las primeras letras de las primeras palabras.
 * ¿Para qué? Generar avatars sin foto de perfil.
 * ¿Impacto? Reemplaza `getInitials()` de `sidebar.jsx` y `initials()` de `users.jsx`.
 *
 * @param fullName - Nombre completo del usuario.
 * @param maxLetters - Cantidad máxima de iniciales (default: 2).
 * @returns Iniciales en mayúscula.
 *
 */
export function getInitials(
  fullName: string | null | undefined,
  maxLetters: number = 2
): string {
  if (!fullName || typeof fullName !== 'string') return '?';

  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return '?';

  return parts
    .slice(0, maxLetters)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Extrae el primer nombre de un nombre completo.
 *
 * @param fullName - Nombre completo.
 * @returns Primer nombre.
 *
 */
export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  return fullName.trim().split(/\s+/)[0] ?? '';
}

/**
 * Extrae el nombre corto (primer nombre + primer apellido).
 *
 * ¿Qué? Toma las 2 primeras palabras del nombre completo.
 * ¿Para qué? Mostrar nombres en el Sidebar sin que ocupen mucho espacio.
 * ¿Impacto? Reemplaza `userName.split(' ').slice(0, 2).join(' ')` de `sidebar.jsx`.
 *
 * @param fullName - Nombre completo.
 * @returns Nombre corto.
 *
 */
export function getShortName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(' ');
}

/**
 * Extrae los apellidos (todas las palabras excepto la primera).
 *
 * @param fullName - Nombre completo.
 * @returns Apellidos concatenados.
 *
 */
export function getLastName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(1).join(' ');
}

/**
 * Formatea un nombre a formato "Apellido, Nombre".
 *
 * @param fullName - Nombre completo en formato "Nombre Apellido".
 * @returns Nombre en formato "Apellido, Nombre".
 *
 */
export function formatNameLastFirst(fullName: string | null | undefined): string {
  if (!fullName) return '';
  const first = getFirstName(fullName);
  const last  = getLastName(fullName);
  return last ? `${last}, ${first}` : first;
}

// ==============================================================================
// MASCARADO DE INFORMACIÓN SENSIBLE (PII) — DF-002
// ==============================================================================

/**
 * Mascara un email mostrando solo los primeros caracteres.
 *
 * ¿Qué? Oculta parte del email para no exponer datos completos.
 * ¿Para qué? Cumplir DF-002 (no exponer PII innecesaria).
 * ¿Impacto? Se usa en logs, notificaciones y confirmaciones donde no se necesita
 *           mostrar el email completo.
 *
 * @param email - Email a mascarar.
 * @param visibleChars - Cantidad de caracteres visibles al inicio (default: 3).
 * @returns Email mascarado.
 */
export function maskEmail(
  email: string | null | undefined,
  visibleChars: number = 3
): string {
  if (!email || !email.includes('@')) return '***';

  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';

  const visible = local.slice(0, Math.min(visibleChars, local.length));
  return `${visible}***@${domain}`;
}

/**
 * Mascara un número de identificación mostrando solo los últimos dígitos.
 *
 * @param id - Número de cédula/ID.
 * @param visibleDigits - Cantidad de dígitos visibles al final (default: 4).
 * @returns ID mascarado.
 */
export function maskId(
  id: string | number | null | undefined,
  visibleDigits: number = 4
): string {
  if (id === null || id === undefined) return '***';

  const str = String(id);
  if (str.length <= visibleDigits) return str;

  const masked = '*'.repeat(str.length - visibleDigits);
  return `${masked}${str.slice(-visibleDigits)}`;
}

/**
 * Mascara un número de tarjeta de crédito mostrando solo los últimos 4 dígitos.
 *
 * ¿Qué? Cumple la restricción PCI-DSS de no exponer el PAN completo.
 * ¿Para qué? Mostrar tarjetas en la UI sin comprometer seguridad.
 * ¿Impacto? Cumple RS-001 (PCI-DSS 4.0).
 *
 * @param cardNumber - Número de tarjeta.
 * @returns Tarjeta mascarada.
 */
export function maskCard(cardNumber: string | null | undefined): string {
  if (!cardNumber) return '****';

  const cleaned = cardNumber.replace(/\s+/g, '');
  const last4 = cleaned.slice(-4);
  return `****${last4}`;
}

/**
 * Mascara un número de teléfono mostrando solo los últimos 4 dígitos.
 *
 * @param phone - Número de teléfono.
 * @returns Teléfono mascarado.
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '****';

  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return digits;

  const masked = '*'.repeat(digits.length - 4);
  return `${masked}${digits.slice(-4)}`;
}

// ==============================================================================
// VALIDACIONES
// ==============================================================================

/**
 * Verifica si un string tiene formato de email válido.
 *
 * ¿Qué? Validación básica de email (no exhaustiva).
 * ¿Para qué? Validar formularios antes de enviar al backend.
 * ¿Impacto? Coincide con la validación del backend (constraint chk_clientes_email_formato).
 *
 * @param email - String a validar.
 * @returns `true` si el formato es válido.
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
}

/**
 * Verifica si un nombre tiene formato válido.
 *
 * @param name - Nombre a validar.
 * @param minLength - Longitud mínima (default: 2).
 * @param maxLength - Longitud máxima (default: 150).
 * @returns `true` si el nombre es válido.
 *
 */
export function isValidName(
  name: string | null | undefined,
  minLength: number = 2,
  maxLength: number = 150
): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

// ==============================================================================
// HELPERS DE ROLES Y ESTADOS
// ==============================================================================

/**
 * Formatea el estado de un usuario como label legible.
 *
 * @param isActive - Estado booleano del usuario.
 * @returns Label en español.
 *
 */
export function formatUserStatus(isActive: boolean | null | undefined): string {
  return isActive ? 'Activo' : 'Inactivo';
}

/**
 * Obtiene un nombre de display consistente a partir de un usuario.
 *
 * ¿Qué? Prioriza campos disponibles para obtener el mejor nombre posible.
 * ¿Para qué? Fallback seguro cuando el objeto de usuario puede tener campos vacíos.
 *
 * @param user - Objeto con campos opcionales de nombre.
 * @returns Nombre de display o "Usuario Desconocido".
 */
export function getDisplayName(user: {
  nombre?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
} | null | undefined): string {
  if (!user) return 'Usuario Desconocido';

  return (
    user.nombre ??
    user.name ??
    user.fullName ??
    user.email ??
    'Usuario Desconocido'
  );
}