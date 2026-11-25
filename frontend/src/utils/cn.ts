import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ¿Qué? Combina condicionalmente clases CSS y resuelve conflictos de Tailwind.
 * ¿Para qué? Evitar duplicidad o sobreescrituras en clases dinámicas.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
