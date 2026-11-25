/**
 * RF-001: Formatea montos de dinero de acuerdo a la moneda especificada.
 */
export function formatCurrency(
  amount: number | string,
  currency = "COP",
  locale = "es-CO",
): string {
  const numericAmount =
    typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(numericAmount)) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: currency === "COP" ? 0 : 2,
      maximumFractionDigits: currency === "COP" ? 0 : 2,
    }).format(0);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "COP" ? 0 : 2,
    maximumFractionDigits: currency === "COP" ? 0 : 2,
  }).format(numericAmount);
}

/**
 * RF-002: Formatea fechas UTC (TIMESTAMPTZ) a la zona horaria local (America/Bogota por defecto).
 */
export function formatDate(
  dateInput: string | Date,
  formatStyle: "full" | "short" | "time" | "relative" = "short",
): string {
  if (!dateInput) return "-";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) return "-";

  const timeZone = "America/Bogota";

  if (formatStyle === "time") {
    return new Intl.DateTimeFormat("es-CO", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  if (formatStyle === "full") {
    return new Intl.DateTimeFormat("es-CO", {
      timeZone,
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  }

  // FormatStyle === 'short'
  return new Intl.DateTimeFormat("es-CO", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateOnly(dateInput: string | Date): string {
  const value =
    dateInput instanceof Date
      ? `${dateInput.getUTCFullYear()}-${String(dateInput.getUTCMonth() + 1).padStart(2, "0")}-${String(dateInput.getUTCDate()).padStart(2, "0")}`
      : dateInput.slice(0, 10);
  const date = new Date(`${value}T00:00:00.000Z`);

  if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * DF-002: Mascaras de privacidad para datos sensibles.
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.substring(0, 2)}***@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return "***";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 4) return "***";
  return `*** *** ${cleaned.slice(-4)}`;
}

export function maskCardNumber(cardNumber?: string | null): string {
  if (!cardNumber) return "•••• ••••";
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `•••• ${digits.slice(-4)}`;
}
