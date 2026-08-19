// ¿Qué? Componente de botón reutilizable con variantes de color, tamaño e íconos.
// ¿Para qué? Estandarizar todos los botones del sistema con clases Tailwind.
// ¿Impacto? Cualquier botón del sistema debe usar este componente, garantizando
//           consistencia visual, accesibilidad y comportamiento.

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Spinner } from './Spinner';
import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Variantes de color del botón. */
export type ButtonVariant =
  | 'primary'    // Acción principal (índigo / azul acero según tema)
  | 'secondary'  // Acción secundaria (gris)
  | 'danger'     // Acción destructiva (rojo / coral)
  | 'success'    // Acción positiva (verde)
  | 'ghost'      // Sin fondo (transparente)
  | 'outline';   // Solo borde

/** Tamaños disponibles del botón. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/** Props del Button. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

// ==============================================================================
// CLASES POR VARIANTE
// ==============================================================================

/**
 * Cada variante define colores de fondo, texto, borde y hover.
 * Se usan variables CSS para que los colores cambien con el tema automáticamente.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-primary)] text-white',
    'border border-[var(--color-primary)]',
    'hover:bg-[var(--color-primary-hover)]',
  ].join(' '),

  secondary: [
    'bg-[var(--bg-tertiary)] text-[var(--text-primary)]',
    'border border-[var(--border-strong)]',
    'hover:bg-[var(--bg-elevated)]',
  ].join(' '),

  danger: [
    'bg-[var(--color-danger)] text-white',
    'border border-[var(--color-danger)]',
    'hover:opacity-90',
  ].join(' '),

  success: [
    'bg-[var(--color-success)] text-white',
    'border border-[var(--color-success)]',
    'hover:opacity-90',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--text-primary)]',
    'border border-transparent',
    'hover:bg-[var(--bg-tertiary)]',
  ].join(' '),

  outline: [
    'bg-transparent text-[var(--color-primary)]',
    'border border-[var(--color-primary)]',
    'hover:bg-[var(--color-primary)]/10',
  ].join(' '),
};

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================

/**
 * Cada tamaño define padding, font-size, gap entre ícono y texto, y altura.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 h-[30px]',
  md: 'px-4 py-2 text-[13px] gap-2 h-9',
  lg: 'px-5 py-2.5 text-sm gap-2.5 h-[42px]',
};

/**
 * Tamaño del spinner según el tamaño del botón.
 */
const SPINNER_SIZE: Record<ButtonSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    // Spinner blanco para botones con fondo, primary para ghost/outline
    const spinnerVariant =
      variant === 'ghost' || variant === 'outline' ? 'primary' : 'white';

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base — estructura y tipografía
          'inline-flex items-center justify-center',
          'font-semibold font-sans rounded-lg',
          'transition-all duration-150',
          'whitespace-nowrap select-none',

          // Tamaño
          SIZE_CLASSES[size],

          // Variante de color
          VARIANT_CLASSES[variant],

          // Estados
          isDisabled && 'opacity-50 cursor-not-allowed',
          !isDisabled && 'cursor-pointer',

          // Ancho completo
          fullWidth && 'w-full',

          // Clase externa (permite sobreescribir desde el padre)
          className
        )}
        aria-busy={loading}
        {...rest}
      >
        {/* Spinner cuando loading (reemplaza leftIcon) */}
        {loading && (
          <Spinner size={SPINNER_SIZE[size]} variant={spinnerVariant} />
        )}

        {/* Ícono izquierdo (solo si no está loading) */}
        {!loading && leftIcon && (
          <span className="inline-flex shrink-0">{leftIcon}</span>
        )}

        {/* Texto del botón */}
        {children && <span>{children}</span>}

        {/* Ícono derecho (solo si no está loading) */}
        {!loading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';