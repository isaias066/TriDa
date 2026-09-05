// ¿Qué? Página de clientes bancarios y dispositivos registrados.
// ¿Para qué? Explorar clientes por banco, riesgo, contacto y parque de dispositivos.
// ¿Impacto? Ruta /users — Skeletons, filtros sin emojis, grid items-start.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users, Smartphone, Eye, EyeOff } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDebounce } from '@hooks/useDebounce';
import { usePagination } from '@hooks/usePagination';
import { getClientsByBank } from '@api/Clientes';
import { getDevicesByClient } from '@api/Dispositivos';
import { Button, EmptyState, Skeleton } from '@components/ui';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { Pagination } from '@components/shared/Pagination';
import { ClientCard } from '@components/users/ClientCard';
import { DeviceCard } from '@components/users/DeviceCard';
import type { BankClient, Device, DevicesByClient } from '@app-types';

type ViewMode = 'clients' | 'devices';

export function UsersPage() {
  const { selectedBank } = useBank();

  useEffect(() => {
    document.title = 'Clientes y Dispositivos — TriDa';
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>('clients');
  const [clients, setClients] = useState<BankClient[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [devicesByClient, setDevicesByClient] = useState<DevicesByClient>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const [clientsData, devicesData] = await Promise.allSettled([
        getClientsByBank(selectedBank),
        getDevicesByClient(selectedBank),
      ]);

      setClients(clientsData.status === 'fulfilled' ? clientsData.value : []);

      if (devicesData.status === 'fulfilled') {
        setDevicesByClient(devicesData.value);
        const devArray: Device[] = [];
        devicesData.value.forEach((devices) => {
          devArray.push(...devices);
        });
        setAllDevices(devArray);
      } else {
        setDevicesByClient(new Map());
        setAllDevices([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [selectedBank]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [clientsData, devicesData] = await Promise.allSettled([
          getClientsByBank(selectedBank),
          getDevicesByClient(selectedBank),
        ]);
        if (cancelled) return;

        setClients(clientsData.status === 'fulfilled' ? clientsData.value : []);

        if (devicesData.status === 'fulfilled') {
          setDevicesByClient(devicesData.value);
          const devArray: Device[] = [];
          devicesData.value.forEach((devices) => devArray.push(...devices));
          setAllDevices(devArray);
        } else {
          setDevicesByClient(new Map());
          setAllDevices([]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error cargando datos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedBank]);

  const activeClients = useMemo(() => clients.filter((c) => c.status === 'active'), [clients]);
  const inactiveClients = useMemo(() => clients.filter((c) => c.status === 'inactive'), [clients]);

  const filteredClients = useMemo(() => {
    let result = showInactive ? clients : activeClients;

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          c.bank.name.toLowerCase().includes(query) ||
          c.phone.includes(query),
      );
    }

    return result;
  }, [clients, activeClients, showInactive, debouncedSearch]);

  const filteredDevices = useMemo(() => {
    if (!debouncedSearch.trim()) return allDevices;

    const query = debouncedSearch.toLowerCase();
    return allDevices.filter(
      (d) =>
        d.type.toLowerCase().includes(query) ||
        d.operatingSystem.toLowerCase().includes(query) ||
        d.browser.toLowerCase().includes(query) ||
        d.clientName.toLowerCase().includes(query) ||
        d.bank.name.toLowerCase().includes(query),
    );
  }, [allDevices, debouncedSearch]);

  const clientsPagination = usePagination(filteredClients, { pageSize: 30 });
  const devicesPagination = usePagination(filteredDevices, { pageSize: 30 });
  const activePagination = viewMode === 'clients' ? clientsPagination : devicesPagination;
  const { page, totalPages, totalItems, pageSize, goToPage, range } = activePagination;

  // ── Loading con Skeletons ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-full flex-col gap-5 p-6 font-sans md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-52 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] items-start gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6 font-sans md:p-8">
        <EmptyState
          preset="error"
          description={error}
          action={
            <Button variant="primary" onClick={loadData}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-5 p-6 font-sans md:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            <Users size={24} aria-hidden="true" />
            Clientes y Dispositivos
          </h1>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            {clients.length} clientes · {activeClients.length} activos · {inactiveClients.length}{' '}
            inactivos
            {viewMode === 'devices' && ` · ${allDevices.length} dispositivos`}
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1"
          role="tablist"
          aria-label="Vista"
        >
          <ViewTab
            active={viewMode === 'clients'}
            onClick={() => setViewMode('clients')}
            icon={<Users size={14} />}
            label="Clientes"
          />
          <ViewTab
            active={viewMode === 'devices'}
            onClick={() => setViewMode('devices')}
            icon={<Smartphone size={14} />}
            label="Dispositivos"
          />
        </div>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {viewMode === 'clients' && (
          <FilterChip
            label={showInactive ? 'Ocultar inactivos' : 'Mostrar inactivos'}
            count={inactiveClients.length}
            active={showInactive}
            onClick={() => setShowInactive(!showInactive)}
            icon={showInactive ? <EyeOff size={12} /> : <Eye size={12} />}
          />
        )}
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        onSearch={() => {}}
        placeholder={
          viewMode === 'clients'
            ? 'Buscar por nombre, email, ciudad, banco...'
            : 'Buscar por tipo, OS, navegador, cliente...'
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[var(--text-tertiary)]">
          {range.total === 0
            ? 'Sin resultados'
            : `Mostrando ${range.start}-${range.end} de ${range.total}`}
        </span>
      </div>

      {/* Clientes */}
      {viewMode === 'clients' && (
        <>
          {filteredClients.length === 0 ? (
            clients.length === 0 ? (
              <EmptyState
                preset="no-data"
                title="Sin clientes"
                description="No hay clientes registrados para el banco seleccionado."
              />
            ) : showInactive ? (
              <EmptyState
                preset="no-results"
                description="No hay clientes que coincidan con la búsqueda."
                action={
                  <Button variant="ghost" onClick={() => setSearch('')}>
                    Limpiar búsqueda
                  </Button>
                }
              />
            ) : (
              <EmptyState
                preset="no-results"
                description="No hay clientes activos. Activa «Mostrar inactivos» para verlos."
                action={
                  <Button variant="ghost" onClick={() => setShowInactive(true)}>
                    Mostrar inactivos
                  </Button>
                }
              />
            )
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] items-start gap-3">
              {clientsPagination.items.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  devices={devicesByClient.get(client.id) ?? []}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Dispositivos */}
      {viewMode === 'devices' && (
        <>
          {filteredDevices.length === 0 ? (
            allDevices.length === 0 ? (
              <EmptyState
                preset="no-data"
                title="Sin dispositivos"
                description="No hay dispositivos registrados para el banco seleccionado."
              />
            ) : (
              <EmptyState
                preset="no-results"
                action={
                  <Button variant="ghost" onClick={() => setSearch('')}>
                    Limpiar búsqueda
                  </Button>
                }
              />
            )
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] items-start gap-2.5">
              {devicesPagination.items.map((device) => (
                <DeviceCard key={device.id} device={device} detailed />
              ))}
            </div>
          )}
        </>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={goToPage}
      />
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cnTab(active)}
    >
      {icon}
      {label}
    </button>
  );
}

function cnTab(active: boolean): string {
  return [
    'flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-4 py-2 font-sans text-xs transition-all duration-150',
    active
      ? 'bg-[rgba(99,102,241,0.12)] font-bold text-indigo-light'
      : 'bg-transparent font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  ].join(' ');
}
