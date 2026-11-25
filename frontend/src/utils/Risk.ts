import { NivelRiesgo } from "@/types/Transaction";

/**
 * Devuelve las clases CSS de Tailwind según el nivel de riesgo.
 */
export const getRiskBadgeClass = (nivel?: NivelRiesgo | null): string => {
  switch (nivel) {
    case "CRITICO":
      return "bg-risk-critical/10 text-risk-critical border-risk-critical/20";
    case "ALTO":
      return "bg-risk-high/10 text-risk-high border-risk-high/20";
    case "MEDIO":
      return "bg-risk-medium/10 text-risk-medium border-risk-medium/20";
    case "BAJO":
    default:
      return "bg-risk-low/10 text-risk-low border-risk-low/20";
  }
};

/**
 * Devuelve el texto descriptivo en español según el nivel de riesgo.
 */
export const getRiskLabel = (nivel?: NivelRiesgo | null): string => {
  switch (nivel) {
    case "CRITICO":
      return "Riesgo Crítico";
    case "ALTO":
      return "Riesgo Alto";
    case "MEDIO":
      return "Riesgo Medio";
    case "BAJO":
      return "Riesgo Bajo";
    default:
      return "Riesgo Bajo";
  }
};
