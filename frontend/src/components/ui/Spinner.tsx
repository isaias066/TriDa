/**
 * ¿Qué? Indicador visual de carga animado.
 * ¿Para qué? Mostrar estados de espera en botones, tarjetas y pantallas.
 */
import React from "react";
import { cn } from "@/utils/cn";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-3",
  xl: "w-12 h-12 border-4",
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Cargando..."
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-current border-t-transparent",
          sizeClasses[size],
        )}
      />
      <span className="sr-only">Cargando...</span>
    </div>
  );
};
