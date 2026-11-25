import React from "react";
import { AlertSeverity, AlertStatus } from "@/types/Alert";
import { AlertOctagon, ShieldCheck, Clock } from "lucide-react";

interface AlertBadgeProps {
  severidad?: AlertSeverity;
  estado?: AlertStatus;
}

export const AlertBadge: React.FC<AlertBadgeProps> = ({
  severidad,
  estado,
}) => {
  if (estado) {
    switch (estado) {
      case "CONFIRMADA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-risk-critical/10 text-risk-critical border border-risk-critical/20">
            <AlertOctagon className="w-3.5 h-3.5" /> Fraude Confirmado
          </span>
        );
      case "DESCARTADA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-income/10 text-income border border-income/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Legítimo (Descartada)
          </span>
        );
      case "PENDIENTE":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-risk-high/10 text-risk-high border border-risk-high/20">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
    }
  }

  if (severidad) {
    switch (severidad) {
      case "CRITICA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-risk-critical/20 text-risk-critical border border-risk-critical/30">
            Crítica
          </span>
        );
      case "ALTA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-risk-high/20 text-risk-high border border-risk-high/30">
            Alta
          </span>
        );
      case "MEDIA":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-risk-medium/10 text-risk-medium border border-risk-medium/20">
            Media
          </span>
        );
      case "BAJA":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Baja
          </span>
        );
    }
  }

  return null;
};
