import React, { useState } from "react";
import { useDevices } from "@/hooks/useDevices";
import { DeviceCard } from "@/components/devices/DeviceCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { Laptop, ShieldCheck } from "lucide-react";

export const DevicesPage: React.FC = () => {
  const { devices, isLoading, toggleTrust, removeDevice } = useDevices();
  const [deleteDeviceId, setDeleteDeviceId] = useState<number | null>(null);

  const handleDeleteConfirm = async () => {
    if (deleteDeviceId !== null) {
      await removeDevice(deleteDeviceId);
      setDeleteDeviceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Laptop className="w-6 h-6 text-[var(--color-primary-500)]" />
          Dispositivos Conectados
        </h1>
        <p className="text-sm text-[var(--color-text-subtle)] mt-1">
          Administra los dispositivos asociados a tus transacciones y marca como
          confiables aquellos que utilizas habitualmente.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" className="text-[var(--color-primary-500)]" />
        </div>
      ) : devices.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl">
          <ShieldCheck className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            No hay dispositivos registrados
          </h3>
          <p className="text-sm text-[var(--color-text-subtle)] mt-1">
            Este dispositivo se vinculará automáticamente al iniciar sesión.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((device) => (
            <DeviceCard
              key={device.id_dispositivo}
              device={device}
              onToggleTrust={toggleTrust}
              onDelete={(id) => setDeleteDeviceId(id)}
            />
          ))}
        </div>
      )}

      {/* Diálogo de Confirmación de Desvinculación */}
      <ConfirmDialog
        isOpen={deleteDeviceId !== null}
        title="Desvincular Dispositivo"
        description="¿Estás seguro de que deseas desvincular este dispositivo? La sesión actual no se cerrará, pero las transacciones futuras dejarán de asociarse a este registro."
        confirmText="Desvincular"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteDeviceId(null)}
      />
    </div>
  );
};
