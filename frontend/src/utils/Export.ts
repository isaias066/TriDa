// ¿Qué? Funciones utilitarias para exportar datos en múltiples formatos (CSV, PDF, TXT).
// ¿Para qué? Centralizar la lógica de exportación que estaba duplicada en Alerts y Transactions.
// ¿Impacto? Todos los módulos que necesiten exportar datos usan estas mismas funciones,
//           garantizando formato consistente y comportamiento predecible.

import type { ExportFormat, ExportMetadata } from '@app-types';

// ==============================================================================
// TYPES INTERNOS
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
  pdfRowLimit?: number;
}

// ==============================================================================
// HELPERS INTERNOS
// ==============================================================================

/**
 * Escapa un valor para uso seguro en CSV.
 *
 * ¿Qué? Envuelve el valor en comillas si contiene comas, comillas o saltos de línea.
 * ¿Para qué? Prevenir que valores con caracteres especiales rompan el formato CSV.
 * ¿Impacto? Cumple con el estándar RFC 4180 de CSV.
 */
function escapeCSV(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);

  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Genera un nombre de archivo con timestamp.
 *
 * @param prefix - Prefijo del nombre (ej: 'transacciones').
 * @param extension - Extensión sin punto (ej: 'csv', 'pdf', 'txt').
 * @returns Nombre completo (ej: 'transacciones_1703001234567.csv').
 */
function generateFilename(prefix: string, extension: string): string {
  return `${prefix}_${Date.now()}.${extension}`;
}

/**
 * Descarga un blob como archivo en el navegador.
 *
 * ¿Qué? Crea un URL temporal y dispara la descarga programáticamente.
 * ¿Para qué? Centralizar el mecanismo de descarga.
 * ¿Impacto? Se usa desde todas las funciones de exportación.
 *
 * @param blob - Contenido del archivo.
 * @param filename - Nombre del archivo.
 */
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

// ==============================================================================
// EXPORTACIÓN A CSV
// ==============================================================================

/**
 * Genera el contenido CSV de un dataset.
 *
 * ¿Qué? Construye el string CSV con encabezados y filas.
 * ¿Para qué? Separar la generación del contenido de la descarga.
 * ¿Impacto? Permite generar CSV para preview sin descargar.
 *
 * @param data - Array de items a exportar.
 * @param columns - Definición de columnas.
 * @returns Contenido CSV como string.
 */
export function generateCSV<T>(
  data: T[],
  columns: ExportColumn<T>[]
): string {
  const headers = columns.map(col => escapeCSV(col.header)).join(',');

  const rows = data.map(item =>
    columns.map(col => escapeCSV(col.accessor(item))).join(',')
  );

  return [headers, ...rows].join('\n');
}

/**
 * Exporta datos como archivo CSV y dispara la descarga.
 *
 * @param config - Configuración de exportación.
 *
 * @example
 * exportToCSV({
 *   format: 'csv',
 *   data: transactions,
 *   columns: [
 *     { header: 'ID',     accessor: t => t.id },
 *     { header: 'Monto',  accessor: t => t.amount },
 *     { header: 'Estado', accessor: t => t.status },
 *   ],
 *   filenamePrefix: 'transacciones',
 * });
 */
export function exportToCSV<T>(config: ExportConfig<T>): void {
  const content = generateCSV(config.data, config.columns);
  const blob = new Blob([`\ufeff${content}`], { type: 'text/csv;charset=utf-8;' });
  //                    ↑ BOM UTF-8 para que Excel abra bien tildes y ñ

  const filename = generateFilename(config.filenamePrefix, 'csv');
  downloadBlob(blob, filename);
}

// ==============================================================================
// EXPORTACIÓN A PDF (formato TXT simulado por ahora)
// ==============================================================================

/**
 * Genera el contenido de un reporte en formato texto plano.
 *
 * NOTE: Actualmente genera un `.txt` con formato tabular.
 * TODO: Migrar a `jsPDF` para generar PDFs reales cuando se implemente.
 *
 * @param data - Array de items a exportar.
 * @param columns - Definición de columnas.
 * @param title - Título opcional del reporte.
 * @param rowLimit - Límite de filas a incluir (default: 50).
 * @returns Contenido del reporte como string.
 */
export function generatePDFContent<T>(
  data: T[],
  columns: ExportColumn<T>[],
  title?: string,
  rowLimit: number = 50
): string {
  const separator = '='.repeat(60);
  const header = title
    ? `${title}\n${separator}\n\n`
    : `REPORTE — ${new Date().toLocaleString('es-CO')}\n${separator}\n\n`;

  const limited = data.slice(0, rowLimit);

  const rows = limited.map(item =>
    columns
      .map(col => {
        const value = col.accessor(item);
        return value === null || value === undefined ? '—' : String(value);
      })
      .join(' | ')
  );

  const totalNote = data.length > rowLimit
    ? `\n\nMostrando ${rowLimit} de ${data.length} registros.`
    : '';

  return header + rows.join('\n') + totalNote;
}

/**
 * Exporta datos como archivo de texto (simulando PDF) y dispara la descarga.
 *
 * @param config - Configuración de exportación.
 *
 */
export function exportToPDF<T>(config: ExportConfig<T>): void {
  const content = generatePDFContent(
    config.data,
    config.columns,
    config.title,
    config.pdfRowLimit
  );

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });

  // TODO: Cuando se migre a jsPDF, cambiar extensión a 'pdf' y tipo MIME
  const filename = generateFilename(config.filenamePrefix, 'txt');
  downloadBlob(blob, filename);
}

// ==============================================================================
// EXPORTACIÓN GENÉRICA (dispatch según formato)
// ==============================================================================

/**
 * Exporta datos en el formato indicado en la configuración.
 *
 * ¿Qué? Función dispatch que llama al exportador correcto según el formato.
 * ¿Para qué? API unificada para exportar sin conocer los detalles de cada formato.
 * ¿Impacto? Los componentes solo necesitan llamar a `exportData()`.
 *
 * @param config - Configuración de exportación.
 * @throws Error si el formato no está soportado.
 */
export function exportData<T>(config: ExportConfig<T>): void {
  switch (config.format) {
    case 'csv':
      exportToCSV(config);
      break;
    case 'pdf':
      exportToPDF(config);
      break;
    case 'xlsx':
      console.warn('Exportación XLSX aún no implementada. Usando CSV como fallback.');
      exportToCSV(config);
      break;
    case 'json':
      exportToJSON(config);
      break;
    default:
      throw new Error(`Formato de exportación no soportado: ${config.format}`);
  }
}

// ==============================================================================
// EXPORTACIÓN A JSON
// ==============================================================================

/**
 * Exporta datos como archivo JSON con formato legible.
 *
 * @param config - Configuración de exportación.
 */
export function exportToJSON<T>(config: ExportConfig<T>): void {
  // Convierte los items usando las columnas para tener nombres consistentes
  const structured = config.data.map(item => {
    const obj: Record<string, string | number | null | undefined> = {};
    for (const col of config.columns) {
      obj[col.header] = col.accessor(item);
    }
    return obj;
  });

  const content = JSON.stringify(structured, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });

  const filename = generateFilename(config.filenamePrefix, 'json');
  downloadBlob(blob, filename);
}

// ==============================================================================
// PREVIEW DE EXPORTACIÓN
// ==============================================================================

/**
 * Genera metadata para vista previa antes de exportar.
 *
 * ¿Qué? Construye el objeto que consume el modal de vista previa.
 * ¿Para qué? Reemplaza `showPreview()` que estaba duplicado en Alerts y Transactions.
 *
 * @param format - Formato que se va a exportar.
 * @param data - Datos completos a exportar.
 * @param sampleSize - Cantidad de items en la muestra (default: 5).
 * @param filenamePrefix - Prefijo del nombre del archivo.
 * @returns Metadata para el modal de preview.
 */
export function buildExportPreview<T>(
  format: ExportFormat,
  data: T[],
  sampleSize: number = 5,
  filenamePrefix?: string
): ExportMetadata {
  return {
    format,
    count:    data.length,
    sample:   data.slice(0, sampleSize),
    filename: filenamePrefix ? generateFilename(filenamePrefix, format) : undefined,
  };
}