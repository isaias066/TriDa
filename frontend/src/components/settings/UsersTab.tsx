// ¿Qué? Tab de gestión de usuarios del sistema en Settings.
// ¿Para qué? Mostrar la tabla de usuarios del sistema con acciones CRUD.
// ¿Impacto? Solo accesible por ADMINISTRADOR. Permite crear, ver y gestionar usuarios.

import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { getSystemUsers } from '@api/Auth';
import { Card, CardHeader, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { DataTable } from '@components/shared/DataTable';
import type { DataTableColumn } from '@components/shared/DataTable';
import { UserAvatar } from '@components/shared/UserAvatar';
import { StatusBadge } from '@components/shared/StatusBadge';
import { NewUserModal } from './NewUserModal';
import { getRoleMetadata } from '@constants/Roles';
import { formatRelativeTime } from '@utils/Formatters';
import type { SystemUser } from '@app-types';

// ==============================================================================
// COLUMNAS
// ==============================================================================

const COLUMNS: DataTableColumn<SystemUser>[] = [
  {
    key: 'name',
    label: 'Usuario',
    sortable: true,
    render: (u) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <UserAvatar name={u.name} role={u.role} size="xs" />
        <span style={{ fontWeight: 600 }}>{u.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    render: (u) => <span style={{ fontSize: '12px' }}>{u.email}</span>,
  },
  {
    key: 'role',
    label: 'Rol',
    render: (u) => {
      const meta = getRoleMetadata(u.role);
      return (
        <span style={{ color: meta.color, fontWeight: 600, fontSize: '12px' }}>
          {meta.label}
        </span>
      );
    },
  },
  {
    key: 'lastLogin',
    label: 'Último acceso',
    sortable: true,
    sortAccessor: (u) => u.lastLogin ? new Date(u.lastLogin) : null,
    render: (u) => (
      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
        {u.lastLogin ? formatRelativeTime(u.lastLogin) : 'Nunca'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    align: 'center',
    render: (u) => <StatusBadge type="user" status={u.status} size="sm" />,
  },
];

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function UsersTab() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              action={<Button variant="primary" onClick={fetchUsers}>Reintentar</Button>}
            />
          ) : (
            <DataTable<SystemUser>
              data={users}
              columns={COLUMNS}
              getRowKey={(u) => u.id}
              autoSort
              emptyMessage="No hay usuarios registrados en el sistema"
            />
          )}
        </CardBody>
      </Card>

      <NewUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}