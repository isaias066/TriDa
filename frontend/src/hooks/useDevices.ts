import { useState, useCallback, useEffect } from "react";
import { DevicesApi } from "@/api/Devices";
import { Device } from "@/types/Device";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { clearCurrentDeviceRecordId } from "@/utils/deviceRegistration";

export const useDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const { user, logout } = useAuth();

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      setDevices(await DevicesApi.getAll());
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error al cargar dispositivos",
        message:
          err.message ||
          "No se pudo obtener la lista de dispositivos vinculados.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const handleDeviceRegistered = () => {
      void fetchDevices();
    };
    window.addEventListener("trida-device-registered", handleDeviceRegistered);
    fetchDevices();
    return () =>
      window.removeEventListener(
        "trida-device-registered",
        handleDeviceRegistered,
      );
  }, [fetchDevices]);

  const toggleTrust = async (
    id: number,
    confiableActual: boolean,
  ): Promise<boolean> => {
    try {
      const nuevoEstado = !confiableActual;
      await DevicesApi.updateTrust(id, {
        confiable: nuevoEstado,
      });
      setDevices((prev) =>
        prev.map((dev) =>
          dev.id_dispositivo === id ? { ...dev, confiable: nuevoEstado } : dev,
        ),
      );
      showToast({
        type: "success",
        title: "Confianza actualizada",
        message: nuevoEstado
          ? "El dispositivo ahora está marcado como confiable."
          : "El dispositivo ya no se considera confiable.",
      });
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de actualización",
        message:
          err.message ||
          "No se pudo cambiar el estado de confianza del dispositivo.",
      });
    }
    return false;
  };

  const removeDevice = async (id: number): Promise<boolean> => {
    try {
      await DevicesApi.delete(id);
      if (user) clearCurrentDeviceRecordId(user.id_usuario, id);
      setDevices((prev) => prev.filter((dev) => dev.id_dispositivo !== id));
      showToast({
        type: "success",
        title: "Dispositivo eliminado",
        message:
          "El dispositivo fue desvinculado y todas las sesiones se cerraron. Inicia sesión nuevamente.",
      });
      await logout(true);
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error al eliminar",
        message: err.message || "No se pudo revocar el dispositivo.",
      });
    }
    return false;
  };

  return {
    devices,
    isLoading,
    toggleTrust,
    removeDevice,
    refreshDevices: fetchDevices,
  };
};
