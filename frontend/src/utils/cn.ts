// ¿Qué? Función utilitaria para combinar clases CSS de forma limpia.
// ¿Para qué? Simplificar la construcción de className en componentes con
//            clases condicionales, variantes y props opcionales.
// ¿Impacto? Se usa en TODOS los componentes migrados a Tailwind.

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}