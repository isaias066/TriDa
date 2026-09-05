// ¿Qué? Utilidades de exportación CSV, PDF real, JSON (y XLSX como CSV fallback).
// ¿Para qué? Centralizar descargas de Alerts, Transactions y otros módulos.
// ¿Impacto? PDF usa jsPDF + autotable (ya no descarga .txt disfrazado).

import type { ExportFormat, ExportMetadata } from '@app-types';

// ==============================================================================
// TYPES
// ==============================================================================

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

export interface ExportConfig<T> {
  format: ExportFormat;
  data: T[];
  columns: ExportColumn<T>[];
  filenamePrefix: string;
  title?: string;
  /** Máx. filas en PDF (tablas muy grandes pesan mucho). Default 500. */
  pdfRowLimit?: number;
}

// ==============================================================================
// HELPERS
// ==============================================================================

function escapeCSV(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function generateFilename(prefix: string, extension: string): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `${prefix}_${stamp}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function cellToString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

// ==============================================================================
// CSV
// ==============================================================================

export function generateCSV<T>(data: T[], columns: ExportColumn<T>[]): string {
  const headers = columns.map((col) => escapeCSV(col.header)).join(',');
  const rows = data.map((item) => columns.map((col) => escapeCSV(col.accessor(item))).join(','));
  return [headers, ...rows].join('\n');
}

export function exportToCSV<T>(config: ExportConfig<T>): void {
  const content = generateCSV(config.data, config.columns);
  // BOM UTF-8 para Excel (tildes / ñ)
  const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, generateFilename(config.filenamePrefix, 'csv'));
}

// ==============================================================================
// JSON
// ==============================================================================

export function exportToJSON<T>(config: ExportConfig<T>): void {
  const structured = config.data.map((item) => {
    const obj: Record<string, string | number | null | undefined> = {};
    for (const col of config.columns) {
      obj[col.header] = col.accessor(item);
    }
    return obj;
  });

  const blob = new Blob([JSON.stringify(structured, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, generateFilename(config.filenamePrefix, 'json'));
}

// ==============================================================================
// PDF (jsPDF + autotable) — PDF real, no .txt
// ==============================================================================

/**
 * Genera un Blob PDF con tabla.
 * Import dinámico para no romper el bundle si aún no instalaste las deps.
 */
export async function generatePDFBlob<T>(
  data: T[],
  columns: ExportColumn<T>[],
  title?: string,
  rowLimit: number = 500,
): Promise<Blob> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  // jspdf-autotable exporta default o named según versión
  const autoTable =
    (autoTableMod as { default?: typeof import('jspdf-autotable').default }).default ??
    (autoTableMod as unknown as typeof import('jspdf-autotable').default);

  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const marginX = 12;
  const pageW = doc.internal.pageSize.getWidth();
  const reportTitle = title?.trim() || 'Reporte TriDa';
  const generatedAt = new Date().toLocaleString('es-CO');
  const limited = data.slice(0, Math.max(1, rowLimit));

  // Cabecera
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 40);
  doc.text(reportTitle, marginX, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  doc.text(`Generado: ${generatedAt}`, marginX, 22);
  doc.text(
    `Registros: ${limited.length.toLocaleString('es-CO')}${
      data.length > limited.length ? ` (de ${data.length.toLocaleString('es-CO')} totales)` : ''
    }`,
    marginX,
    27,
  );

  // Línea decorativa
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.4);
  doc.line(marginX, 30, pageW - marginX, 30);

  const head = [columns.map((c) => c.header)];
  const body = limited.map((item) => columns.map((col) => cellToString(col.accessor(item))));

  autoTable(doc, {
    head,
    body,
    startY: 34,
    margin: { left: marginX, right: marginX },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [30, 30, 40],
      lineColor: [220, 220, 230],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 252],
    },
    didDrawPage: (hookData) => {
      const pageCount = doc.getNumberOfPages();
      const pageCurrent = hookData.pageNumber;
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 150);
      doc.text(
        `TriDa · Antifraude  |  Página ${pageCurrent} de ${pageCount}`,
        marginX,
        doc.internal.pageSize.getHeight() - 8,
      );
    },
  });

  return doc.output('blob');
}

/**
 * Exporta PDF real (.pdf) y descarga el archivo.
 */
export async function exportToPDF<T>(config: ExportConfig<T>): Promise<void> {
  try {
    const blob = await generatePDFBlob(
      config.data,
      config.columns,
      config.title,
      config.pdfRowLimit ?? 500,
    );
    downloadBlob(blob, generateFilename(config.filenamePrefix, 'pdf'));
  } catch (err) {
    console.error('[exportToPDF]', err);
    // Fallback honesto: no fingir PDF con .txt
    throw new Error(
      err instanceof Error
        ? err.message
        : 'No se pudo generar el PDF. Verifica que jspdf y jspdf-autotable estén instalados.',
    );
  }
}

/**
 * Contenido texto solo para preview / depuración (ya no se descarga como “PDF”).
 */
export function generatePDFContent<T>(
  data: T[],
  columns: ExportColumn<T>[],
  title?: string,
  rowLimit: number = 50,
): string {
  const separator = '='.repeat(60);
  const header = title
    ? `${title}\n${separator}\n\n`
    : `REPORTE — ${new Date().toLocaleString('es-CO')}\n${separator}\n\n`;

  const limited = data.slice(0, rowLimit);
  const rows = limited.map((item) =>
    columns.map((col) => cellToString(col.accessor(item))).join(' | '),
  );
  const totalNote =
    data.length > rowLimit ? `\n\nMostrando ${rowLimit} de ${data.length} registros.` : '';

  return header + rows.join('\n') + totalNote;
}

// ==============================================================================
// DISPATCH
// ==============================================================================

/**
 * Exporta en el formato pedido.
 * PDF es async por import dinámico de jsPDF.
 */
export async function exportData<T>(config: ExportConfig<T>): Promise<void> {
  switch (config.format) {
    case 'csv':
      exportToCSV(config);
      break;
    case 'pdf':
      await exportToPDF(config);
      break;
    case 'json':
      exportToJSON(config);
      break;
    case 'xlsx':
      // MVP: sin sheetjs — CSV con aviso en consola (no mentir extensión xlsx)
      console.warn(
        '[exportData] XLSX no implementado en MVP. Descargando CSV. Instala sheetjs si lo necesitas.',
      );
      exportToCSV({ ...config, filenamePrefix: `${config.filenamePrefix}_xlsx-fallback` });
      break;
    default:
      throw new Error(`Formato de exportación no soportado: ${String(config.format)}`);
  }
}

// ==============================================================================
// PREVIEW
// ==============================================================================

export function buildExportPreview<T>(
  format: ExportFormat,
  data: T[],
  sampleSize: number = 5,
  filenamePrefix?: string,
): ExportMetadata {
  const ext = format === 'xlsx' ? 'csv' : format; // preview honesto si xlsx aún no existe
  return {
    format,
    count: data.length,
    sample: data.slice(0, sampleSize) as ExportMetadata['sample'],
    filename: filenamePrefix
      ? generateFilename(filenamePrefix, ext === 'pdf' ? 'pdf' : ext)
      : undefined,
  };
}
