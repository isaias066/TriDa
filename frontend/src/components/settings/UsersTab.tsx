// ¿Qué? Tab de gestión de usuarios del sistema en Settings.
// ¿Para qué? Mostrar la tabla de usuarios del sistema con acciones de cambio de rol y estado en vivo.
// ¿Impacto? Solo accesible por ADMINISTRADOR. Conexión de punta a punta con PostgreSQL.

import { useEffect, useState } from 'react';
import { UserPlus, RefreshCw, Check, X } from 'lucide-react';
import { getSystemUsers } from '@api/Auth';
import { updateSystemUserStatus, updateSystemUserRole } from '@api/Usuarios';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { DataTable } from '@components/shared/DataTable';
import type { DataTableColumn } from '@components/shared/DataTable';
import { UserAvatar } from '@components/shared/UserAvatar';
import { NewUserModal } from './NewUserModal';
import { ROLES_LIST } from '@constants/Roles';
import { formatRelativeTime } from '@utils/Formatters';
import type { SystemUser } from '@app-types';

export function UsersTab() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Almacenar qué filas se están actualizando para deshabilitar controles temporalmente
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  // Toasts locales rápidos arriba a la derecha para feedback instantáneo
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (user: SystemUser, active: boolean) => {
    const idNum = Number(user.id);
    if (isNaN(idNum)) return;

    setUpdatingIds((prev) => new Set(prev).add(idNum));

    try {
      await updateSystemUserStatus(idNum, active);

      // Actualizar el estado del usuario en la tabla localmente
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: active ? 'active' : 'inactive' } : u)),
      );
      showToast(`Usuario ${user.name} ${active ? 'activado' : 'desactivado'} con éxito`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      showToast(msg, 'error');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(idNum);
        return next;
      });
    }
  };

  const handleRoleChange = async (user: SystemUser, newRole: string) => {
    const idNum = Number(user.id);
    if (isNaN(idNum)) return;

    setUpdatingIds((prev) => new Set(prev).add(idNum));

    try {
      await updateSystemUserRole(idNum, newRole);

      // Actualizar el rol en la tabla localmente
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole as any } : u)));
      showToast(`Rol de ${user.name} actualizado a ${newRole}`, 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar rol';
      showToast(msg, 'error');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(idNum);
        return next;
      });
    }
  };

  // Definición dinámica de columnas para poder acceder a los manejadores de estado locales
  const columns: DataTableColumn<SystemUser>[] = [
    {
      key: 'name',
      label: 'Usuario',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5 font-sans">
          <UserAvatar name={u.name} role={u.role} size="xs" />
          <span className="font-semibold text-[var(--text-primary)]">{u.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (u) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">{u.email}</span>
      ),
    },
    {
      key: 'role',
      label: 'Rol / Permiso',
      render: (u) => {
        const idNum = Number(u.id);
        const isUpdating = updatingIds.has(idNum);

        return (
          <select
            value={u.role}
            disabled={isUpdating}
            onChange={(e) => void handleRoleChange(u, e.target.value)}
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--bg-tertiary)] px-2 py-1 font-sans text-xs font-semibold text-[var(--text-primary)] transition-all duration-150 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            {ROLES_LIST.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: 'lastLogin',
      label: 'Último acceso',
      sortable: true,
      sortAccessor: (u) => (u.lastLogin ? new Date(u.lastLogin) : null),
      render: (u) => (
        <span className="text-[11px] font-medium text-[var(--text-tertiary)]">
          {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Nunca'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Estado de Cuenta',
      align: 'center',
      render: (u) => {
        const idNum = Number(u.id);
        const isActive = u.status === 'active';
        const isUpdating = updatingIds.has(idNum);

        return (
          <div className="flex items-center justify-center gap-2">
            {isUpdating ? (
              <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            ) : (
              <button
                type="button"
                onClick={() => void handleStatusChange(u, !isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-gray-400'}`}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        );
      },
    },
  ];

  const activeCount = users.filter((u) => u.status === 'active').length;

  return (
    <div className="relative flex flex-col gap-4 font-sans">
      {/* Toast Notificador in-app */}
      {toast && (
        <div
          role="alert"
          className={`fixed right-6 top-6 z-[9999] flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-bold text-white shadow-lg transition-all duration-300 animate-slide-in ${
            toast.type === 'success'
              ? 'bg-emerald-500 shadow-emerald-500/10'
              : 'bg-rose-500 shadow-rose-500/10'
          }`}
        >
          {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
          <span>{toast.message}</span>
        </div>
      )}

      <Card>
        <CardHeader
          title="Gestión de Usuarios"
          subtitle={`${activeCount} activos de ${users.length} total`}
          icon={<UserPlus size={16} />}
          action={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus size={13} />}
              onClick={() => setModalOpen(true)}
            >
              Nuevo Usuario
            </Button>
          }
        />
        <CardBody>
          {loading ? (
            <Spinner label="Cargando usuarios..." centered />
          ) : error ? (
            <EmptyState
              preset="error"
              description={error}
              action={
                <Button variant="primary" onClick={fetchUsers}>
                  Reintentar
                </Button>
              }
            />
          ) : (
            <div className="w-full overflow-hidden">
              <DataTable<SystemUser>
                data={users}
                columns={columns}
                getRowKey={(u) => u.id}
                autoSort
                emptyMessage="No hay usuarios registrados en el sistema"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <NewUserModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchUsers} />
    </div>
  );
}
