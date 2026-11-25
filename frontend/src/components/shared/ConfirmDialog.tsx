/**
 * ¿Qué? Diálogo modal de confirmación para acciones destructivas.
 */
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="sm"
      isSubmitting={isLoading}
    >
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="h-12 w-12 rounded-2xl bg-expense/10 border border-expense/20 flex items-center justify-center text-expense">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 w-full pt-4 border-t border-border mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
