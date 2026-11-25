/**
 * ¿Qué? Etiqueta de estado de pequeño tamaño.
 * ¿Para qué? Mostrar tipos, niveles de riesgo, estados y categorías.
 */
import React from "react";
import { cn } from "@/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "outline";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "md",
  ...props
}) => {
  const variants = {
    default: "bg-surface-hover text-text-secondary border-border",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-income/10 text-income border-income/20",
    danger: "bg-expense/10 text-expense border-expense/20",
    warning: "bg-budget-warn/10 text-budget-warn border-budget-warn/20",
    info: "bg-saving/10 text-saving border-saving/20",
    outline: "border-border text-text-primary bg-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide uppercase",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};
