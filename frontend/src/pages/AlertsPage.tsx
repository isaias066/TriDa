// ¿Qué? Centro de alertas con paginación/filtros/sort reales en BD.
// ¿Para qué? Badges de nivel fijos; sin usePagination ni autoSort en cliente.

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useAlerts } from '@hooks/useAlerts';
import { Button, EmptyState, Skeleton } from '@components/ui';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { DataTable, type DataTableColumn } from '@components/shared/DataTable';
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

const PAGE_SIZE = 30;

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
    sortable: true,
    render: (a) => <BankBadge bank={a.bank} size="sm" />,
  },
  {
    key: 'type',
    label: 'Tipo',
    sortable: true,
    render: (a) => a.type,
  },
  {
    key: 'amount',
    label: 'Monto',
    sortable: true,
    align: 'right',
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
    render: (a) => <RiskBadge score={a.riskScore} size="sm" />,
  },
  {
    key: 'location',
    label: 'Ciudad',
    sortable: true,
    render: (a) => a.location?.city ?? '—',
  },
  {
    key: 'status',
    label: 'Estado',
    sortable: true,
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

  const initialLevel = (searchParams.get('level') as RiskLevel | 'all' | null) ?? 'all';

  const {
    alerts,
    filteredAlerts,
    loading,
    error,
    refetch,
    counts,
    levelCounts,
    filters,
    setFilters,
    clearFilters,
    sort,
    toggleSort,
    page,
    setPage,
    totalPages,
    totalCount,
    selected,
    setSelected,
  } = useAlerts(selectedBank, {
    initialFilters: {
      search: '',
      level: initialLevel,
      status: 'all',
    },
  });

  const [exportPreview, setExportPreview] = useState<ExportMetadata | null>(null);

  const hasActiveFilters =
    (filters.level && filters.level !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    Boolean(filters.search?.trim());

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf' | 'json' | 'xlsx'): Promise<void> => {
      try {
        await exportData({
          format,
          data: filteredAlerts,
          columns: EXPORT_COLUMNS,
          filenamePrefix: 'alertas_trida',
          title: 'ALERTAS — TriDa Sistema Antifraude',
          pdfRowLimit: 500,
        });
      } catch (err) {
        console.error('Error al exportar:', err);
      }
    },
    [filteredAlerts],
  );

  const handlePreview = useCallback(
    (format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
      setExportPreview(buildExportPreview(format, filteredAlerts, 5, 'alertas_trida'));
    },
    [filteredAlerts],
  );

  if (loading && alerts.length === 0) {
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

  return (
    <div className="flex min-h-screen flex-col gap-5 p-6 font-sans md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
            <ShieldAlert size={24} aria-hidden />
            Centro de Alertas
          </h1>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            {totalCount.toLocaleString('es-CO')} alertas
            {totalPages > 1 && ` · Página ${page + 1} de ${totalPages}`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <RiskBadge level="critical" mode="level" size="sm" pulse={counts.critical > 0} />
            <span className="text-xs font-bold text-[var(--risk-critical)]">{counts.critical}</span>
            <RiskBadge level="high" mode="level" size="sm" />
            <span className="text-xs font-bold text-[var(--risk-high)]">{counts.high}</span>
          </div>
          <ExportButton
            onExport={handleExport}
            onPreview={handlePreview}
            disabled={filteredAlerts.length === 0}
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Nivel:
          </span>
          <FilterChip
            label="Todas"
            count={levelCounts.all}
            active={!filters.level || filters.level === 'all'}
            onClick={() => setFilters({ level: 'all' })}
          />
          {LEVEL_ORDER.map((level) => (
            <FilterChip
              key={level}
              label={RISK_LEVELS[level].label}
              count={levelCounts[level]}
              active={filters.level === level}
              onClick={() => setFilters({ level })}
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
              active={(filters.status ?? 'all') === sf.value}
              onClick={() => setFilters({ status: sf.value })}
            />
          ))}
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <SearchInput
        value={filters.search ?? ''}
        onChange={(val) => setFilters({ search: val })}
        onSearch={() => {}}
        placeholder="Buscar por ID, usuario, banco, ciudad..."
      />

      <div className="flex flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {filteredAlerts.length === 0 ? (
            <EmptyState
              preset={levelCounts.all === 0 ? 'no-alerts' : 'no-results'}
              action={
                levelCounts.all > 0 ? (
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <DataTable<Alert>
                data={alerts}
                columns={TABLE_COLUMNS}
                getRowKey={(a) => a.id}
                sort={sort}
                onSortChange={(next) => toggleSort(String(next.field))}
                selectedRow={selected}
                onRowClick={setSelected}
                hoverable
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
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
