import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { SecurityHistory } from "@/components/profile/SecurityHistory";
import { UserCheck } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const {
    user,
    isUpdatingProfile,
    isChangingPassword,
    updateProfile,
    changePassword,
  } = useProfile();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-[var(--color-primary-500)]" />
          Mi Perfil & Seguridad
        </h1>
        <p className="text-sm text-[var(--color-text-subtle)] mt-1">
          Gestiona tu información personal de contacto y actualiza tu credencial
          de acceso. Al cambiar la contraseña, se cerrará tu sesión y tendrás
          que iniciar sesión de nuevo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ProfileForm
          user={user}
          onSubmit={updateProfile}
          isLoading={isUpdatingProfile}
        />

        <ChangePasswordForm
          onSubmit={changePassword}
          isLoading={isChangingPassword}
        />
      </div>

      <SecurityHistory />
    </div>
  );
};
