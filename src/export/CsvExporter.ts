/**
 * CSV Exporter
 * 
 * Exports observations and sessions to CSV format.
 */

import type { Observation, Summary, Session } from '../types/index.js';

export interface CsvExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'unix' | 'human';
  escapeQuotes?: boolean;
}

export class CsvExporter {
  private options: CsvExportOptions;

  constructor(options: CsvExportOptions = {}) {
    this.options = {
      delimiter: ',',
      includeHeaders: true,
      dateFormat: 'iso',
      escapeQuotes: true,
      ...options,
    };
  }

  /**
   * Export observations to CSV
   */
  exportObservations(observations: Observation[]): string {
    const headers = [
      'id',
      'session_id',
      'type',
      'title',
      'subtitle',
      'narrative',
      'facts',
      'concepts',
      'files_read',
      'files_modified',
      'project',
      'prompt_number',
      'created_at',
      'tokens_used',
    ];

    const rows = observations.map(obs => [
      obs.id,
      obs.session_id,
      obs.type,
      this.escapeField(obs.title),
      this.escapeField(obs.subtitle || ''),
      this.escapeField(obs.narrative || ''),
      this.escapeField(this.arrayToString(obs.facts)),
      this.escapeField(this.arrayToString(obs.concepts)),
      this.escapeField(this.arrayToString(obs.files_read)),
      this.escapeField(this.arrayToString(obs.files_modified)),
      obs.project,
      obs.prompt_number,
      this.formatDate(obs.created_at),
      obs.tokens_used || 0,
    ]);

    return this.buildCsv(headers, rows);
  }

  /**
   * Export sessions to CSV
   */
  exportSessions(sessions: Session[]): string {
    const headers = [
      'id',
      'content_session_id',
      'project',
      'created_at',
      'is_complete',
      'prompt_count',
    ];

    const rows = sessions.map(session => [
      session.id,
      session.content_session_id,
      session.project,
      this.formatDate(session.created_at),
      session.is_complete ? 1 : 0,
      session.prompt_count,
    ]);

    return this.buildCsv(headers, rows);
  }

  /**
   * Export summaries to CSV
   */
  exportSummaries(summaries: Summary[]): string {
    const headers = [
      'id',
      'session_id',
      'project',
      'request',
      'investigated',
      'learned',
      'completed',
      'next_steps',
      'notes',
      'created_at',
    ];

    const rows = summaries.map(summary => [
      summary.id,
      summary.session_id,
      summary.project,
      this.escapeField(summary.request || ''),
      this.escapeField(summary.investigated || ''),
      this.escapeField(summary.learned || ''),
      this.escapeField(summary.completed || ''),
      this.escapeField(summary.next_steps || ''),
      this.escapeField(summary.notes || ''),
      this.formatDate(summary.created_at),
    ]);

    return this.buildCsv(headers, rows);
  }

  /**
   * Export all data to a combined CSV with sections
   */
  exportAll(
    observations: Observation[],
    sessions: Session[],
    summaries: Summary[]
  ): string {
    const sections: string[] = [];

    sections.push('# Observations');
    sections.push(this.exportObservations(observations));
    sections.push('');
    sections.push('# Sessions');
    sections.push(this.exportSessions(sessions));
    sections.push('');
    sections.push('# Summaries');
    sections.push(this.exportSummaries(summaries));

    return sections.join('\n');
  }

  /**
   * Export observations with flattened structure (one row per observation-concept pair)
   */
  exportObservationsFlat(observations: Observation[]): string {
    const headers = [
      'observation_id',
      'session_id',
      'type',
      'title',
      'concept',
      'project',
      'created_at',
    ];

    const rows: any[][] = [];

    for (const obs of observations) {
      const concepts = this.parseArray(obs.concepts);
      if (concepts.length === 0) {
        rows.push([
          obs.id,
          obs.session_id,
          obs.type,
          this.escapeField(obs.title),
          '',
          obs.project,
          this.formatDate(obs.created_at),
        ]);
      } else {
        for (const concept of concepts) {
          rows.push([
            obs.id,
            obs.session_id,
            obs.type,
            this.escapeField(obs.title),
            concept,
            obs.project,
            this.formatDate(obs.created_at),
          ]);
        }
      }
    }

    return this.buildCsv(headers, rows);
  }

  private buildCsv(headers: string[], rows: any[][]): string {
    const lines: string[] = [];
    const { delimiter } = this.options;

    if (this.options.includeHeaders) {
      lines.push(headers.join(delimiter));
    }

    for (const row of rows) {
      lines.push(row.join(delimiter));
    }

    return lines.join('\n');
  }

  private escapeField(value: string): string {
    if (!value) return '""';
    
    if (this.options.escapeQuotes) {
      // Escape quotes and wrap in quotes if contains delimiter, newline, or quote
      const needsQuotes = 
        value.includes(this.options.delimiter!) ||
        value.includes('\n') ||
        value.includes('\r') ||
        value.includes('"');

      if (needsQuotes) {
        return `"${value.replace(/"/g, '""')}"`;
      }
    }

    return value;
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    switch (this.options.dateFormat) {
      case 'unix':
        return String(d.getTime());
      case 'human':
        return d.toLocaleString();
      case 'iso':
      default:
        return d.toISOString();
    }
  }

  private arrayToString(value: any): string {
    const arr = this.parseArray(value);
    return arr.join('; ');
  }

  private parseArray(value: any): string[] {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}
