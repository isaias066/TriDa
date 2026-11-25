import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Account, UpdateAccountPayload, AccountType } from "@/types";
import { useToast } from "@/components/ui/Toast";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSubmit: (id_cuenta: number, payload: UpdateAccountPayload) => Promise<void>;
}

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSubmit,
}) => {
  const { showToast } = useToast();

  const [nombre, setNombre] = useState("");
  const [entidad, setEntidad] = useState("");
  const [tipo, setTipo] = useState<AccountType>("BANCO");
  const [numeroCuenta, setNumeroCuenta] = useState("");
  const [color, setColor] = useState("#8B5CF6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (account) {
      setNombre(account.nombre);
      setEntidad(account.entidad || "");
      setTipo(account.tipo);
      setNumeroCuenta("");
      setColor(account.color || "#8B5CF6");
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    if (!nombre.trim()) {
      showToast({
        type: "error",
        title: "Campo requerido",
        message: "El nombre de la cuenta no puede estar vacío.",
      });
      return;
    }

    const accountNumberDigits = numeroCuenta.replace(/\D/g, "");
    if (tipo !== "EFECTIVO" && !entidad.trim()) {
      showToast({
        type: "error",
        title: "Entidad requerida",
        message: "Indica el banco o la entidad financiera de la cuenta.",
      });
      return;
    }
    if (
      tipo !== "EFECTIVO" &&
      accountNumberDigits.length < 4 &&
      !account.numero_enmascarado
    ) {
      showToast({
        type: "error",
        title: "Número de cuenta requerido",
        message: "Ingresa el número completo de la cuenta.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(account.id_cuenta, {
        nombre: nombre.trim(),
        entidad: tipo === "EFECTIVO" ? undefined : entidad.trim(),
        tipo,
        numero_enmascarado:
          tipo !== "EFECTIVO" && accountNumberDigits.length >= 4
            ? accountNumberDigits.slice(-4)
            : undefined,
        color,
      });

      showToast({
        type: "success",
        title: "Cuenta actualizada",
        message: `Los cambios en "${nombre}" se han guardado.`,
      });
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la cuenta.";
      showToast({
        type: "error",
        title: "Error",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isSubmitting={isSubmitting}
      title="Editar Cuenta"
      description="Modifica los detalles de tu fuente de fondos"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre de la cuenta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tipo de cuenta"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as AccountType)}
            options={[
              { value: "BANCO", label: "Cuenta Bancaria" },
              { value: "TARJETA", label: "Tarjeta de Crédito / Débito" },
              { value: "BILLETERA", label: "Billetera Digital" },
              { value: "EFECTIVO", label: "Efectivo" },
            ]}
          />

          <Input
            label={`Entidad Financiera${tipo === "EFECTIVO" ? " (Opcional)" : " *"}`}
            value={entidad}
            onChange={(e) => setEntidad(e.target.value)}
            required={tipo !== "EFECTIVO"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tipo !== "EFECTIVO" && (
            <div>
              <Input
                label="Nuevo número completo (opcional)"
                placeholder={
                  account?.numero_enmascarado
                    ? `Actual termina en ${account.numero_enmascarado}`
                    : "Escribe el número completo"
                }
                inputMode="numeric"
                autoComplete="off"
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
              />
              <p className="mt-1 text-xs text-text-muted">
                Solo se guardan y muestran los últimos 4 dígitos.
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-account-color"
            className="block text-xs font-semibold tracking-wide text-text-secondary uppercase mb-1.5"
          >
            Color distintivo
          </label>
          <div className="flex items-center gap-2">
            <input
              id="edit-account-color"
              type="color"
              value={color}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setColor(e.target.value)
              }
              className="h-9 w-12 rounded-lg bg-surface border border-border cursor-pointer"
            />
            <span className="text-xs font-mono text-text-muted">{color}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Actualizar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};
