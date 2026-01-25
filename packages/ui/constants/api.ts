export const API_ENDPOINTS = {
  OBSERVATIONS: '/api/observations',
  SUMMARIES: '/api/summaries',
  PROMPTS: '/api/prompts',
  STATS: '/api/stats',
  SETTINGS: '/api/settings',
  LOGS: '/api/logs',
  SSE: '/api/sse',
  HEALTH: '/health',
  CONTEXT_PREVIEW: '/api/context-preview',
};

export const API_BASE_URL = `http://localhost:${typeof window !== 'undefined' ? (window as any).__WORKER_PORT__ || 37777 : 37777}`;
