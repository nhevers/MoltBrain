/**
 * MCP Request Handlers
 * Handles memory operations for MCP protocol
 */

import {
  MCPRequest,
  MCPResponse,
  MCPErrorCodes,
  MemorySearchParams,
  MemorySearchResult,
  MemoryRecallParams,
  MemoryRecallResult,
  MemorySaveParams,
  MemorySaveResult,
  MemoryTimelineParams,
  MemoryTimelineResult,
  InitializeParams,
  InitializeResult,
  ServerCapabilities,
} from './types.js';

const SERVER_VERSION = '1.0.0';

export class MCPHandlers {
  private initialized = false;
  private dataDir: string;

  constructor(dataDir?: string) {
    this.dataDir = dataDir || process.env.MOLTBRAIN_DATA_DIR || '.moltbrain';
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { id, method, params } = request;

    try {
      // Initialize must be called first
      if (method !== 'initialize' && !this.initialized) {
        return this.errorResponse(id, MCPErrorCodes.NOT_INITIALIZED, 'Server not initialized');
      }

      switch (method) {
        case 'initialize':
          return this.handleInitialize(id, params as InitializeParams);
        case 'memory/search':
          return this.handleSearch(id, params as MemorySearchParams);
        case 'memory/recall':
          return this.handleRecall(id, params as MemoryRecallParams);
        case 'memory/save':
          return this.handleSave(id, params as MemorySaveParams);
        case 'memory/timeline':
          return this.handleTimeline(id, params as MemoryTimelineParams);
        case 'shutdown':
          return this.handleShutdown(id);
        default:
          return this.errorResponse(id, MCPErrorCodes.METHOD_NOT_FOUND, `Unknown method: ${method}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResponse(id, MCPErrorCodes.INTERNAL_ERROR, message);
    }
  }

  private handleInitialize(id: string | number, params?: InitializeParams): MCPResponse {
    this.initialized = true;

    const capabilities: ServerCapabilities = {
      memory: {
        search: true,
        recall: true,
        save: true,
        timeline: true,
      },
      version: SERVER_VERSION,
    };

    const result: InitializeResult = {
      serverInfo: {
        name: 'moltbrain',
        version: SERVER_VERSION,
      },
      capabilities,
    };

    if (params?.clientInfo) {
      console.log(`MCP client connected: ${params.clientInfo.name} v${params.clientInfo.version}`);
    }

    return { jsonrpc: '2.0', id, result };
  }

  private async handleSearch(id: string | number, params: MemorySearchParams): Promise<MCPResponse> {
    if (!params?.query) {
      return this.errorResponse(id, MCPErrorCodes.INVALID_PARAMS, 'Missing required parameter: query');
    }

    // Search implementation - integrates with existing search functionality
    const results: MemorySearchResult[] = await this.searchMemories(params);

    return { jsonrpc: '2.0', id, result: { results } };
  }

  private async handleRecall(id: string | number, params: MemoryRecallParams): Promise<MCPResponse> {
    if (!params?.context) {
      return this.errorResponse(id, MCPErrorCodes.INVALID_PARAMS, 'Missing required parameter: context');
    }

    const result: MemoryRecallResult = await this.recallContext(params);

    return { jsonrpc: '2.0', id, result };
  }

  private async handleSave(id: string | number, params: MemorySaveParams): Promise<MCPResponse> {
    if (!params?.content || !params?.type) {
      return this.errorResponse(id, MCPErrorCodes.INVALID_PARAMS, 'Missing required parameters: content, type');
    }

    const result: MemorySaveResult = await this.saveMemory(params);

    return { jsonrpc: '2.0', id, result };
  }

  private async handleTimeline(id: string | number, params?: MemoryTimelineParams): Promise<MCPResponse> {
    const result: MemoryTimelineResult = await this.getTimeline(params || {});

    return { jsonrpc: '2.0', id, result };
  }

  private handleShutdown(id: string | number): MCPResponse {
    this.initialized = false;
    return { jsonrpc: '2.0', id, result: { success: true } };
  }

  // Memory operation implementations
  private async searchMemories(params: MemorySearchParams): Promise<MemorySearchResult[]> {
    // This will integrate with existing ObservationStore
    const { query, limit = 10, projectPath, types } = params;
    
    // Placeholder - actual implementation connects to SQLite store
    return [];
  }

  private async recallContext(params: MemoryRecallParams): Promise<MemoryRecallResult> {
    const { context, projectPath, maxTokens = 4000 } = params;
    
    // Search for relevant memories based on context
    const memories = await this.searchMemories({
      query: context,
      limit: 20,
      projectPath,
    });

    return {
      memories,
      tokenCount: 0,
    };
  }

  private async saveMemory(params: MemorySaveParams): Promise<MemorySaveResult> {
    const { content, type, projectPath, metadata } = params;
    
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Placeholder - actual implementation saves to SQLite store
    return {
      id,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  private async getTimeline(params: MemoryTimelineParams): Promise<MemoryTimelineResult> {
    const { projectPath, limit = 50, since } = params;
    
    // Placeholder - actual implementation queries SQLite store
    return {
      entries: [],
      totalCount: 0,
      hasMore: false,
    };
  }

  private errorResponse(id: string | number, code: number, message: string): MCPResponse {
    return {
      jsonrpc: '2.0',
      id,
      error: { code, message },
    };
  }
}

export function createHandlers(dataDir?: string): MCPHandlers {
  return new MCPHandlers(dataDir);
}
