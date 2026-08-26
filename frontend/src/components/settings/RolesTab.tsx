// ¿Qué? Tab de configuración de roles y permisos en Settings.
// ¿Para qué? Mostrar la matriz de permisos por rol y permitir ajustarlos.
// ¿Impacto? Solo accesible por ADMINISTRADOR.

import { useState } from 'react';
import { Lock, ShieldCheck, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { Card, CardHeader } from '@components/ui/Card';
import { Toggle } from '@components/ui/Toggle';
import { ROLES_LIST, type SystemRole } from '@constants/Roles';
import {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_KEYS,
  type PermissionKey,
  type RolePermissions,
} from '@constants/Permissions';

// ==============================================================================
// MAPEO DE ICONOS
// ==============================================================================

const ROLE_ICONS: Record<SystemRole, React.ReactNode> = {
  ADMINISTRADOR: <ShieldCheck size={16} color="#E040FB" aria-hidden="true" />,
  ANALISTA: <Shield size={16} color="#06B6D4" aria-hidden="true" />,
  OPERADOR: <ShieldOff size={16} color="#10B981" aria-hidden="true" />,
  AUDITOR: <ShieldAlert size={16} color="#F59E0B" aria-hidden="true" />,
};

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function RolesTab() {
  // ==============================================================================
  // ESTADO
  // ==============================================================================
  const [permissions, setPermissions] = useState<Record<SystemRole, RolePermissions>>(() => ({
    ...DEFAULT_ROLE_PERMISSIONS,
  }));

  // ==============================================================================
  // HANDLERS
  // ==============================================================================
  const updatePerm = (role: SystemRole, key: PermissionKey, value: boolean): void => {
    setPermissions((prev) => ({
      ...prev,
      [role]: { ...prev[role], [key]: value },
    }));
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================
  return (
    <div className="flex flex-col gap-4 font-sans">
      <Card variant="ghost" padding="none">
        <CardHeader title="Roles y Permisos" icon={<Lock size={16} />} />
      </Card>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-4">
        {ROLES_LIST.map((role) => (
          <div
            key={role.id}
            className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-sm transition-colors duration-150 hover:border-[var(--border-strong)]"
          >
            {/* Cabecera del Rol */}
            <div className="mb-2 flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${role.color}15` }}
              >
                {ROLE_ICONS[role.id]}
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-extrabold tracking-wide" style={{ color: role.color }}>
                  {role.label}
                </span>
                <span className="text-[10px] font-medium text-[var(--text-tertiary)]">
                  {role.description}
                </span>
              </div>
            </div>

            {/* Lista de Permisos */}
            <div className="flex flex-col gap-1 border-t border-[var(--border)] pt-2">
              {PERMISSION_KEYS.map((key) => (
                <div key={key} className="rounded-md px-2 py-1 transition-colors hover:bg-[var(--bg-tertiary)]">
                  <Toggle
                    label={PERMISSIONS[key].label}
                    checked={permissions[role.id]?.[key] ?? false}
                    onChange={(val) => updatePerm(role.id, key, val)}
                    disabled={role.id === 'ADMINISTRADOR'}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}