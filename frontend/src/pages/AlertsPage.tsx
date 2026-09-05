// ¿Qué? Página del centro de alertas de fraude del sistema TriDa.
// ¿Para qué? Revisar, filtrar, gestionar y exportar alertas generadas por IA.
// ¿Impacto? Skeletons de carga integrados + Exportación a PDF real (asíncrona).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useAlerts } from '@hooks/useAlerts';
import { useDebounce } from '@hooks/useDebounce';
import { usePagination } from '@hooks/usePagination';
import { Button, EmptyState, Skeleton } from '@components/ui';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { DataTable, type DataTableColumn, type SortConfig } from '@components/shared/DataTable';
import { Pagination } from '@components/shared/Pagination';
import { DetailPanel } from '@components/shared/DetailPanel';
import { ExportButton } from '@components/shared/ExportButton';
import { ExportPreviewModal } from '@components/shared/ExportPreviewModal';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import { AlertDetail } from '@components/alerts';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatDateTime, formatTime } from '@utils/Formatters';
import { exportData, buildExportPreview, type ExportColumn } from '@utils/Export';
import type { Alert, ExportMetadata } from '@app-types';

const LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const STATUS_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'blocked', label: 'Bloqueadas' },
  { value: 'flagged', label: 'Marcadas' },
] as const;

const TABLE_COLUMNS: DataTableColumn<Alert>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    render: (a) => (
      <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">{a.id}</span>
    ),
  },
  {
    key: 'timestamp',
    label: 'Hora',
    sortable: true,
    width: '80px',
    sortAccessor: (a) => (a.timestamp ? new Date(a.timestamp) : null),
    render: (a) => <span className="font-mono text-[11px]">{formatTime(a.timestamp)}</span>,
  },
  {
    key: 'user',
    label: 'Usuario',
    sortable: true,
    render: (a) => <span className="font-semibold">{a.user}</span>,
  },
  {
    key: 'bank',
    label: 'Banco',
    render: (a) => <BankBadge bank={a.bank} size="sm" />,
  },
  {
    key: 'type',
    label: 'Tipo',
    render: (a) => a.type,
  },
  {
    key: 'amount',
    label: 'Monto',
    sortable: true,
    align: 'right',
    sortAccessor: (a) => a.amount,
    render: (a) => (
      <span className="font-mono font-bold tabular-nums text-[var(--text-primary)]">
        {formatCurrency(a.amount)}
      </span>
    ),
  },
  {
    key: 'riskScore',
    label: 'Riesgo',
    sortable: true,
    align: 'center',
    sortAccessor: (a) => a.riskScore,
    render: (a) => <RiskBadge score={a.riskScore} size="sm" />,
  },
  {
    key: 'location',
    label: 'Ciudad',
    render: (a) => a.location?.city ?? '—',
  },
  {
    key: 'status',
    label: 'Estado',
    align: 'center',
    render: (a) => <StatusBadge type="transaction" status={a.status} size="sm" />,
  },
];

const EXPORT_COLUMNS: ExportColumn<Alert>[] = [
  { header: 'ID', accessor: (a) => a.id },
  { header: 'Fecha', accessor: (a) => formatDateTime(a.timestamp) },
  { header: 'Usuario', accessor: (a) => a.user },
  { header: 'Banco', accessor: (a) => a.bank.name },
  { header: 'Tipo', accessor: (a) => a.type },
  { header: 'Monto', accessor: (a) => a.amount },
  { header: 'Riesgo', accessor: (a) => `${a.riskScore}%` },
  { header: 'Nivel', accessor: (a) => a.alertLevel },
  { header: 'Ciudad', accessor: (a) => a.location.city },
  { header: 'Canal', accessor: (a) => a.channel },
  { header: 'Estado', accessor: (a) => a.status },
];

export function AlertsPage() {
  const [searchParams] = useSearchParams();
  const { selectedBank } = useBank();

  useEffect(() => {
    document.title = 'Alertas — TriDa';
  }, []);

  const { alerts, loading, error, counts, refetch } = useAlerts(selectedBank);

  const initialLevel = (searchParams.get('level') as RiskLevel | null) ?? 'all';
  const [filterLevel, setFilterLevel] = useState<RiskLevel | 'all'>(initialLevel);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [sort, setSort] = useState<SortConfig<Alert>>({ field: 'timestamp', direction: 'desc' });
  const [selected, setSelected] = useState<Alert | null>(null);
  const [exportPreview, setExportPreview] = useState<ExportMetadata | null>(null);

  const filteredAlerts = useMemo(() => {
    let result = alerts;
    if (filterLevel !== 'all') result = result.filter((a) => a.alertLevel === filterLevel);
    if (filterStatus !== 'all') result = result.filter((a) => a.status === filterStatus);
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.id.toLowerCase().includes(query) ||
          a.user.toLowerCase().includes(query) ||
          a.bank.name.toLowerCase().includes(query) ||
          a.location.city.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query),
      );
    }
    return result;
  }, [alerts, filterLevel, filterStatus, debouncedSearch]);

  const {
    items: pagedAlerts,
    page,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  } = usePagination(filteredAlerts, { pageSize: 30 });

  const handleClearFilters = useCallback(() => {
    setFilterLevel('all');
    setFilterStatus('all');
    setSearch('');
  }, []);

  const hasActiveFilters = filterLevel !== 'all' || filterStatus !== 'all' || search.trim() !== '';

  // ==============================================================================
  // EXPORTACIÓN ASÍNCRONA (NUEVO)
  // ==============================================================================

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf' | 'json' | 'xlsx'): Promise<void> => {
      try {
        await exportData({
          format,
          data: filteredAlerts, // Corregido: antes decía filteredTransactions
          columns: EXPORT_COLUMNS,
          filenamePrefix: 'alertas_trida',
          title: 'ALERTAS — TriDa Sistema Antifraude',
          pdfRowLimit: 500, // Previene colgar el navegador con PDFs gigantes
        });
      } catch (err) {
        console.error('Error al exportar:', err);
      }
    },
    [filteredAlerts],
  );

  const handlePreview = useCallback(
    (format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
      const preview = buildExportPreview(format, filteredAlerts, 5, 'alertas_trida');
      setExportPreview(preview);
    },
    [filteredAlerts],
  );

  // ==============================================================================
  // RENDER — LOADING SKELETONS
  // ==============================================================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col gap-5 p-6 font-sans md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </header>
        <div className="flex gap-4 border-b border-[var(--border)] pb-4">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
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
            <Button variant="primary" onClick={() => refetch()}>
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  // ==============================================================================
  // RENDER — PAGE
  // ==============================================================================

  return (
    <div className="flex min-h-screen flex-col gap-5 p-6 font-sans md:p-8">
      {/* HEADER */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            <ShieldAlert size={24} />
            Centro de Alertas
          </h1>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            Gestión de alertas de fraude detectadas por IA
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <RiskBadge level="critical" mode="level" size="sm" pulse={counts.critical > 0} />
            <span className="text-xs font-bold" style={{ color: RISK_COLORS.critical }}>
              {counts.critical}
            </span>
            <RiskBadge level="high" mode="level" size="sm" />
            <span className="text-xs font-bold" style={{ color: RISK_COLORS.high }}>
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

      {/* FILTROS */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Nivel:
          </span>
          <FilterChip
            label="Todas"
            count={alerts.length}
            active={filterLevel === 'all'}
            onClick={() => setFilterLevel('all')}
          />
          {LEVEL_ORDER.map((level) => (
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Estado:
          </span>
          {STATUS_FILTERS.map((sf) => (
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

      {/* CUERPO: Tabla + Panel */}
      <div className="flex flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {filteredAlerts.length === 0 ? (
            <EmptyState
              preset={alerts.length === 0 ? 'no-alerts' : 'no-results'}
              action={
                alerts.length > 0 ? (
                  <Button variant="ghost" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <DataTable<Alert>
                data={pagedAlerts}
                columns={TABLE_COLUMNS}
                getRowKey={(a) => a.id}
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

        <DetailPanel
          open={selected !== null}
          onClose={() => setSelected(null)}
          title="Detalle de Alerta"
          subtitle={selected?.id}
        >
          {selected && <AlertDetail alert={selected} />}
        </DetailPanel>
      </div>

      <ExportPreviewModal<Alert>
        open={exportPreview !== null}
        onClose={() => setExportPreview(null)}
        preview={exportPreview}
        onDownload={async (format) => {
          await handleExport(format);
          setExportPreview(null);
        }}
        columns={TABLE_COLUMNS}
      />
    </div>
  );
}
