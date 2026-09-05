// ¿Qué? Página de transacciones bancarias del sistema TriDa.
// ¿Para qué? Buscar, filtrar, ordenar y exportar transacciones.
// ¿Impacto? Skeletons de carga integrados + Exportación a PDF real (asíncrona).

import { useCallback, useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useTransactions } from '@hooks/useTransactions';
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
import { TransactionDetail } from '@components/transactions';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatTime } from '@utils/Formatters';
import { exportData, buildExportPreview, type ExportColumn } from '@utils/Export';
import { countByRiskLevel } from '@utils/Risk';
import type { Transaction, ExportMetadata, TransactionSortField } from '@app-types';

const LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const STATUS_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'flagged', label: 'Marcadas' },
  { value: 'blocked', label: 'Bloqueadas' },
  { value: 'pending', label: 'Pendientes' },
] as const;

const TABLE_COLUMNS: DataTableColumn<Transaction>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '90px',
    render: (tx) => (
      <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)]">{tx.id}</span>
    ),
  },
  {
    key: 'timestamp',
    label: 'Hora',
    sortable: true,
    width: '80px',
    sortAccessor: (tx) => (tx.timestamp ? new Date(tx.timestamp) : null),
    render: (tx) => <span className="font-mono text-[11px]">{formatTime(tx.timestamp)}</span>,
  },
  {
    key: 'user',
    label: 'Usuario',
    sortable: true,
    render: (tx) => <span className="font-semibold">{tx.user}</span>,
  },
  {
    key: 'bank',
    label: 'Banco',
    render: (tx) => <BankBadge bank={tx.bank} size="sm" />,
  },
  {
    key: 'type',
    label: 'Tipo',
    render: (tx) => tx.type,
  },
  {
    key: 'amount',
    label: 'Monto',
    sortable: true,
    align: 'right',
    sortAccessor: (tx) => tx.amount,
    render: (tx) => (
      <span className="font-mono font-bold tabular-nums text-[var(--text-primary)]">
        {formatCurrency(tx.amount)}
      </span>
    ),
  },
  {
    key: 'riskScore',
    label: 'Riesgo',
    sortable: true,
    align: 'center',
    sortAccessor: (tx) => tx.riskScore,
    render: (tx) => <RiskBadge score={tx.riskScore} size="sm" />,
  },
  {
    key: 'location',
    label: 'Ciudad',
    render: (tx) => tx.location?.city ?? '—',
  },
  {
    key: 'status',
    label: 'Estado',
    align: 'center',
    render: (tx) => <StatusBadge type="transaction" status={tx.status} size="sm" />,
  },
];

const EXPORT_COLUMNS: ExportColumn<Transaction>[] = [
  { header: 'ID', accessor: (t) => t.id },
  { header: 'Fecha', accessor: (t) => t.timestamp ?? '' },
  { header: 'Usuario', accessor: (t) => t.user },
  { header: 'Banco', accessor: (t) => t.bank.name },
  { header: 'Tipo', accessor: (t) => t.type },
  { header: 'Monto', accessor: (t) => t.amount },
  { header: 'Moneda', accessor: (t) => t.currency },
  { header: 'Riesgo', accessor: (t) => `${t.riskScore}%` },
  { header: 'Nivel', accessor: (t) => t.alertLevel },
  { header: 'Ciudad', accessor: (t) => t.location.city },
  { header: 'Canal', accessor: (t) => t.channel },
  { header: 'Estado', accessor: (t) => t.status },
  { header: 'Latencia(ms)', accessor: (t) => t.processingTime },
];

export function TransactionsPage() {
  const { selectedBank } = useBank();

  useEffect(() => {
    document.title = 'Transacciones — TriDa';
  }, []);

  const {
    transactions,
    allTransactions,
    filteredTransactions,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    clearFilters,
    sort,
    toggleSort,
    page,
    totalPages,
    totalCount,
    setPage,
    selected,
    setSelected,
  } = useTransactions(selectedBank);

  const [exportPreview, setExportPreview] = useState<ExportMetadata | null>(null);

  const levelCounts = countByRiskLevel(allTransactions);
  const hasActiveFilters =
    (filters.level && filters.level !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.search && filters.search.trim() !== '');

  // ==============================================================================
  // EXPORTACIÓN ASÍNCRONA (NUEVO)
  // ==============================================================================

  const handleExport = useCallback(
    async (format: 'csv' | 'pdf' | 'json' | 'xlsx'): Promise<void> => {
      try {
        await exportData({
          format,
          data: filteredTransactions,
          columns: EXPORT_COLUMNS,
          filenamePrefix: 'transacciones_trida',
          title: 'TRANSACCIONES — TriDa Sistema Antifraude',
          pdfRowLimit: 500, // Previene colgar el navegador con PDFs gigantes
        });
      } catch (err) {
        console.error('Error al exportar:', err);
      }
    },
    [filteredTransactions],
  );

  const handlePreview = useCallback(
    (format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
      const preview = buildExportPreview(format, filteredTransactions, 5, 'transacciones_trida');
      setExportPreview(preview);
    },
    [filteredTransactions],
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
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </header>
        <div className="flex gap-4 border-b border-[var(--border)] pb-4">
          <Skeleton className="h-8 w-24 rounded-full" />
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
            <Activity size={24} aria-hidden />
            Transacciones
          </h1>
          <p className="m-0 text-[13px] text-[var(--text-secondary)]">
            {totalCount.toLocaleString('es-CO')} registros
            {totalPages > 1 && ` · Página ${page + 1} de ${totalPages}`}
          </p>
        </div>
        <ExportButton
          onExport={handleExport}
          onPreview={handlePreview}
          disabled={filteredTransactions.length === 0}
        />
      </header>

      {/* FILTROS */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
            Nivel:
          </span>
          <FilterChip
            label="Todos"
            count={allTransactions.length}
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
              onClick={() => setFilters({ status: sf.value as Transaction['status'] | 'all' })}
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
        placeholder="Buscar por ID, usuario, banco, ciudad, tipo..."
      />

      {/* CUERPO: Tabla + Panel */}
      <div className="flex flex-1 gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {filteredTransactions.length === 0 ? (
            <EmptyState
              preset={allTransactions.length === 0 ? 'no-data' : 'no-results'}
              title={allTransactions.length === 0 ? 'Sin transacciones' : undefined}
              description={
                allTransactions.length === 0
                  ? 'No se encontraron transacciones para el banco seleccionado.'
                  : undefined
              }
              action={
                allTransactions.length > 0 ? (
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <DataTable<Transaction>
                data={transactions}
                columns={TABLE_COLUMNS}
                getRowKey={(tx) => tx.id}
                sort={sort}
                onSortChange={(newSort) => toggleSort(newSort.field as TransactionSortField)}
                onRowClick={setSelected}
                hoverable
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={30}
                onPageChange={setPage}
              />
            </>
          )}
        </div>

        <DetailPanel
          open={selected !== null}
          onClose={() => setSelected(null)}
          title="Detalle de Transacción"
          subtitle={selected?.id}
          size="lg"
        >
          {selected && <TransactionDetail transaction={selected} />}
        </DetailPanel>
      </div>

      <ExportPreviewModal<Transaction>
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
