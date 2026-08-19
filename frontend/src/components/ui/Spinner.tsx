// ¿Qué? Componente de indicador de carga reutilizable con tamaños configurables.
// ¿Para qué? Indicador de carga consistente en toda la aplicación.
//            Reemplaza los múltiples spinners inline del proyecto original.
// ¿Impacto? Cualquier componente que necesite mostrar estado de carga usa este spinner.

import { cn } from '@utils/cn';

// ==============================================================================
// TYPES
// ==============================================================================

/** Tamaños disponibles del spinner. */
export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

/** Variantes de color del spinner. */
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

/** Props del Spinner. */
export interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  centered?: boolean;
  className?: string;
}

// ==============================================================================
// CLASES POR TAMAÑO
// ==============================================================================


const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

// ==============================================================================
// CLASES POR VARIANTE DE COLOR
// ==============================================================================

/**
 * Clases Tailwind para cada variante de color.
 *
 * Cada variante define:
 *   - Color del borde base (semitransparente, forma el "track")
 *   - Color del borde superior (visible, forma el "indicador" que gira)
 *
 * Se usan variables CSS para que los colores cambien con el tema.
 */
const VARIANT_CLASSES: Record<SpinnerVariant, string> = {
  primary:   'border-[var(--color-primary)]/20 border-t-[var(--color-primary)]',
  secondary: 'border-[var(--text-tertiary)]/20 border-t-[var(--text-tertiary)]',
  white:     'border-white/20 border-t-white',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  centered = false,
  className = '',
}: SpinnerProps) {

  // ==============================================================================
  // ELEMENTO DEL SPINNER
  // ==============================================================================

 
  const spinnerElement = (
    <div
      className={cn(
        'rounded-full animate-spin',
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        className
      )}
      role="status"
      aria-label={label ?? 'Cargando'}
    />
  );

  // ==============================================================================
  // RENDER — Con label (spinner + texto debajo)
  // ==============================================================================

  if (label) {
    return (
      <div
        className={cn(
          'flex flex-col items-center gap-3',
          centered && 'justify-center h-full min-h-[200px]'
        )}
      >
        {spinnerElement}
        <span className="text-[13px] text-[var(--text-secondary)] font-sans">
          {label}
        </span>
      </div>
    );
  }

  // ==============================================================================
  // RENDER — Centrado sin label (solo el spinner centrado en su contenedor)
  // ==============================================================================

  if (centered) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        {spinnerElement}
      </div>
    );
  }

  // ==============================================================================
  // RENDER — Solo el spinner (inline, sin contenedor)
  // ==============================================================================

  return spinnerElement;
}