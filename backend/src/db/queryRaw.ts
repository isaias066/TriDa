import { prisma } from "./prisma.js";

export function queryRaw<T>(query: string, ...parameters: unknown[]): Promise<T> {
  const placeholders = new Set(Array.from(query.matchAll(/\$(\d+)/g), (match) => Number(match[1])));
  const maxPlaceholder = Math.max(0, ...placeholders);
  const hasMissingPlaceholder = Array.from(
    { length: maxPlaceholder },
    (_, index) => index + 1,
  ).some((placeholder) => !placeholders.has(placeholder));

  if (maxPlaceholder !== parameters.length || hasMissingPlaceholder) {
    throw new Error("La consulta SQL no coincide con sus parámetros enlazados");
  }

  // Keep raw SQL execution centralized; dynamic identifiers must be selected from a whitelist.
  return prisma.$queryRawUnsafe<T>(query, ...parameters);
}
