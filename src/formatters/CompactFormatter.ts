/**
 * Compact Formatter
 * 
 * Formats observations in a compact, token-efficient format.
 */

import type { Observation, Summary } from '../types/index.js';

export interface CompactFormatterOptions {
  maxNarrativeLength?: number;
  includeFacts?: boolean;
  includeConcepts?: boolean;
  includeFiles?: boolean;
  separator?: string;
}

export class CompactFormatter {
  private options: CompactFormatterOptions;

  constructor(options: CompactFormatterOptions = {}) {
    this.options = {
      maxNarrativeLength: 200,
      includeFacts: true,
      includeConcepts: true,
      includeFiles: false,
      separator: ' | ',
      ...options,
    };
  }

  /**
   * Format a single observation
   */
  formatObservation(obs: Observation): string {
    const parts: string[] = [];

    // Type and title
    parts.push(`[${obs.type.toUpperCase()}] ${obs.title}`);

    // Truncated narrative
    if (obs.narrative) {
      const narrative = this.truncate(obs.narrative, this.options.maxNarrativeLength!);
      parts.push(narrative);
    }

    // Facts (condensed)
    if (this.options.includeFacts && obs.facts) {
      const facts = this.parseArray(obs.facts);
      if (facts.length > 0) {
        parts.push(`Facts: ${facts.slice(0, 3).join('; ')}`);
      }
    }

    // Concepts
    if (this.options.includeConcepts && obs.concepts) {
      const concepts = this.parseArray(obs.concepts);
      if (concepts.length > 0) {
        parts.push(`[${concepts.join(', ')}]`);
      }
    }

    // Files
    if (this.options.includeFiles) {
      const files = this.parseArray(obs.files_modified);
      if (files.length > 0) {
        parts.push(`Files: ${files.slice(0, 3).join(', ')}`);
      }
    }

    return parts.join(this.options.separator!);
  }

  /**
   * Format multiple observations
   */
  formatObservations(observations: Observation[]): string {
    return observations.map(obs => this.formatObservation(obs)).join('\n');
  }

  /**
   * Format a summary
   */
  formatSummary(summary: Summary): string {
    const parts: string[] = [];

    if (summary.completed) {
      parts.push(`Done: ${this.truncate(summary.completed, 150)}`);
    }

    if (summary.learned) {
      parts.push(`Learned: ${this.truncate(summary.learned, 150)}`);
    }

    if (summary.next_steps) {
      parts.push(`Next: ${this.truncate(summary.next_steps, 100)}`);
    }

    return parts.join(this.options.separator!);
  }

  /**
   * Format context for injection
   */
  formatContext(observations: Observation[], summary?: Summary): string {
    const lines: string[] = [];

    if (summary) {
      lines.push('## Session Summary');
      lines.push(this.formatSummary(summary));
      lines.push('');
    }

    if (observations.length > 0) {
      lines.push('## Recent Observations');
      lines.push(this.formatObservations(observations));
    }

    return lines.join('\n');
  }

  /**
   * Estimate token count
   */
  estimateTokens(text: string): number {
    // Rough approximation: ~4 chars per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Format to fit within token budget
   */
  formatWithBudget(
    observations: Observation[],
    summary: Summary | undefined,
    maxTokens: number
  ): string {
    let result = '';
    let currentTokens = 0;

    // Add summary first if available
    if (summary) {
      const summaryText = '## Summary\n' + this.formatSummary(summary) + '\n\n';
      const summaryTokens = this.estimateTokens(summaryText);
      if (summaryTokens < maxTokens) {
        result += summaryText;
        currentTokens += summaryTokens;
      }
    }

    // Add observations until budget exhausted
    if (observations.length > 0) {
      result += '## Observations\n';
      currentTokens += 5; // Header tokens

      for (const obs of observations) {
        const obsText = this.formatObservation(obs) + '\n';
        const obsTokens = this.estimateTokens(obsText);

        if (currentTokens + obsTokens > maxTokens) {
          break;
        }

        result += obsText;
        currentTokens += obsTokens;
      }
    }

    return result;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
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
