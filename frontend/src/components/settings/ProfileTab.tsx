// ¿Qué? Tab de perfil del usuario actual en la página de Settings.
// ¿Para qué? Mostrar y permitir editar datos básicos del perfil y cambiar contraseña.
// ¿Impacto? Accesible por todos los roles. Muestra nombre, email, rol y botón
//           de cambiar contraseña.

import { useState } from 'react';
import { User, Mail, Phone, KeyRound, Shield } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Toggle } from '@components/ui/Toggle';
import { UserAvatar } from '@components/shared/UserAvatar';
import { ChangePasswordModal } from './ChangePasswordModal';
import { getRoleMetadata } from '@constants/Roles';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ProfileTab() {
  const { user } = useAuth();
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const [name, setName] = useState(user?.nombre ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [twoFA, setTwoFA] = useState(true);

  const roleMeta = user?.rol ? getRoleMetadata(user.rol) : null;
  const roleColor = roleMeta?.color ?? '#6366F1';

  return (
    <div className="flex w-full max-w-2xl flex-col gap-5 font-sans">
      <Card>
        <CardHeader title="Mi Perfil" icon={<User size={16} />} />
        <CardBody>
          <div className="flex flex-col gap-6">
            {/* ============================================================
                1. IDENTIDAD — Avatar, nombre visible y rol
                ============================================================ */}
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

            {/* ============================================================
                2. DATOS DE CONTACTO
                ============================================================ */}
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
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={14} />}
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 300 123 4567"
                  leftIcon={<Phone size={14} />}
                />
              </div>
            </section>

            {/* ============================================================
                3. SEGURIDAD
                ============================================================ */}
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
                />
              </div>
            </section>

            {/* ============================================================
                4. ACCIONES
                ============================================================ */}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <Button
                variant="ghost"
                leftIcon={<KeyRound size={14} />}
                onClick={() => setPasswordModalOpen(true)}
              >
                Cambiar contraseña
              </Button>

              <Button variant="primary">Guardar cambios</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <ChangePasswordModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />
    </div>
  );
}