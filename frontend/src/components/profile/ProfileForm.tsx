import React, { useEffect, useState } from "react";
import { SessionUser, UpdateProfilePayload } from "@/types/Auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User as UserIcon, Phone, Mail, Save } from "lucide-react";

interface ProfileFormProps {
  user: SessionUser | null;
  onSubmit: (payload: UpdateProfilePayload) => Promise<boolean>;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  isLoading,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState<string>(
    user?.nombre_completo || "",
  );
  const [telefono, setTelefono] = useState<string>(user?.telefono || "");

  useEffect(() => {
    setNombreCompleto(user?.nombre_completo || "");
    setTelefono(user?.telefono || "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateProfilePayload = {
      nombre_completo: nombreCompleto.trim() || undefined,
      telefono: telefono.trim() || null,
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-3 mb-2">
        <UserIcon className="w-5 h-5 text-[var(--color-primary-500)]" />
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Información Personal
        </h3>
      </div>

      <div>
        <label
          htmlFor="profile-email"
          className="block text-xs font-medium text-[var(--color-text-subtle)] uppercase tracking-wider mb-1"
        >
          Correo Electrónico (No modificable)
        </label>
        <div className="relative">
          <input
            id="profile-email"
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg-surface-hover)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-muted)] cursor-not-allowed font-medium"
          />
          <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-2.5" />
        </div>
      </div>

      <Input
        label="Nombre Completo"
        placeholder="Tu nombre y apellidos"
        value={nombreCompleto}
        onChange={(e) => setNombreCompleto(e.target.value)}
        required
      />

      <div>
        <label
          htmlFor="profile-phone"
          className="block text-sm font-medium text-[var(--color-text-subtle)] mb-1"
        >
          Teléfono de Contacto
        </label>
        <div className="relative">
          <input
            id="profile-phone"
            type="tel"
            placeholder="300 000 0000"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]"
          />
          <Phone className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          isLoading={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
};
