import React from "react";
import { NivelRiesgo } from "@/types/Transaction";
import { getRiskBadgeClass, getRiskLabel } from "@/utils/Risk";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskBadgeProps {
  nivel?: NivelRiesgo | null;
  score?: number | null;
  esSospechosa?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  nivel,
  score,
  esSospechosa,
}) => {
  const badgeClass = getRiskBadgeClass(nivel);
  const label = getRiskLabel(nivel);

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${badgeClass}`}
      >
        {esSospechosa || (nivel && nivel !== "BAJO") ? (
          <ShieldAlert className="w-3.5 h-3.5 text-inherit" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5 text-inherit" />
        )}
        {label}
      </span>
      {typeof score === "number" && (
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
          ({Math.round(score)}%)
        </span>
      )}
    </div>
  );
};
