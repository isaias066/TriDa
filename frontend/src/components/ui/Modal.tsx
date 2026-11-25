/**
 * ¿Qué? Ventana modal superpuesta con fondo translúcido y accesibilidad.
 */
import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  isSubmitting?: boolean;
}

let activeModalCount = 0;
let previousBodyOverflow = "";

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  isSubmitting = false,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isSubmittingRef = useRef(isSubmitting);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    if (!isOpen) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    if (activeModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    activeModalCount += 1;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isSubmittingRef.current) onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) {
          e.preventDefault();
          dialogRef.current?.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      activeModalCount = Math.max(0, activeModalCount - 1);
      if (activeModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        previousFocusRef.current?.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop Backdrop de fondo */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => {
          if (!isSubmitting) onCloseRef.current();
        }}
        aria-hidden="true"
      />

      {/* Contenido del Modal */}
      <div
        className={cn(
          "relative w-full rounded-xl bg-surface border border-border p-6 shadow-2xl z-10 animate-scale-up",
          maxWidthClasses[maxWidth],
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="flex items-start justify-between gap-4 pb-4">
          <div>
            {title && (
              <h2
                id={titleId}
                className="text-lg font-semibold text-text-primary"
              >
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1 text-xs text-text-muted">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCloseRef.current()}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </Button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
