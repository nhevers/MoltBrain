/**
 * Favorites Manager
 * 
 * High-level API for managing favorites with event handling.
 */

import { FavoritesStore, getFavoritesStore, type FavoriteItem } from './FavoritesStore.js';

export interface FavoriteEvent {
  type: 'add' | 'remove' | 'update' | 'clear';
  observationId?: number;
  item?: FavoriteItem;
}

type FavoriteEventHandler = (event: FavoriteEvent) => void;

export class FavoritesManager {
  private store: FavoritesStore;
  private listeners: Set<FavoriteEventHandler> = new Set();

  constructor(store?: FavoritesStore) {
    this.store = store || getFavoritesStore();
  }

  /**
   * Add to favorites
   */
  add(observationId: number, note?: string): FavoriteItem {
    const item = this.store.add(observationId, note);
    this.emit({ type: 'add', observationId, item });
    return item;
  }

  /**
   * Remove from favorites
   */
  remove(observationId: number): boolean {
    const result = this.store.remove(observationId);
    if (result) {
      this.emit({ type: 'remove', observationId });
    }
    return result;
  }

  /**
   * Toggle favorite status
   */
  toggle(observationId: number, note?: string): boolean {
    const isFavorite = this.store.toggle(observationId, note);
    this.emit({
      type: isFavorite ? 'add' : 'remove',
      observationId,
      item: isFavorite ? this.store.get(observationId) : undefined,
    });
    return isFavorite;
  }

  /**
   * Check if favorited
   */
  isFavorite(observationId: number): boolean {
    return this.store.isFavorite(observationId);
  }

  /**
   * Get favorite item
   */
  get(observationId: number): FavoriteItem | undefined {
    return this.store.get(observationId);
  }

  /**
   * Get all favorites
   */
  getAll(): FavoriteItem[] {
    return this.store.getAll();
  }

  /**
   * Get all favorite IDs
   */
  getAllIds(): number[] {
    return this.store.getAllIds();
  }

  /**
   * Get count
   */
  count(): number {
    return this.store.count();
  }

  /**
   * Update note
   */
  updateNote(observationId: number, note: string): boolean {
    const result = this.store.updateNote(observationId, note);
    if (result) {
      this.emit({
        type: 'update',
        observationId,
        item: this.store.get(observationId),
      });
    }
    return result;
  }

  /**
   * Get recent favorites
   */
  getRecent(limit: number = 10): FavoriteItem[] {
    return this.store.getSortedByDate().slice(0, limit);
  }

  /**
   * Search by note
   */
  search(query: string): FavoriteItem[] {
    return this.store.searchByNote(query);
  }

  /**
   * Clear all favorites
   */
  clear(): void {
    this.store.clear();
    this.emit({ type: 'clear' });
  }

  /**
   * Subscribe to events
   */
  on(handler: FavoriteEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  /**
   * Export data
   */
  export(): FavoriteItem[] {
    return this.store.export();
  }

  /**
   * Import data
   */
  import(items: FavoriteItem[]): void {
    this.store.import(items);
  }

  private emit(event: FavoriteEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Favorite event handler error:', error);
      }
    }
  }
}

// Singleton instance
let instance: FavoritesManager | null = null;

export function getFavoritesManager(): FavoritesManager {
  if (!instance) {
    instance = new FavoritesManager();
  }
  return instance;
}
