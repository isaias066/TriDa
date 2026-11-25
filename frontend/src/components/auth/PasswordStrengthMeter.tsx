/**
 * ¿Qué? Medidor de fortaleza de contraseña.
 * ¿Para qué? Dar retroalimentación visual al usuario en tiempo real según las reglas de seguridad de TriDa (RS-003).
 */
import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { getPasswordChecks } from "@/utils/Password";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  const passwordChecks = getPasswordChecks(password);
  const checks = [
    {
      label: "Mínimo 12 caracteres",
      valid: passwordChecks.minLength,
    },
    {
      label: "Máximo 72 caracteres",
      valid: passwordChecks.maxLength,
    },
    {
      label: "Al menos una mayúscula (A-Z)",
      valid: passwordChecks.hasUpper,
    },
    {
      label: "Al menos una minúscula (a-z)",
      valid: passwordChecks.hasLower,
    },
    {
      label: "Al menos un carácter especial",
      valid: passwordChecks.hasSpecial,
    },
  ];

  const passedCount = checks.filter((c) => c.valid).length;

  const getStrengthColor = () => {
    if (passedCount <= 1) return "bg-expense";
    if (passedCount < checks.length) return "bg-budget-warn";
    return "bg-income";
  };

  const getStrengthText = () => {
    if (passedCount === 0) return "Vacía";
    if (passedCount <= 2) return "Débil";
    if (passedCount < checks.length) return "Casi lista";
    return "Válida";
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2 rounded-lg bg-surface-hover p-3 border border-border">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">Seguridad de la contraseña:</span>
        <span className="font-semibold text-text-primary">
          {getStrengthText()}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={cn(
            "h-full transition-all duration-300",
            getStrengthColor(),
          )}
          style={{ width: `${(passedCount / checks.length) * 100}%` }}
        />
      </div>

      {/* Lista de criterios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-1.5 text-[11px]">
            {check.valid ? (
              <Check className="h-3.5 w-3.5 text-income shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-text-muted shrink-0" />
            )}
            <span
              className={
                check.valid
                  ? "text-text-primary font-medium"
                  : "text-text-muted"
              }
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
