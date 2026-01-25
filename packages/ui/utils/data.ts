import { Observation, Summary, UserPrompt } from '../types';

export function mergeAndDeduplicateByProject<T extends { id: string | number }>(
  liveData: T[],
  paginatedData: T[]
): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];
  
  // Add live data first (most recent)
  for (const item of liveData) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  
  // Add paginated data that wasn't in live
  for (const item of paginatedData) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      result.push(item);
    }
  }
  
  return result;
}

export function filterByProject<T extends { project?: string }>(
  items: T[],
  project: string
): T[] {
  if (!project) return items;
  return items.filter(item => item.project === project);
}

export function sortByDate<T extends { created_at?: string; timestamp?: string }>(
  items: T[],
  ascending = false
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
    const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}
