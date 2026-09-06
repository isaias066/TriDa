// ¿Qué? Tab de perfil del usuario actual en la página de Settings con Toasts flotantes.
// ¿Para qué? Permitir editar perfil con feedback instantáneo premium.
// ¿Impacto? Sincroniza con el backend e informa del resultado mediante Toasts flotantes.

import { useState } from 'react';
import { User, Mail, Phone, KeyRound, Shield, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { updateProfile } from '@api/Auth';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { UserAvatar } from '@components/shared/UserAvatar';
import { ChangePasswordModal } from './ChangePasswordModal';
import { getRoleMetadata } from '@constants/Roles';

export function ProfileTab() {
  const { user } = useAuth();

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  const [name, setName] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');

  const [saving, setSaving] = useState(false);

  // Sistema unificado de Toasts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (): Promise<void> => {
    setSaving(true);
    try {
      const result = await updateProfile({
        nombre_completo: name.trim(),
        email: email.trim(),
      });
      triggerToast(result.message || 'Perfil guardado con éxito', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el perfil';
      triggerToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const roleMeta = user?.rol ? getRoleMetadata(user.rol) : null;
  const roleColor = roleMeta?.color ?? '#6366F1';

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 font-sans relative">
      {/* Toast Flotante Superior Derecho */}
      {toast && (
        <div
          role="alert"
          className={`fixed right-6 top-6 z-[9999] flex items-center gap-2.5 rounded-xl border px-4 py-3.5 text-xs font-bold text-white shadow-2xl backdrop-blur-md animate-slide-in ${
            toast.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-950/80 text-emerald-200 shadow-emerald-950/20'
              : 'border-rose-500/20 bg-rose-950/80 text-rose-200 shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <Check size={16} className="text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="text-rose-400" />
          )}
          <span className="leading-snug">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className={`ml-2 rounded-lg p-0.5 transition-colors ${
              toast.type === 'success'
                ? 'hover:bg-emerald-900/30 text-emerald-400'
                : 'hover:bg-rose-900/30 text-rose-400'
            }`}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Card>
        <CardHeader title="Mi Perfil" icon={<User size={16} />} />
        <CardBody>
          <div className="flex flex-col gap-6">
            <section
              className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] p-4 sm:flex-row sm:items-center sm:gap-5"
              aria-label="Identidad del usuario"
            >
              <UserAvatar name={user?.nombre} role={user?.rol} size="xl" />

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="m-0 truncate text-base font-bold text-[var(--text-primary)]">
                  {user?.nombre ?? 'Usuario'}
                </h3>
                <p className="m-0 truncate text-[13px] text-[var(--text-secondary)]">
                  {user?.email ?? 'Sin correo'}
                </p>
                <span
                  className="inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    color: roleColor,
                    background: `${roleColor}18`,
                  }}
                >
                  <Shield size={12} aria-hidden="true" />
                  {roleMeta?.label ?? user?.rol ?? 'Sin rol'}
                </span>
              </div>
            </section>

            <section className="flex flex-col gap-4" aria-label="Datos de contacto">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Datos de contacto
                </span>
              </div>

              <Input
                label="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User size={14} />}
                disabled={saving}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={14} />}
                  disabled={saving}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  leftIcon={<Phone size={14} />}
                  disabled={saving}
                  helperText="Solo para fines de contacto interno"
                />
              </div>
            </section>

            <section className="flex flex-col gap-3" aria-label="Seguridad de la cuenta">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-tertiary)]">
                  Seguridad
                </span>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-3 py-3">
                <Toggle
                  label="Autenticación de dos factores (2FA)"
                  description="Requiere código adicional al iniciar sesión"
                  checked={twoFA}
                  onChange={setTwoFA}
                  icon={<KeyRound size={14} />}
                  variant="success"
                  disabled={saving}
                />
              </div>
            </section>

            <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <Button
                variant="ghost"
                leftIcon={<KeyRound size={14} />}
                onClick={() => setPasswordModalOpen(true)}
                disabled={saving}
              >
                Cambiar contraseña
              </Button>

              <Button variant="primary" onClick={() => void handleSaveProfile()} loading={saving}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSuccess={() => {
          triggerToast('¡Contraseña actualizada exitosamente!', 'success');
        }}
      />
    </div>
  );
}
