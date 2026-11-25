import { useState } from "react";
import { ProfileApi } from "@/api/Profile";
import { UpdateProfilePayload, ChangePasswordPayload } from "@/types/Auth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

export const useProfile = () => {
  const { user, refreshUser, logout } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const { showToast } = useToast();

  const updateProfile = async (
    payload: UpdateProfilePayload,
  ): Promise<boolean> => {
    setIsUpdatingProfile(true);
    try {
      await ProfileApi.updateProfile(payload);
      showToast({
        type: "success",
        title: "Perfil actualizado",
        message: "Tus datos personales han sido guardados correctamente.",
      });
      if (refreshUser) {
        await refreshUser();
      }
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error de actualización",
        message:
          err.message || "No se pudieron actualizar los datos del perfil.",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
    return false;
  };

  const changePassword = async (
    payload: ChangePasswordPayload,
  ): Promise<boolean> => {
    setIsChangingPassword(true);
    try {
      await ProfileApi.changePassword(payload);
      logout();
      return true;
    } catch (error) {
      const err = error as Error;
      showToast({
        type: "error",
        title: "Error al cambiar contraseña",
        message:
          err.message ||
          "La contraseña actual no es correcta o la nueva no cumple las políticas.",
      });
    } finally {
      setIsChangingPassword(false);
    }
    return false;
  };

  return {
    user,
    isUpdatingProfile,
    isChangingPassword,
    updateProfile,
    changePassword,
  };
};
