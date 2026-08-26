// ¿Qué? Página de clientes bancarios y sus dispositivos registrados.
// ¿Para qué? Reemplazar users.jsx con una versión modular que usa ClientCard,
//            DeviceCard y hooks de datos centralizados.
// ¿Impacto? Se accede en /users. Los analistas pueden ver los clientes de cada
//           banco, sus dispositivos y niveles de riesgo.

import { useEffect, useMemo, useState } from 'react';
import { Users, Smartphone } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useDebounce } from '@hooks/useDebounce';
import { usePagination } from '@hooks/usePagination';
import { getClientsByBank } from '@api/Clientes';
import { getDevicesByClient } from '@api/Dispositivos';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { Pagination } from '@components/shared/Pagination';
import { ClientCard } from '@components/users/ClientCard';
import { DeviceCard } from '@components/users/DeviceCard';
import type { BankClient, Device, DevicesByClient } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

type ViewMode = 'clients' | 'devices';

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function UsersPage() {
  const { selectedBank } = useBank();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Clientes y Dispositivos — TriDa';
  }, []);

  // ==============================================================================
  // ESTADO LOCAL
  // ==============================================================================

  const [viewMode, setViewMode] = useState<ViewMode>('clients');
  const [clients, setClients] = useState<BankClient[]>([]);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [devicesByClient, setDevicesByClient] = useState<DevicesByClient>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // ==============================================================================
  // CARGA DE DATOS
  // ==============================================================================

  useEffect(() => {
    let cancelled = false;

    const fetchData = async (): Promise<void> => {
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
          devicesData.value.forEach((devices) => {
            devArray.push(...devices);
          });
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
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [selectedBank]);

  // ==============================================================================
  // FILTRADO — Clientes
  // ==============================================================================

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

  // ==============================================================================
  // FILTRADO — Dispositivos
  // ==============================================================================

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

  // ==============================================================================
  // PAGINACIÓN
  // ==============================================================================

  const clientsPagination = usePagination(filteredClients, { pageSize: 30 });
  const devicesPagination = usePagination(filteredDevices, { pageSize: 30 });

  const activePagination = viewMode === 'clients' ? clientsPagination : devicesPagination;
  const { page, totalPages, totalItems, pageSize, goToPage, range } = activePagination;

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleRefetch = async (): Promise<void> => {
    setLoading(true);
    try {
      const [clientsData, devicesData] = await Promise.allSettled([
        getClientsByBank(selectedBank),
        getDevicesByClient(selectedBank),
      ]);

      setClients(clientsData.status === 'fulfilled' ? clientsData.value : []);

      if (devicesData.status === 'fulfilled') {
        setDevicesByClient(devicesData.value);
        const devArray: Device[] = [];
        devicesData.value.forEach((devices) => devArray.push(...devices));
        setAllDevices(devArray);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6 font-sans md:p-8">
        <Spinner size="lg" label="Cargando datos..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

  if (error) {
    return (
      <div className="flex min-h-screen flex-col gap-4 p-6 font-sans md:p-8">
        <EmptyState
          preset="error"
          description={error}
          action={
            <Button variant="primary" onClick={handleRefetch}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — PÁGINA
  // ==============================================================================

  return (
    <div className="flex min-h-full flex-col gap-5 p-6 font-sans md:p-8">
      {/* ================================================================
          HEADER
          ================================================================ */}
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

        {/* Tabs de vista */}
        <div className="flex gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-1">
          <button
            type="button"
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-4 py-2 font-sans text-xs transition-all duration-150 ${
              viewMode === 'clients'
                ? 'bg-[rgba(99,102,241,0.12)] font-bold text-indigo-light'
                : 'bg-transparent font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setViewMode('clients')}
            aria-pressed={viewMode === 'clients'}
          >
            <Users size={14} />
            Clientes
          </button>
          <button
            type="button"
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-4 py-2 font-sans text-xs transition-all duration-150 ${
              viewMode === 'devices'
                ? 'bg-[rgba(99,102,241,0.12)] font-bold text-indigo-light'
                : 'bg-transparent font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            onClick={() => setViewMode('devices')}
            aria-pressed={viewMode === 'devices'}
          >
            <Smartphone size={14} />
            Dispositivos
          </button>
        </div>
      </header>

      {/* ================================================================
          FILTROS Y BÚSQUEDA
          ================================================================ */}
      <div className="flex flex-wrap items-center gap-3">
        {viewMode === 'clients' && (
          <FilterChip
            label={showInactive ? '👁 Ocultar inactivos' : '👁‍🗨 Mostrar inactivos'}
            count={inactiveClients.length}
            active={showInactive}
            onClick={() => setShowInactive(!showInactive)}
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

      {/* ================================================================
          CONTENIDO — Vista de Clientes
          ================================================================ */}
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
                description="No hay clientes activos. Activa 'Mostrar inactivos' para verlos."
                action={
                  <Button variant="ghost" onClick={() => setShowInactive(true)}>
                    Mostrar inactivos
                  </Button>
                }
              />
            )
          ) : (
            // AQUI ESTÁ LA CLAVE DEL GRID: items-start evita el stretch
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

      {/* ================================================================
          CONTENIDO — Vista de Dispositivos
          ================================================================ */}
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
            // AQUI ESTÁ LA CLAVE DEL GRID: items-start evita el stretch
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] items-start gap-2.5">
              {devicesPagination.items.map((device) => (
                <DeviceCard key={device.id} device={device} detailed />
              ))}
            </div>
          )}
        </>
      )}

      {/* ================================================================
          PAGINACIÓN
          ================================================================ */}
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