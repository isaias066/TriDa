// ¿Qué? Página de transacciones bancarias del sistema TriDa.
// ¿Para qué? Reemplazar transactions.jsx con una versión modular que usa el hook
//            useTransactions (con filtros, sort y paginación integrados) y
//            TransactionDetail para el panel lateral.
// ¿Impacto? Se accede en /transactions. Los analistas pueden buscar, filtrar,
//           ordenar y exportar transacciones del sistema.

import { useCallback, useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useBank } from '@context/BankContext';
import { useTransactions } from '@hooks/useTransactions';
import { Spinner } from '@components/ui/Spinner';
import { EmptyState } from '@components/ui/EmptyState';
import { Button } from '@components/ui/Button';
import { SearchInput } from '@components/shared/SearchInput';
import { FilterChip } from '@components/shared/FilterChip';
import { DataTable } from '@components/shared/DataTable';
import type { DataTableColumn } from '@components/shared/DataTable';
import { Pagination } from '@components/shared/Pagination';
import { DetailPanel } from '@components/shared/DetailPanel';
import { ExportButton } from '@components/shared/ExportButton';
import { ExportPreviewModal } from '@components/shared/ExportPreviewModal';
import { RiskBadge } from '@components/shared/RiskBadge';
import { BankBadge } from '@components/shared/BankBadge';
import { StatusBadge } from '@components/shared/StatusBadge';
import { RISK_COLORS, RISK_LEVELS, type RiskLevel } from '@constants/Risk';
import { formatCurrency, formatTime } from '@utils/Formatters';
import { exportData, buildExportPreview } from '@utils/Export';
import type { ExportColumn } from '@utils/Export';
import { countByRiskLevel } from '@utils/Risk';
import type { Transaction, ExportMetadata, TransactionSortField } from '@app-types';

// ==============================================================================
// CONSTANTES
// ==============================================================================

const LEVEL_ORDER: RiskLevel[] = ['critical', 'high', 'medium', 'low'];

const STATUS_FILTERS = [
  { value: 'all',      label: 'Todos' },
  { value: 'approved', label: '✅ Aprobadas' },
  { value: 'flagged',  label: '⚠️ Marcadas' },
  { value: 'blocked',  label: '🚫 Bloqueadas' },
  { value: 'pending',  label: '⏱ Pendientes' },
] as const;

// ==============================================================================
// COLUMNAS DE LA TABLA
// ==============================================================================

const TABLE_COLUMNS: DataTableColumn<Transaction>[] = [
  {
    key:      'id',
    label:    'ID',
    sortable: true,
    width:    '90px',
    render:   (tx) => (
      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{tx.id}</span>
    ),
  },
  {
    key:          'timestamp',
    label:        'Hora',
    sortable:     true,
    width:        '80px',
    sortAccessor: (tx) => tx.timestamp ? new Date(tx.timestamp) : null,
    render:       (tx) => (
      <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
        {formatTime(tx.timestamp)}
      </span>
    ),
  },
  {
    key:      'user',
    label:    'Usuario',
    sortable: true,
    render:   (tx) => <span style={{ fontWeight: 600 }}>{tx.user}</span>,
  },
  {
    key:    'bank',
    label:  'Banco',
    render: (tx) => <BankBadge bank={tx.bank} size="sm" />,
  },
  {
    key:    'type',
    label:  'Tipo',
    render: (tx) => tx.type,
  },
  {
    key:          'amount',
    label:        'Monto',
    sortable:     true,
    align:        'right',
    sortAccessor: (tx) => tx.amount,
    render:       (tx) => (
      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
        {formatCurrency(tx.amount)}
      </span>
    ),
  },
  {
    key:          'riskScore',
    label:        'Riesgo',
    sortable:     true,
    align:        'center',
    sortAccessor: (tx) => tx.riskScore,
    render:       (tx) => <RiskBadge score={tx.riskScore} size="sm" />,
  },
  {
    key:    'location',
    label:  'Ciudad',
    render: (tx) => tx.location.city,
  },
  {
    key:   'status',
    label: 'Estado',
    align: 'center',
    render: (tx) => (
      <StatusBadge type="transaction" status={tx.status} size="sm" />
    ),
  },
];

// ==============================================================================
// COLUMNAS DE EXPORTACIÓN
// ==============================================================================

const EXPORT_COLUMNS: ExportColumn<Transaction>[] = [
  { header: 'ID',          accessor: (t) => t.id },
  { header: 'Fecha',       accessor: (t) => t.timestamp ?? '' },
  { header: 'Usuario',     accessor: (t) => t.user },
  { header: 'Banco',       accessor: (t) => t.bank.name },
  { header: 'Tipo',        accessor: (t) => t.type },
  { header: 'Monto',       accessor: (t) => t.amount },
  { header: 'Moneda',      accessor: (t) => t.currency },
  { header: 'Riesgo',      accessor: (t) => `${t.riskScore}%` },
  { header: 'Nivel',       accessor: (t) => t.alertLevel },
  { header: 'Ciudad',      accessor: (t) => t.location.city },
  { header: 'Canal',       accessor: (t) => t.channel },
  { header: 'Estado',      accessor: (t) => t.status },
  { header: 'Latencia(ms)', accessor: (t) => t.processingTime },
];

// ==============================================================================
// COMPONENTE
// ==============================================================================

/**
 * Página de transacciones bancarias.
 *
 * @example
 * <Route path="/transactions" element={<TransactionsPage />} />
 */
export function TransactionsPage() {
  const { selectedBank } = useBank();

  // ==============================================================================
  // METADATA
  // ==============================================================================

  useEffect(() => {
    document.title = 'Transacciones — TriDa';
  }, []);

  // ==============================================================================
  // DATOS — useTransactions con filtros, sort y paginación integrados
  // ==============================================================================

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

  // ==============================================================================
  // ESTADO LOCAL — Export preview
  // ==============================================================================

  const [exportPreview, setExportPreview] = useState<ExportMetadata | null>(null);

  // ==============================================================================
  // VALORES DERIVADOS
  // ==============================================================================

  const levelCounts = countByRiskLevel(allTransactions);
  const hasActiveFilters =
    (filters.level && filters.level !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.search && filters.search.trim() !== '');

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleExport = useCallback((format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
    exportData({
      format,
      data:           filteredTransactions,
      columns:        EXPORT_COLUMNS,
      filenamePrefix: 'transacciones_trida',
      title:          'TRANSACCIONES — TriDa Sistema Antifraude',
    });
  }, [filteredTransactions]);

  const handlePreview = useCallback((format: 'csv' | 'pdf' | 'json' | 'xlsx'): void => {
    const preview = buildExportPreview(format, filteredTransactions, 5, 'transacciones_trida');
    setExportPreview(preview);
  }, [filteredTransactions]);

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
        <Spinner size="lg" label="Cargando transacciones..." centered />
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
            <Activity size={24} />
            Transacciones
          </h1>
          <p style={subtitleStyle}>
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

      {/* ================================================================
          FILTROS — Nivel + Estado
          ================================================================ */}

      <div style={filtersRowStyle}>
        {/* Filtro por nivel */}
        <div style={filterGroupStyle}>
          <span style={filterLabelStyle}>Nivel:</span>
          <FilterChip
            label="Todos"
            count={allTransactions.length}
            active={!filters.level || filters.level === 'all'}
            onClick={() => setFilters({ level: 'all' })}
          />
          {LEVEL_ORDER.map(level => (
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

        {/* Filtro por estado */}
        <div style={filterGroupStyle}>
          <span style={filterLabelStyle}>Estado:</span>
          {STATUS_FILTERS.map(sf => (
            <FilterChip
              key={sf.value}
              label={sf.label}
              active={(filters.status ?? 'all') === sf.value}
              onClick={() => setFilters({ status: sf.value as Transaction['status'] | 'all' })}
            />
          ))}
        </div>

        {/* Limpiar filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Búsqueda */}
      <SearchInput
        value={filters.search ?? ''}
        onChange={(val) => setFilters({ search: val })}
        onSearch={() => {}}
        placeholder="Buscar por ID, usuario, banco, ciudad, tipo..."
      />

      {/* ================================================================
          BODY — Tabla + Panel de detalle
          ================================================================ */}

      <div style={bodyStyle}>
        <div style={tableContainerStyle}>
          {filteredTransactions.length === 0 ? (
            allTransactions.length === 0 ? (
              <EmptyState
                preset="no-data"
                title="Sin transacciones"
                description="No se encontraron transacciones para el banco seleccionado."
              />
            ) : (
              <EmptyState
                preset="no-results"
                action={
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            )
          ) : (
            <>
              <DataTable<Transaction>
                data={transactions}
                columns={TABLE_COLUMNS}
                getRowKey={(tx) => tx.id}
                sort={sort}
                onSortChange={(newSort) => toggleSort(newSort.field as TransactionSortField)}                onRowClick={setSelected}
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

        {/* Panel de detalle — usa TransactionDetail */}
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

      {/* ================================================================
          MODAL DE PREVIEW
          ================================================================ */}

      <ExportPreviewModal<Transaction>
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