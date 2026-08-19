// ¿Qué? Modal que muestra vista previa de los primeros N registros antes de exportar.
// ¿Para qué? Reemplazar los modales de preview duplicados en Alerts y Transactions
//            con implementaciones idénticas de vista previa + descarga.
// ¿Impacto? Todos los previews de exportación del sistema usan este modal,
//           garantizando consistencia visual y comportamiento.

import { useMemo } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { EmptyState } from '@components/ui/EmptyState';
import type { ExportFormat, ExportMetadata } from '@app-types';
import type { DataTableColumn } from './DataTable';
import { Eye, FileSpreadsheet, FileText, FileJson } from 'lucide-react';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ExportPreviewModalProps<T> {
  open: boolean;
  onClose: () => void;
  preview: ExportMetadata | null;
  onDownload: (format: ExportFormat) => void;
  columns: DataTableColumn<T>[];
  title?: string;
  description?: string;
  downloading?: boolean;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function getFormatMeta(format: ExportFormat): {
  icon: React.ReactNode;
  label: string;
} {
  switch (format) {
    case 'csv':
      return { icon: <FileSpreadsheet size={14} />, label: 'CSV' };
    case 'pdf':
      return { icon: <FileText size={14} />,        label: 'PDF' };
    case 'json':
      return { icon: <FileJson size={14} />,        label: 'JSON' };
    case 'xlsx':
      return { icon: <FileSpreadsheet size={14} />, label: 'Excel' };
    default:
      return { icon: <FileText size={14} />,        label: String(format).toUpperCase() };
  }
}

// ==============================================================================
// COMPONENTE
// ==============================================================================

export function ExportPreviewModal<T>({
  open,
  onClose,
  preview,
  onDownload,
  columns,
  title,
  description,
  downloading = false,
}: ExportPreviewModalProps<T>) {

  // ==============================================================================
  // COMPUTED VALUES
  // ==============================================================================

  const formatMeta = useMemo(
    () => preview ? getFormatMeta(preview.format) : null,
    [preview]
  );

  const modalTitle = title ?? (
    formatMeta
      ? `Vista previa — ${formatMeta.label}`
      : 'Vista previa de exportación'
  );

  const modalDescription = description ?? (
    preview
      ? `${preview.count.toLocaleString('es-CO')} registros serán exportados`
      : undefined
  );

  const sampleData = (preview?.sample ?? []) as T[];
  const showingCount = sampleData.length;
  const totalCount = preview?.count ?? 0;
  const hasMore = totalCount > showingCount;

  // ==============================================================================
  // HANDLERS
  // ==============================================================================

  const handleDownload = (): void => {
    if (!preview) return;
    onDownload(preview.format);
  };

  // ==============================================================================
  // ESTILOS DE LA TABLA DE PREVIEW
  // ==============================================================================

  const infoBarStyle: React.CSSProperties = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        '10px 12px',
    background:     'var(--bg-tertiary)',
    borderRadius:   '6px',
    marginBottom:   '12px',
    fontSize:       '12px',
    color:          'var(--text-secondary)',
    fontWeight:     500,
  };

  const infoLeftStyle: React.CSSProperties = {
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
  };

  const infoBadgeStyle: React.CSSProperties = {
    padding:      '3px 8px',
    background:   'rgba(99, 102, 241, 0.15)',
    color:        '#818CF8',
    borderRadius: '4px',
    fontSize:     '11px',
    fontWeight:   700,
    fontVariantNumeric: 'tabular-nums',
  };

  const tableWrapperStyle: React.CSSProperties = {
    border:        '1px solid var(--border)',
    borderRadius:  '6px',
    overflow:      'hidden',
    background:    'var(--bg-primary)',
  };

  const tableScrollStyle: React.CSSProperties = {
    overflowX: 'auto',
    maxHeight: '400px',
    overflowY: 'auto',
  };

  const tableStyle: React.CSSProperties = {
    width:          '100%',
    borderCollapse: 'collapse',
    fontSize:       '12px',
    fontFamily:     'Inter, sans-serif',
  };

  const thStyle: React.CSSProperties = {
    padding:        '10px 12px',
    background:     'var(--bg-tertiary)',
    color:          'var(--text-secondary)',
    fontWeight:     700,
    fontSize:       '10px',
    textTransform:  'uppercase',
    letterSpacing:  '0.05em',
    textAlign:      'left',
    borderBottom:   '1px solid var(--border)',
    whiteSpace:     'nowrap',
    position:       'sticky',
    top:            0,
    zIndex:         1,
  };

  const tdStyle: React.CSSProperties = {
    padding:      '8px 12px',
    color:        'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace:   'nowrap',
    maxWidth:     '250px',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
  };

  const footerNoteStyle: React.CSSProperties = {
    fontSize:   '11px',
    color:      'var(--text-tertiary)',
    marginTop:  '10px',
    textAlign:  'center',
    fontStyle:  'italic',
  };

  // ==============================================================================
  // RENDER
  // ==============================================================================

  if (!preview) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDescription}
      size="xl"
      disableClose={downloading}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={downloading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            leftIcon={formatMeta?.icon}
            onClick={handleDownload}
            loading={downloading}
          >
            Descargar {formatMeta?.label}
          </Button>
        </>
      }
    >
      {/* Info bar con formato y cantidad */}
      <div style={infoBarStyle}>
        <div style={infoLeftStyle}>
          <Eye size={13} />
          <span>Mostrando primeros {showingCount} registros</span>
        </div>
        <div style={infoBadgeStyle}>
          Total: {totalCount.toLocaleString('es-CO')}
        </div>
      </div>

      {/* Tabla de preview */}
      {sampleData.length === 0 ? (
        <EmptyState
          preset="no-data"
          title="Sin datos para exportar"
          description="Aplica menos filtros para obtener resultados."
          size="sm"
        />
      ) : (
        <div style={tableWrapperStyle}>
          <div style={tableScrollStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        ...thStyle,
                        textAlign: col.align ?? 'left',
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleData.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          ...tdStyle,
                          textAlign: col.align ?? 'left',
                        }}
                        title={typeof col.render(item, rowIndex) === 'string' ? String(col.render(item, rowIndex)) : undefined}
                      >
                        {col.render(item, rowIndex)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota indicando que hay más registros */}
      {hasMore && (
        <p style={footerNoteStyle}>
          … y {(totalCount - showingCount).toLocaleString('es-CO')} registros más se incluirán en el archivo descargado.
        </p>
      )}

      {/* Nombre de archivo esperado */}
      {preview.filename && (
        <p style={{ ...footerNoteStyle, marginTop: 6 }}>
          Nombre de archivo: <strong>{preview.filename}</strong>
        </p>
      )}
    </Modal>
  );
}