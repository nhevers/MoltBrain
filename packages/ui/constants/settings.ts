export const DEFAULT_SETTINGS = {
  maxObservations: 100,
  maxSummaries: 50,
  maxPrompts: 50,
  autoRefresh: true,
  refreshInterval: 5000,
  showTimestamps: true,
  compactMode: false,
};

export type Settings = typeof DEFAULT_SETTINGS;
