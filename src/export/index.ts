/**
 * Export Module
 * 
 * Exports all export functionality.
 */

export { JsonExporter } from './JsonExporter.js';
export type { JsonExportOptions, JsonExportData } from './JsonExporter.js';

export { CsvExporter } from './CsvExporter.js';
export type { CsvExportOptions } from './CsvExporter.js';

export { MarkdownExporter } from './MarkdownExporter.js';
export type { MarkdownExportOptions } from './MarkdownExporter.js';

export type ExportFormat = 'json' | 'csv' | 'markdown';

export function createExporter(format: ExportFormat) {
  switch (format) {
    case 'json':
      return new (require('./JsonExporter.js').JsonExporter)();
    case 'csv':
      return new (require('./CsvExporter.js').CsvExporter)();
    case 'markdown':
      return new (require('./MarkdownExporter.js').MarkdownExporter)();
    default:
      throw new Error(`Unknown export format: ${format}`);
  }
}
