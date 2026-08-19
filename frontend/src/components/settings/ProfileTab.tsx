// ¿Qué? Tab de perfil del usuario actual en la página de Settings.
// ¿Para qué? Mostrar y permitir editar datos básicos del perfil y cambiar contraseña.
// ¿Impacto? Accesible por todos los roles. Muestra nombre, email, rol y botón
//           de cambiar contraseña.

import { useState } from 'react';
import { User, Mail, Phone, KeyRound } from 'lucide-react';import { useAuth } from '@context/AuthContext';
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

  const sectionStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '20px',
    maxWidth:      '560px',
  };

  const avatarSectionStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '16px',
  };

  const avatarWrapperStyle: React.CSSProperties = {
    position: 'relative',
  };

  const roleBadgeStyle: React.CSSProperties = {
    display:      'inline-flex',
    padding:      '4px 10px',
    borderRadius: '6px',
    fontSize:     '11px',
    fontWeight:   700,
    color:        roleMeta?.color ?? '#6366F1',
    background:   `${roleMeta?.color ?? '#6366F1'}18`,
  };

  return (
    <div style={sectionStyle}>
      <Card>
        <CardHeader title="Mi Perfil" icon={<User size={16} />} />
        <CardBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Avatar + Rol */}
            <div style={avatarSectionStyle}>
              <div style={avatarWrapperStyle}>
                <UserAvatar name={user?.nombre} role={user?.rol} size="xl" />
              </div>
              <div>
                <span style={roleBadgeStyle}>{roleMeta?.label ?? user?.rol}</span>
              </div>
            </div>

            {/* Campos del perfil */}
            <Input
              label="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User size={14} />}
            />

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

            <Toggle
              label="Autenticación de dos factores (2FA)"
              description="Requiere código adicional al iniciar sesión"
              checked={twoFA}
              onChange={setTwoFA}
              icon={<KeyRound size={14} />}
              variant="success"
            />

            {/* Botones */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button
                variant="ghost"
                leftIcon={<KeyRound size={14} />}
                onClick={() => setPasswordModalOpen(true)}
              >
                Cambiar contraseña
              </Button>

              <Button variant="primary">
                Guardar cambios
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}