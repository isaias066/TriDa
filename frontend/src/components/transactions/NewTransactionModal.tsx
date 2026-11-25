import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Category } from "@/types/Category";
import { CreateTransactionPayload, TipoMovimiento } from "@/types/Transaction";
import { useAccount } from "@/hooks/useAccount";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getCurrentDeviceRecordId } from "@/utils/deviceRegistration";
import { Link } from "react-router-dom";

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSubmit: (payload: CreateTransactionPayload) => Promise<boolean>;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSubmit,
}) => {
  const { accounts, selectedAccount } = useAccount();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [idCuenta, setIdCuenta] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>("GASTO");
  const [idCategoria, setIdCategoria] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [comercio, setComercio] = useState<string>("");
  const [fechaTransaccion, setFechaTransaccion] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shareLocation, setShareLocation] = useState(false);

  const activeAccounts = accounts.filter(
    (account) => account.estado && account.tipo === "EFECTIVO",
  );
  const selectedAccountForForm = activeAccounts.find(
    (account) => account.id_cuenta === Number(idCuenta),
  );

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    const now = new Date();
    const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
    setFechaTransaccion(localNow.toISOString().slice(0, 16));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const defaultAccount =
      selectedAccount?.estado && selectedAccount.tipo === "EFECTIVO"
      ? selectedAccount
      : accounts.find(
          (account) => account.estado && account.tipo === "EFECTIVO",
        );
    setIdCuenta(defaultAccount ? String(defaultAccount.id_cuenta) : "");
  }, [isOpen, selectedAccount, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountId = Number(idCuenta);
    if (!Number.isSafeInteger(accountId) || accountId <= 0) {
      setError("Debes seleccionar una cuenta para registrar la transacción.");
      return;
    }

    const numericMonto = parseFloat(monto);
    if (isNaN(numericMonto) || numericMonto <= 0) {
      setError("El monto debe ser un número positivo.");
      return;
    }

    const selectedAccount = activeAccounts.find(
      (account) => account.id_cuenta === accountId,
    );
    if (
      selectedAccount?.tipo === "EFECTIVO" &&
      (!fechaTransaccion || new Date(fechaTransaccion).getTime() > Date.now())
    ) {
      setError("La fecha de efectivo no puede estar vacía ni ser futura.");
      return;
    }
    if (
      selectedAccount &&
      selectedAccount.tipo !== "EFECTIVO" &&
      fechaTransaccion
    ) {
      setFechaTransaccion("");
    }

    setError("");
    setIsSubmitting(true);

    try {
      let location: Pick<CreateTransactionPayload, "latitud" | "longitud"> = {};
      if (shareLocation) {
        if (!navigator.geolocation) {
          showToast({
            type: "info",
            title: "Ubicación no disponible",
            message: "La transacción se guardará sin información de ubicación.",
          });
        } else {
          location = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) =>
                resolve({
                  latitud: position.coords.latitude,
                  longitud: position.coords.longitude,
                }),
              () => {
                showToast({
                  type: "info",
                  title: "Ubicación no compartida",
                  message:
                    "La transacción se guardará sin información de ubicación.",
                });
                resolve({});
              },
              { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
            );
          });
        }
      }

      const payload: CreateTransactionPayload = {
        id_cuenta: accountId,
        id_dispositivo: user
          ? (getCurrentDeviceRecordId(user.id_usuario) ?? undefined)
          : undefined,
        monto: numericMonto,
        tipo_movimiento: tipoMovimiento,
        id_categoria: idCategoria ? Number(idCategoria) : undefined,
        descripcion: descripcion.trim() || undefined,
        comercio: comercio.trim() || undefined,
        fecha_transaccion:
          selectedAccount?.tipo === "EFECTIVO"
            ? new Date(fechaTransaccion).toISOString()
            : undefined,
        ...location,
      };

      const success = await onSubmit(payload);
      if (success) {
        setMonto("");
        setDescripcion("");
        setComercio("");
        setIdCategoria("");
        setShareLocation(false);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoOptions = [
    { value: "GASTO", label: "Gasto" },
    { value: "INGRESO", label: "Ingreso" },
    { value: "AHORRO", label: "Ahorro" },
  ];

  const categoryOptions = [
    { value: "", label: "Sin categoría" },
    ...categories
      .filter(
        (category) =>
          category.estado !== false && category.tipo === tipoMovimiento,
      )
      .map((c) => ({
        value: String(c.id_categoria),
        label: c.nombre,
      })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Transacción"
      isSubmitting={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-risk-critical/10 border border-risk-critical/20 text-risk-critical rounded-lg text-sm">
            {error}
          </div>
        )}
        {activeAccounts.length === 0 && (
          <div
            role="status"
            className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4"
          >
            <p className="text-sm text-text-secondary">
              Los movimientos manuales son solo para efectivo. Los movimientos
              de bancos y billeteras se reciben automáticamente.
            </p>
            <Link
              to="/accounts"
              onClick={onClose}
              className="inline-flex items-center text-sm font-semibold text-primary hover:underline"
            >
              Agregar una cuenta de efectivo
            </Link>
          </div>
        )}

        <div>
          <Select
            label="Cuenta"
            value={idCuenta}
            onChange={(event) => setIdCuenta(event.target.value)}
            options={[
              { value: "", label: "Selecciona una cuenta" },
              ...activeAccounts.map((account) => ({
                value: String(account.id_cuenta),
                label: account.nombre,
              })),
            ]}
            disabled={activeAccounts.length === 0}
          />
        </div>

        {selectedAccountForForm?.tipo === "EFECTIVO" && (
          <Input
            label="Fecha y hora de la transacción"
            type="datetime-local"
            value={fechaTransaccion}
            max={(() => {
              const now = new Date();
              const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
              return localNow.toISOString().slice(0, 16);
            })()}
            onChange={(event) => setFechaTransaccion(event.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Tipo de Movimiento"
              value={tipoMovimiento}
              onChange={(e) => {
                const nextType = e.target.value as TipoMovimiento;
                setTipoMovimiento(nextType);
                if (
                  !categories.some(
                    (category) =>
                      category.id_categoria === Number(idCategoria) &&
                      category.tipo === nextType,
                  )
                ) {
                  setIdCategoria("");
                }
              }}
              options={tipoOptions}
            />
          </div>

          <Input
            label="Monto (COP)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>

        <div>
          <Select
            label="Categoría"
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
            options={categoryOptions}
          />
        </div>

        <Input
          label="Establecimiento / Comercio"
          placeholder="Ej. Éxito, Netflix, Restaurante"
          value={comercio}
          onChange={(e) => setComercio(e.target.value)}
        />

        <Input
          label="Descripción (Opcional)"
          placeholder="Nota personal"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        <label className="flex items-start gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={shareLocation}
            onChange={(event) => setShareLocation(event.target.checked)}
            className="mt-1"
          />
          <span>
            Compartir mi ubicación para esta transacción (opcional). El
            navegador solicitará permiso.
          </span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={activeAccounts.length === 0}
          >
            Guardar Transacción
          </Button>
        </div>
      </form>
    </Modal>
  );
};
