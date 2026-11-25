import { apiClient } from "./Client";
import { ApiSuccess } from "@/types/Api";
import {
  Device,
  RegisterDevicePayload,
  UpdateDeviceTrustPayload,
} from "@/types/Device";

export const DevicesApi = {
  /**
   * Obtiene todos los dispositivos vinculados a la cuenta del usuario
   */
  getAll: async (): Promise<Device[]> => {
    const response = await apiClient.get<ApiSuccess<Device[]>>("/devices");
    return response.data.data;
  },

  /**
   * Registra un nuevo dispositivo
   */
  register: async (payload: RegisterDevicePayload): Promise<Device> => {
    const response = await apiClient.post<ApiSuccess<Device>>(
      "/devices",
      payload,
    );
    return response.data.data;
  },

  /**
   * Actualiza el estado de confianza (confiable: true/false) de un dispositivo
   */
  updateTrust: async (
    id: number,
    payload: UpdateDeviceTrustPayload,
  ): Promise<Device> => {
    const response = await apiClient.patch<ApiSuccess<Device>>(
      `/devices/${id}/trust`,
      payload,
    );
    return response.data.data;
  },

  /**
   * Revoca o elimina un dispositivo registrado
   */
  delete: async (id: number): Promise<Device> => {
    const response = await apiClient.delete<ApiSuccess<Device>>(
      `/devices/${id}`,
    );
    return response.data.data;
  },
};
