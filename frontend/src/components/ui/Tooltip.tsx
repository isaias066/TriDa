// ¿Qué? Componente Tooltip reutilizable con posicionamiento inteligente.
// ¿Para qué? Reemplazar los `title=` HTML nativos que no son estilizables ni
//            accesibles, y estandarizar los tooltips en toda la aplicación.
// ¿Impacto? Cualquier elemento que necesite explicación contextual usa este
//           tooltip, garantizando consistencia visual y accesibilidad.

import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

// ==============================================================================
// TYPES
// ==============================================================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export type TooltipVariant = 'default' | 'dark' | 'primary' | 'danger';

export interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  position?: TooltipPosition;
  variant?: TooltipVariant;
  delay?: number;
  disabled?: boolean;
  maxWidth?: string;
}

// ==============================================================================
// COLORES POR VARIANTE
// ==============================================================================

const VARIANT_STYLES: Record<TooltipVariant, {
  background: string;
  color:      string;
  border:     string;
}> = {
  default: {
    background: 'var(--bg-tertiary)',
    color:      'var(--text-primary)',
    border:     '1px solid var(--border)',
  },
  dark: {
    background: '#1F2937',
    color:      '#F3F4F6',
    border:     '1px solid #374151',
  },
  primary: {
    background: '#6366F1',
    color:      '#FFFFFF',
    border:     '1px solid #6366F1',
  },
  danger: {
    background: '#EF4444',
    color:      '#FFFFFF',
    border:     '1px solid #EF4444',
  },
};

// ==============================================================================
// HELPERS DE POSICIONAMIENTO
// ==============================================================================

function calculatePosition(
  triggerRect: DOMRect,
  tooltipRect: { width: number; height: number },
  position: TooltipPosition,
  gap: number = 8
): { top: number; left: number } {
  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;

  switch (position) {
    case 'top':
      return {
        top:  triggerRect.top - tooltipRect.height - gap,
        left: centerX - tooltipRect.width / 2,
      };
    case 'bottom':
      return {
        top:  triggerRect.bottom + gap,
        left: centerX - tooltipRect.width / 2,
      };
    case 'left':
      return {
        top:  centerY - tooltipRect.height / 2,
        left: triggerRect.left - tooltipRect.width - gap,
      };
    case 'right':
      return {
        top:  centerY - tooltipRect.height / 2,
        left: triggerRect.right + gap,
      };
  }
}

function clampToViewport(
  coords: { top: number; left: number },
  tooltipRect: { width: number; height: number },
  padding: number = 8
): { top: number; left: number } {
  const maxLeft = window.innerWidth  - tooltipRect.width  - padding;
  const maxTop  = window.innerHeight - tooltipRect.height - padding;

  return {
    top:  Math.max(padding, Math.min(coords.top,  maxTop)),
    left: Math.max(padding, Math.min(coords.left, maxLeft)),
  };
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Tooltip({
  content,
  children,
  position = 'top',
  variant = 'default',
  delay = 300,
  disabled = false,
  maxWidth = '240px',
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const showTimerRef = useRef<number | null>(null);
  const tooltipId = useId();

  // ==============================================================================
  // HANDLERS DE MOSTRAR / OCULTAR
  // ==============================================================================

  const showTooltip = (): void => {
    if (disabled) return;

    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = window.setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hideTooltip = (): void => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    setVisible(false);
    setCoords(null);
  };

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  // ==============================================================================
  // CÁLCULO DE POSICIÓN CUANDO SE MUESTRA
  // ==============================================================================

  useEffect(() => {
    if (!visible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = {
      width:  tooltipRef.current.offsetWidth,
      height: tooltipRef.current.offsetHeight,
    };

    const rawCoords = calculatePosition(triggerRect, tooltipRect, position);
    const clampedCoords = clampToViewport(rawCoords, tooltipRect);

    setCoords(clampedCoords);
  }, [visible, position, content]);

  // ==============================================================================
  // CLONAR EL CHILDREN PARA INYECTAR HANDLERS Y REF
  // ==============================================================================

  if (!isValidElement(children)) {
    console.warn('Tooltip: children debe ser un elemento React válido');
    return <>{children}</>;
  }

  const childProps = children.props as React.HTMLAttributes<HTMLElement> & {
    ref?: React.Ref<HTMLElement>;
  };

  const enhancedChild = cloneElement(children, {
    ref: (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;

      const originalRef = (children as ReactElement & { ref?: React.Ref<HTMLElement> }).ref;
      if (typeof originalRef === 'function') {
        originalRef(node);
      } else if (originalRef && typeof originalRef === 'object') {
        (originalRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      showTooltip();
      childProps.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      hideTooltip();
      childProps.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      showTooltip();
      childProps.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      hideTooltip();
      childProps.onBlur?.(e);
    },
    'aria-describedby': visible ? tooltipId : undefined,
  } as Partial<React.HTMLAttributes<HTMLElement>>);

  // ==============================================================================
  // ESTILOS DEL TOOLTIP
  // ==============================================================================

  const variantStyle = VARIANT_STYLES[variant];

  const tooltipStyle: React.CSSProperties = {
    position:       'fixed',
    top:            coords?.top ?? -9999,
    left:           coords?.left ?? -9999,
    background:     variantStyle.background,
    color:          variantStyle.color,
    border:         variantStyle.border,
    padding:        '6px 10px',
    borderRadius:   '6px',
    fontSize:       '11px',
    fontWeight:     500,
    lineHeight:     1.4,
    fontFamily:     'Inter, sans-serif',
    maxWidth,
    zIndex:         10000,
    pointerEvents:  'none',
    boxShadow:      '0 4px 12px rgba(0, 0, 0, 0.2)',
    opacity:        coords ? 1 : 0,
    transition:     'opacity 0.15s ease',
    userSelect:     'none',
    whiteSpace:     'normal',
    wordBreak:      'break-word',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  return (
    <>
      {enhancedChild}

      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={tooltipStyle}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
}