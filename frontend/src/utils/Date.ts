export const APP_TIMEZONE = "America/Bogota";

export function dateOnlyInBogota(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function monthStartDateInBogota(date: Date, monthOffset = 0): string {
  const [year, month] = dateOnlyInBogota(date).split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1 + monthOffset, 1));
  const monthNumber = String(start.getUTCMonth() + 1).padStart(2, "0");
  return `${start.getUTCFullYear()}-${monthNumber}-01`;
}

export function startOfMonthInBogota(date: Date): Date {
  const dateOnly = dateOnlyInBogota(date);
  const [year, month] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, 1);
}
