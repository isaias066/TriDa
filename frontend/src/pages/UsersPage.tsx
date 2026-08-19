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

        setClients(
          clientsData.status === 'fulfilled' ? clientsData.value : []
        );

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

  const activeClients = useMemo(
    () => clients.filter(c => c.status === 'active'),
    [clients]
  );

  const inactiveClients = useMemo(
    () => clients.filter(c => c.status === 'inactive'),
    [clients]
  );

  const filteredClients = useMemo(() => {
    let result = showInactive ? clients : activeClients;

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.bank.name.toLowerCase().includes(query) ||
        c.phone.includes(query)
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
    return allDevices.filter(d =>
      d.type.toLowerCase().includes(query) ||
      d.operatingSystem.toLowerCase().includes(query) ||
      d.browser.toLowerCase().includes(query) ||
      d.clientName.toLowerCase().includes(query) ||
      d.bank.name.toLowerCase().includes(query)
    );
  }, [allDevices, debouncedSearch]);

  // ==============================================================================
  // PAGINACIÓN
  // ==============================================================================

  // Paginación separada por vista (TypeScript no puede unir BankClient[] con Device[])
const clientsPagination = usePagination(filteredClients, { pageSize: 30 });
const devicesPagination = usePagination(filteredDevices, { pageSize: 30 });

// Seleccionar la paginación activa según la vista
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
  // ESTILOS
  // ==============================================================================

  const pageStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '16px',
    padding:       '24px',
    minHeight:     '100vh',
    fontFamily:    'Inter, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    gap:            '16px',
    flexWrap:       'wrap',
  };

  const headerLeftStyle: React.CSSProperties = {
    display:       'flex',
    flexDirection: 'column',
    gap:           '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize:      '24px',
    fontWeight:    800,
    color:         'var(--text-primary)',
    margin:        0,
    letterSpacing: '-0.02em',
    display:       'flex',
    alignItems:    'center',
    gap:           '10px',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '13px',
    color:    'var(--text-secondary)',
    margin:   0,
  };

  const tabsStyle: React.CSSProperties = {
    display:    'flex',
    gap:        '4px',
    background: 'var(--bg-secondary)',
    border:     '1px solid var(--border)',
    borderRadius: '10px',
    padding:    '4px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    display:      'flex',
    alignItems:   'center',
    gap:          '6px',
    padding:      '8px 16px',
    fontSize:     '12px',
    fontWeight:   active ? 700 : 500,
    color:        active ? '#818CF8' : 'var(--text-secondary)',
    background:   active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
    border:       'none',
    borderRadius: '8px',
    cursor:       'pointer',
    transition:   'all 0.15s ease',
    fontFamily:   'inherit',
  });

  const filtersRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    flexWrap:   'wrap',
  };

  const toolbarStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            '12px',
    flexWrap:       'wrap',
  };

  const rangeInfoStyle: React.CSSProperties = {
    fontSize: '12px',
    color:    'var(--text-tertiary)',
  };

  const gridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap:                 '12px',
  };

  const devicesGridStyle: React.CSSProperties = {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap:                 '10px',
  };

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <Spinner size="lg" label="Cargando datos..." centered />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — ERROR
  // ==============================================================================

  if (error) {
    return (
      <div style={pageStyle}>
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
    <div style={pageStyle}>

      {/* ================================================================
          HEADER
          ================================================================ */}

      <header style={headerStyle}>
        <div style={headerLeftStyle}>
          <h1 style={titleStyle}>
            <Users size={24} />
            Clientes y Dispositivos
          </h1>
          <p style={subtitleStyle}>
            {clients.length} clientes · {activeClients.length} activos
            · {inactiveClients.length} inactivos
            {viewMode === 'devices' && ` · ${allDevices.length} dispositivos`}
          </p>
        </div>

        {/* Tabs de vista */}
        <div style={tabsStyle}>
          <button
            type="button"
            style={tabStyle(viewMode === 'clients')}
            onClick={() => setViewMode('clients')}
            aria-pressed={viewMode === 'clients'}
          >
            <Users size={14} />
            Clientes
          </button>
          <button
            type="button"
            style={tabStyle(viewMode === 'devices')}
            onClick={() => setViewMode('devices')}
            aria-pressed={viewMode === 'devices'}
          >
            <Smartphone size={14} />
            Dispositivos
          </button>
        </div>
      </header>

      {/* ================================================================
          FILTROS
          ================================================================ */}

      <div style={filtersRowStyle}>
        {/* Toggle de inactivos (solo en vista clientes) */}
        {viewMode === 'clients' && (
          <FilterChip
            label={showInactive ? '👁 Ocultar inactivos' : '👁‍🗨 Mostrar inactivos'}
            count={inactiveClients.length}
            active={showInactive}
            onClick={() => setShowInactive(!showInactive)}
          />
        )}
      </div>

      {/* Búsqueda */}
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

      {/* Toolbar con info de rango */}
      <div style={toolbarStyle}>
        <span style={rangeInfoStyle}>
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
            <div style={gridStyle}>
              {clientsPagination.items.map(client => (
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
            <div style={devicesGridStyle}>
              {devicesPagination.items.map(device => (
                <DeviceCard
                    key={device.id}
                    device={device}
                    detailed
                />
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