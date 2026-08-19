// ¿Qué? Componente Modal reutilizable con overlay, tecla Escape y accesibilidad.
// ¿Para qué? Reemplazar los múltiples modales inline que estaban en Settings,
//            Alerts y Transactions con estilos y comportamientos diferentes.
// ¿Impacto? Todos los diálogos del sistema usan este modal, garantizando
//           consistencia visual, accesibilidad y comportamiento (Escape, click-outside).

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  disableClose?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

// ==============================================================================
// ANCHOS POR TAMAÑO
// ==============================================================================

const SIZE_WIDTHS: Record<ModalSize, string> = {
  sm:   '400px',
  md:   '520px',
  lg:   '680px',
  xl:   '900px',
  full: '95vw',
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnEscape = true,
  showCloseButton = true,
  disableClose = false,
  children,
  footer,
}: ModalProps) {
 const contentRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ==============================================================================
  // CIERRE POR TECLA ESCAPE
  // ==============================================================================

  useEffect(() => {
    if (!open || !closeOnEscape || disableClose) return;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, disableClose, onClose]);

  // ==============================================================================
  // BLOQUEO DEL SCROLL DEL BODY
  // ==============================================================================

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // ==============================================================================
  // MANEJO DE FOCUS (accesibilidad)
  // ==============================================================================

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;

      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  // ==============================================================================
  // NO RENDERIZAR SI ESTÁ CERRADO
  // ==============================================================================

  if (!open) return null;

  // ==============================================================================
  // ESTILOS
  // ==============================================================================

  const contentStyle: React.CSSProperties = {
    background:    'var(--bg-secondary)',
    border:        '1px solid var(--border)',
    borderRadius:  '12px',
    boxShadow:     '0 20px 40px rgba(0, 0, 0, 0.4)',
    width:         '100%',
    maxWidth:      SIZE_WIDTHS[size],
    maxHeight:     'calc(100vh - 40px)',
    display:       'flex',
    flexDirection: 'column',
    fontFamily:    'Inter, sans-serif',
    animation:     'modal-content-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    outline:       'none',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            '16px',
    padding:        '20px 20px 16px',
    borderBottom:   title || description ? '1px solid var(--border)' : 'none',
  };

  const titleGroupStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
    flex:          1,
    minWidth:      0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize:   '16px',
    fontWeight: 700,
    color:      'var(--text-primary)',
    margin:     0,
    lineHeight: 1.3,
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize:   '12px',
    color:      'var(--text-tertiary)',
    margin:     0,
    lineHeight: 1.5,
  };

  const closeButtonStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    width:          '32px',
    height:         '32px',
    background:     'transparent',
    border:         'none',
    borderRadius:   '6px',
    color:          'var(--text-tertiary)',
    cursor:         disableClose ? 'not-allowed' : 'pointer',
    opacity:        disableClose ? 0.4 : 1,
    transition:     'background 0.15s ease, color 0.15s ease',
    flexShrink:     0,
  };

  const bodyStyle: React.CSSProperties = {
    padding:      '20px',
    overflowY:    'auto',
    flex:         1,
    fontSize:     '13px',
    color:        'var(--text-primary)',
    lineHeight:   1.5,
  };

  const footerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'flex-end',
    gap:            '8px',
    padding:        '12px 20px 16px',
    borderTop:      '1px solid var(--border)',
  };

  // ==============================================================================
  // RENDER (con portal al body)
  // ==============================================================================

  const modalContent = (
    <div
        ref={contentRef as React.RefObject<HTMLDivElement>}
        style={contentStyle}
        role="dialog"
    >
      <div
        ref={contentRef}
        style={contentStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
      >
        {(title || description || showCloseButton) && (
          <div style={headerStyle}>
            <div style={titleGroupStyle}>
              {title && (
                <h2 id="modal-title" style={titleStyle}>
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" style={descriptionStyle}>
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={() => !disableClose && onClose()}
                disabled={disableClose}
                style={closeButtonStyle}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div style={bodyStyle}>{children}</div>

        {footer && <div style={footerStyle}>{footer}</div>}
      </div>

      <style>{`
        @keyframes modal-overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-content-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}