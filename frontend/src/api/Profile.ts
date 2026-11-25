import { apiClient } from "./Client";
import { ApiMessageData, ApiSuccess } from "@/types/Api";
import {
  User,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/types/Auth";

export const ProfileApi = {
  /**
   * Actualiza la información personal del usuario autenticado
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.patch<ApiSuccess<User>>(
      "/auth/me",
      payload,
    );
    return response.data.data;
  },

  /**
   * Modifica la contraseña actual por una nueva
   */
  changePassword: async (
    payload: ChangePasswordPayload,
  ): Promise<ApiMessageData> => {
    const response = await apiClient.post<ApiSuccess<ApiMessageData>>(
      "/auth/change-password",
      payload,
    );
    return response.data.data;
  },
};
