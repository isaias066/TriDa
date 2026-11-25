export function dateOnlyInBogota(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

export function dateOnlyValue(value: string | Date): string {
  return typeof value === "string"
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
}

export function isTodayOrFutureDate(value: string | Date): boolean {
  return dateOnlyValue(value) >= dateOnlyInBogota(new Date());
}
