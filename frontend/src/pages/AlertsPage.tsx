// ¿Qué? Página del centro de alertas de fraude del sistema TriDa.
// ¿Para qué? Reemplazar alerts.jsx con una versión modular que usa los hooks,
//            componentes shared y capa API que ya creamos.
// ¿Impacto? Se accede en /alerts. Es la página principal donde los analistas
//           revisan, filtran y gestionan las alertas generadas por el modelo IA.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useAlerts } from '@hooks/useAlerts';
import { useDebounce } from '@hooks/useDebounce';
import { usePagination } from '@hooks/usePagination';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { DataTable } from '@components/shared/DataTable';
import type { DataTableColumn, SortConfig } from '@components/shared/DataTable';
import { Pagination } from '@components/shared/Pagination';
import { DetailPanel } from '@components/shared/DetailPanel';
import { AlertDetail } from '@components/alerts/AlertDetail';
import { ExportButton } from '@components/shared/ExportButton';
import { ExportPreviewModal } from '@components/shared/ExportPreviewModal';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatDateTime, formatTime } from '@utils/Formatters';
import { exportData, buildExportPreview } from '@utils/Export';
import type { ExportColumn } from '@utils/Export';
import type { Alert, ExportMetadata } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const STATUS_FILTERS = [
  { value: 'all',     label: 'Todas' },
  { value: 'blocked', label: '🚫 Bloqueadas' },
  { value: 'flagged', label: '⚠️ Marcadas' },
] as const;

// ==============================================================================
// COLUMNAS DE LA TABLA
// ==============================================================================

const TABLE_COLUMNS: DataTableColumn<Alert>[] = [
  {
    key:      'id',
    label:    'ID',
    sortable: true,
    width:    '80px',
    render:   (alert) => (
      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{alert.id}</span>
    ),
  },
  {
    key:      'timestamp',
    label:    'Hora',
    sortable: true,
    width:    '80px',
    sortAccessor: (alert) => alert.timestamp ? new Date(alert.timestamp) : null,
    render:   (alert) => (
      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
        {formatTime(alert.timestamp)}
      </span>
    ),
  },
  {
    key:    'user',
    label:  'Usuario',
    sortable: true,
    render: (alert) => <span style={{ fontWeight: 600 }}>{alert.user}</span>,
  },
  {
    key:    'bank',
    label:  'Banco',
    render: (alert) => <BankBadge bank={alert.bank} size="sm" />,
  },
  {
    key:    'type',
    label:  'Tipo',
    render: (alert) => alert.type,
  },
  {
    key:      'amount',
    label:    'Monto',
    sortable: true,
    align:    'right',
    sortAccessor: (alert) => alert.amount,
    render:   (alert) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {formatCurrency(alert.amount)}
      </span>
    ),
  },
  {
    key:      'riskScore',
    label:    'Riesgo',
    sortable: true,
    align:    'center',
    sortAccessor: (alert) => alert.riskScore,
    render:   (alert) => <RiskBadge score={alert.riskScore} size="sm" />,
  },
  {
    key:    'location',
    label:  'Ciudad',
    render: (alert) => alert.location.city,
  },
  {
    key:    'status',
    label:  'Estado',
    align:  'center',
    render: (alert) => (
      <StatusBadge type="transaction" status={alert.status} size="sm" />
    ),
  },
];

// ==============================================================================
// COLUMNAS DE EXPORTACIÓN
// ==============================================================================

const EXPORT_COLUMNS: ExportColumn<Alert>[] = [
  { header: 'ID',      accessor: (a) => a.id },
  { header: 'Fecha',   accessor: (a) => formatDateTime(a.timestamp) },
  { header: 'Usuario', accessor: (a) => a.user },
  { header: 'Banco',   accessor: (a) => a.bank.name },
  { header: 'Tipo',    accessor: (a) => a.type },
  { header: 'Monto',   accessor: (a) => a.amount },
  { header: 'Riesgo',  accessor: (a) => `${a.riskScore}%` },
  { header: 'Nivel',   accessor: (a) => a.alertLevel },
  { header: 'Ciudad',  accessor: (a) => a.location.city },
  { header: 'Canal',   accessor: (a) => a.channel },
  { header: 'Estado',  accessor: (a) => a.status },
];

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function AlertsPage() {
  const [searchParams] = useSearchParams();
  const { selectedBank } = useBank();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Alertas — TriDa';
  }, []);

  // ==============================================================================
  // DATOS
  // ==============================================================================

  const {
    alerts,
    loading,
    error,
    counts,
    refetch,
  } = useAlerts(selectedBank);

  // ==============================================================================
  // ESTADO LOCAL
  // ==============================================================================

  const initialLevel = (searchParams.get('level') as RiskLevel | null) ?? 'all';
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>(initialLevel);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [sort, setSort] = useState<SortConfig<Alert>>({
    field:     'timestamp',
    direction: 'desc',
  });

  const [selected, setSelected] = useState<Alert | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportMetadata | null>(null);

  // ==============================================================================
  // FILTRADO
  // ==============================================================================

  const filteredAlerts = useMemo(() => {
    let result = alerts;

    if (filterLevel !== 'all') {
      result = result.filter(a => a.alertLevel === filterLevel);
    }

    if (filterStatus !== 'all') {
      result = result.filter(a => a.status === filterStatus);
    }

    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(a =>
        a.id.toLowerCase().includes(query) ||
        a.user.toLowerCase().includes(query) ||
        a.bank.name.toLowerCase().includes(query) ||
        a.location.city.toLowerCase().includes(query) ||
        a.type.toLowerCase().includes(query)
      );
    }

    return result;
  }, [alerts, filterLevel, filterStatus, debouncedSearch]);

  // ==============================================================================
  // PAGINACIÓN
  // ==============================================================================

  const {
    items: pagedAlerts,
    page,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredAlerts, { pageSize: 30 });

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleClearFilters = useCallback((): void => {
    setFilterLevel('all');
    setFilterStatus('all');
    setSearch('');
  }, []);

  const hasActiveFilters = filterLevel !== 'all' || filterStatus !== 'all' || search.trim() !== '';

  const handleExport = useCallback((format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
    exportData({
      format,
      data:           filteredAlerts,
      columns:        EXPORT_COLUMNS,
      filenamePrefix: 'alertas_trida',
      title:          'ALERTAS — TriDa Sistema Antifraude',
    });
  }, [filteredAlerts]);

  const handlePreview = useCallback((format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
    const preview = buildExportPreview(format, filteredAlerts, 5, 'alertas_trida');
    setExportPreview(preview);
  }, [filteredAlerts]);

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

  const headerRightStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
  };

  const summaryStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    flexWrap:   'wrap',
  };

  const filtersRowStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    flexWrap:   'wrap',
  };

  const filterGroupStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    flexWrap:   'wrap',
  };

  const filterLabelStyle: React.CSSProperties = {
    fontSize:      '11px',
    fontWeight:    600,
    color:         'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    gap:     '16px',
    flex:    1,
  };

  const tableContainerStyle: React.CSSProperties = {
    flex:          1,
    minWidth:      0,
    display:       'flex',
    flexDirection: 'column',
    gap:           '12px',
  };

  // ==============================================================================
  // RENDER — LOADING
  // ==============================================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <Spinner size="lg" label="Cargando alertas..." centered />
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
            <Button variant="primary" onClick={() => refetch()}>
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
            <ShieldAlert size={24} />
            Centro de Alertas
          </h1>
          <p style={subtitleStyle}>
            Gestión de alertas de fraude detectadas por el modelo de IA
          </p>
        </div>

        <div style={headerRightStyle}>
          <div style={summaryStyle}>
            <RiskBadge level="critical" mode="level" size="sm" pulse={counts.critical > 0} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: RISK_COLORS.critical }}>
              {counts.critical}
            </span>

            <RiskBadge level="high" mode="level" size="sm" />
            <span style={{ fontSize: '12px', fontWeight: 700, color: RISK_COLORS.high }}>
              {counts.high}
            </span>
          </div>

          <ExportButton
            onExport={handleExport}
            onPreview={handlePreview}
            disabled={filteredAlerts.length === 0}
          />
        </div>
      </header>

      {/* ================================================================
          FILTROS
          ================================================================ */}

      <div style={filtersRowStyle}>
        <div style={filterGroupStyle}>
          <span style={filterLabelStyle}>Nivel:</span>
          <FilterChip
            label="Todas"
            count={alerts.length}
            active={filterLevel === 'all'}
            onClick={() => setFilterLevel('all')}
          />
          {LEVEL_ORDER.map(level => (
            <FilterChip
              key={level}
              label={RISK_LEVELS[level].label}
              count={counts[level]}
              active={filterLevel === level}
              onClick={() => setFilterLevel(level)}
              color={RISK_COLORS[level]}
            />
          ))}
        </div>

        <div style={filterGroupStyle}>
          <span style={filterLabelStyle}>Estado:</span>
          {STATUS_FILTERS.map(sf => (
            <FilterChip
              key={sf.value}
              label={sf.label}
              active={filterStatus === sf.value}
              onClick={() => setFilterStatus(sf.value)}
            />
          ))}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <SearchInput
        value={search}
        onChange={setSearch}
        onSearch={() => {}}
        placeholder="Buscar por ID, usuario, banco, ciudad..."
      />

      {/* ================================================================
          BODY — Tabla + Panel de detalle
          ================================================================ */}

      <div style={bodyStyle}>
        <div style={tableContainerStyle}>
          {filteredAlerts.length === 0 ? (
            alerts.length === 0 ? (
              <EmptyState preset="no-alerts" />
            ) : (
              <EmptyState
                preset="no-results"
                action={
                  <Button variant="ghost" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            )
          ) : (
            <>
              <DataTable<Alert>
                data={pagedAlerts}
                columns={TABLE_COLUMNS}
                getRowKey={(alert) => alert.id}
                sort={sort}
                onSortChange={setSort}
                autoSort
                selectedRow={selected}
                onRowClick={setSelected}
                hoverable
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={goToPage}
              />
            </>
          )}
        </div>

        {/* Panel de detalle — usa AlertDetail */}
        <DetailPanel
          open={selected !== null}
          onClose={() => setSelected(null)}
          title="Detalle de Alerta"
          subtitle={selected?.id}
        >
          {selected && <AlertDetail alert={selected} />}
        </DetailPanel>
      </div>

      {/* ================================================================
          MODAL DE PREVIEW
          ================================================================ */}

      <ExportPreviewModal<Alert>
        open={exportPreview !== null}
        onClose={() => setExportPreview(null)}
        preview={exportPreview}
        onDownload={(format) => {
          handleExport(format);
          setExportPreview(null);
        }}
        columns={TABLE_COLUMNS}
      />
    </div>
  );
}