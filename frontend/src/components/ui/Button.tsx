/**
 * ¿Qué? Componente de botón reutilizable con múltiples variantes y estados.
 * ¿Para qué? Estandarizar acciones en toda la aplicación.
 */
import React from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      icon,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-primary-contrast hover:bg-primary-hover shadow-sm shadow-primary/20",
      secondary:
        "bg-surface-hover text-text-primary hover:bg-border border border-border",
      outline:
        "border border-border text-text-primary hover:bg-surface-hover hover:border-text-muted",
      ghost:
        "text-text-secondary hover:text-text-primary hover:bg-surface-hover",
      danger:
        "bg-expense text-white hover:bg-expense/90 shadow-sm shadow-expense/20",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2 gap-2",
      lg: "text-base px-5 py-2.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-1" />
            <span>Cargando...</span>
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
