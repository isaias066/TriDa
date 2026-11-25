/**
 * ¿Qué? Componente Select reutilizable estandarizado.
 */
import React, { useId } from "react";
import { cn } from "@/utils/cn";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, options, error, helperText, id, disabled, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold tracking-wide text-text-secondary uppercase"
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-label={
            props["aria-label"] ?? (label ? undefined : "Seleccionar opción")
          }
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "w-full rounded-lg bg-surface border border-border px-3.5 py-2 text-sm text-text-primary transition-all duration-200",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary",
            "disabled:opacity-50 disabled:bg-surface-hover disabled:cursor-not-allowed",
            error && "border-expense focus:border-expense focus:ring-expense",
            className,
          )}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-surface text-text-primary"
            >
              {opt.label}
            </option>
          ))}
        </select>

        {error ? (
          <p id={errorId} className="text-xs font-medium text-expense">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
