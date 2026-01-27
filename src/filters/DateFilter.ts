/**
 * Date Filter
 * 
 * Filter observations by date range.
 */

export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DateFilterOptions {
  timezone?: string;
}

export class DateFilter {
  private range: DateRange | null = null;
  private preset: DatePreset = 'all';
  private options: DateFilterOptions;

  constructor(options: DateFilterOptions = {}) {
    this.options = options;
  }

  /**
   * Set date range
   */
  setRange(start: Date, end: Date): void {
    this.range = { start, end };
    this.preset = 'all';
  }

  /**
   * Set preset
   */
  setPreset(preset: DatePreset): void {
    this.preset = preset;
    this.range = this.presetToRange(preset);
  }

  /**
   * Get current range
   */
  getRange(): DateRange | null {
    return this.range;
  }

  /**
   * Get current preset
   */
  getPreset(): DatePreset {
    return this.preset;
  }

  /**
   * Clear filter
   */
  clear(): void {
    this.range = null;
    this.preset = 'all';
  }

  /**
   * Check if a date matches the filter
   */
  matches(date: Date | string | number): boolean {
    if (!this.range) return true;

    const d = this.normalizeDate(date);
    return d >= this.range.start && d <= this.range.end;
  }

  /**
   * Filter an array of items
   */
  filter<T>(items: T[], getDate: (item: T) => Date | string | number): T[] {
    if (!this.range) return items;
    return items.filter(item => this.matches(getDate(item)));
  }

  /**
   * Get human-readable description
   */
  getDescription(): string {
    if (!this.range) return 'All time';

    const presetLabels: Record<DatePreset, string> = {
      today: 'Today',
      yesterday: 'Yesterday',
      week: 'This week',
      month: 'This month',
      quarter: 'This quarter',
      year: 'This year',
      all: 'All time',
    };

    if (this.preset !== 'all') {
      return presetLabels[this.preset];
    }

    const start = this.formatDate(this.range.start);
    const end = this.formatDate(this.range.end);
    return `${start} - ${end}`;
  }

  /**
   * Check if filter is active
   */
  isActive(): boolean {
    return this.range !== null && this.preset !== 'all';
  }

  private presetToRange(preset: DatePreset): DateRange | null {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        };

      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          start: yesterday,
          end: new Date(today.getTime() - 1),
        };

      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return {
          start: weekStart,
          end: now,
        };

      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
        };

      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        return {
          start: new Date(now.getFullYear(), quarterMonth, 1),
          end: now,
        };

      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now,
        };

      case 'all':
      default:
        return null;
    }
  }

  private normalizeDate(date: Date | string | number): Date {
    if (date instanceof Date) return date;
    return new Date(date);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
