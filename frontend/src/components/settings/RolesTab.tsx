// ¿Qué? Tab de configuración de roles y permisos en Settings.
// ¿Para qué? Mostrar la matriz de permisos por rol y permitir ajustarlos.
// ¿Impacto? Solo accesible por ADMINISTRADOR.

import { useState } from 'react';
import { Lock, ShieldCheck, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { Card, CardHeader } from '@components/ui/Card';import { Toggle } from '@components/ui/Toggle';
import {
  ROLES_LIST,
  type SystemRole,
} from '@constants/Roles';
import {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
  type PermissionKey,
  type RolePermissions,
} from '@constants/Permissions';

const ROLE_ICONS: Record<SystemRole, React.ReactNode> = {
  ADMINISTRADOR: <ShieldCheck size={15} color="#E040FB" />,
  ANALISTA:      <Shield      size={15} color="#06B6D4" />,
  OPERADOR:      <ShieldOff   size={15} color="#10B981" />,
  AUDITOR:       <ShieldAlert size={15} color="#F59E0B" />,
};

export function RolesTab() {
  const [permissions, setPermissions] = useState<Record<SystemRole, RolePermissions>>(
    () => ({ ...DEFAULT_ROLE_PERMISSIONS })
  );

  const updatePerm = (role: SystemRole, key: PermissionKey, value: boolean): void => {
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [key]: value },
    }));
  };

  const roleCardStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '8px',
    padding: '16px', background: 'var(--bg-secondary)',
    border: '1px solid var(--border)', borderRadius: '12px',
  };

  const roleHeaderStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Card variant="ghost" padding="none">
        <CardHeader title="Roles y Permisos" icon={<Lock size={16} />} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {ROLES_LIST.map(role => (
          <div key={role.id} style={roleCardStyle}>
            <div style={roleHeaderStyle}>
              {ROLE_ICONS[role.id]}
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: role.color }}>{role.label}</span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-tertiary)' }}>{role.description}</span>
              </div>
            </div>

            {PERMISSION_KEYS.map(key => (
              <Toggle
                key={key}
                label={PERMISSIONS[key].label}
                checked={permissions[role.id]?.[key] ?? false}
                onChange={(val) => updatePerm(role.id, key, val)}
                disabled={role.id === 'ADMINISTRADOR'}
                size="sm"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}