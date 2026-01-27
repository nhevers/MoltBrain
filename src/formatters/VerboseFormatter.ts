/**
 * Verbose Formatter
 * 
 * Formats observations with full detail for display.
 */

import type { Observation, Summary } from '../types/index.js';

export interface VerboseFormatterOptions {
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  includeAllFiles?: boolean;
  dateFormat?: 'relative' | 'absolute' | 'both';
}

export class VerboseFormatter {
  private options: VerboseFormatterOptions;

  constructor(options: VerboseFormatterOptions = {}) {
    this.options = {
      includeMetadata: true,
      includeTimestamps: true,
      includeAllFiles: true,
      dateFormat: 'both',
      ...options,
    };
  }

  /**
   * Format a single observation
   */
  formatObservation(obs: Observation): string {
    const lines: string[] = [];

    // Header
    lines.push(`## ${this.getTypeEmoji(obs.type)} ${obs.title}`);
    lines.push('');

    // Subtitle
    if (obs.subtitle) {
      lines.push(`*${obs.subtitle}*`);
      lines.push('');
    }

    // Narrative
    if (obs.narrative) {
      lines.push(obs.narrative);
      lines.push('');
    }

    // Facts
    const facts = this.parseArray(obs.facts);
    if (facts.length > 0) {
      lines.push('### Key Facts');
      for (const fact of facts) {
        lines.push(`- ${fact}`);
      }
      lines.push('');
    }

    // Concepts
    const concepts = this.parseArray(obs.concepts);
    if (concepts.length > 0) {
      lines.push(`**Concepts:** ${concepts.map(c => `\`${c}\``).join(' ')}`);
      lines.push('');
    }

    // Files
    if (this.options.includeAllFiles) {
      const filesRead = this.parseArray(obs.files_read);
      const filesModified = this.parseArray(obs.files_modified);

      if (filesRead.length > 0) {
        lines.push('**Files Read:**');
        for (const file of filesRead) {
          lines.push(`- \`${file}\``);
        }
        lines.push('');
      }

      if (filesModified.length > 0) {
        lines.push('**Files Modified:**');
        for (const file of filesModified) {
          lines.push(`- \`${file}\``);
        }
        lines.push('');
      }
    }

    // Metadata
    if (this.options.includeMetadata) {
      const meta: string[] = [];
      meta.push(`Project: ${obs.project}`);
      meta.push(`Type: ${obs.type}`);
      if (obs.prompt_number) {
        meta.push(`Prompt #${obs.prompt_number}`);
      }
      if (this.options.includeTimestamps && obs.created_at) {
        meta.push(this.formatDate(obs.created_at));
      }
      lines.push(`*${meta.join(' | ')}*`);
    }

    return lines.join('\n');
  }

  /**
   * Format multiple observations
   */
  formatObservations(observations: Observation[]): string {
    return observations
      .map(obs => this.formatObservation(obs))
      .join('\n\n---\n\n');
  }

  /**
   * Format a summary
   */
  formatSummary(summary: Summary): string {
    const lines: string[] = [];

    lines.push('# Session Summary');
    lines.push('');

    if (summary.request) {
      lines.push('## What was requested');
      lines.push(summary.request);
      lines.push('');
    }

    if (summary.investigated) {
      lines.push('## What was investigated');
      lines.push(summary.investigated);
      lines.push('');
    }

    if (summary.learned) {
      lines.push('## What was learned');
      lines.push(summary.learned);
      lines.push('');
    }

    if (summary.completed) {
      lines.push('## What was completed');
      lines.push(summary.completed);
      lines.push('');
    }

    if (summary.next_steps) {
      lines.push('## Next steps');
      lines.push(summary.next_steps);
      lines.push('');
    }

    if (summary.notes) {
      lines.push('## Notes');
      lines.push(summary.notes);
      lines.push('');
    }

    // Metadata
    if (this.options.includeMetadata) {
      lines.push('---');
      lines.push(`*Project: ${summary.project} | Session: ${summary.session_id.slice(0, 8)}*`);
    }

    return lines.join('\n');
  }

  /**
   * Format full session with summary and observations
   */
  formatSession(summary: Summary, observations: Observation[]): string {
    const lines: string[] = [];

    lines.push(this.formatSummary(summary));
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('# Observations');
    lines.push('');
    lines.push(this.formatObservations(observations));

    return lines.join('\n');
  }

  /**
   * Format for terminal output
   */
  formatForTerminal(obs: Observation): string {
    const lines: string[] = [];
    const typeColors: Record<string, string> = {
      discovery: '\x1b[34m',
      decision: '\x1b[35m',
      implementation: '\x1b[32m',
      issue: '\x1b[31m',
      learning: '\x1b[33m',
      reference: '\x1b[36m',
    };
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const dim = '\x1b[2m';

    const color = typeColors[obs.type] || '';

    lines.push(`${bold}${color}[${obs.type.toUpperCase()}]${reset} ${bold}${obs.title}${reset}`);

    if (obs.subtitle) {
      lines.push(`${dim}${obs.subtitle}${reset}`);
    }

    if (obs.narrative) {
      lines.push('');
      lines.push(obs.narrative);
    }

    const concepts = this.parseArray(obs.concepts);
    if (concepts.length > 0) {
      lines.push('');
      lines.push(`${dim}Concepts: ${concepts.join(', ')}${reset}`);
    }

    return lines.join('\n');
  }

  private getTypeEmoji(type: string): string {
    const emojis: Record<string, string> = {
      discovery: '🔍',
      decision: '⚖️',
      implementation: '🔧',
      issue: '🐛',
      learning: '📚',
      reference: '🔗',
    };
    return emojis[type] || '📝';
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    switch (this.options.dateFormat) {
      case 'relative':
        return this.getRelativeTime(d);
      case 'absolute':
        return d.toLocaleString();
      case 'both':
      default:
        return `${this.getRelativeTime(d)} (${d.toLocaleString()})`;
    }
  }

  private getRelativeTime(date: Date): string {
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
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
