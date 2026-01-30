import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";

console.log("[moltbrain] Module loading - top level");

const moltbrainPlugin = {
  id: "moltbrain",
  name: "MoltBrain Memory",
  description: "Long-term memory layer that learns and recalls your context",
  kind: "extension",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    console.log("[moltbrain] Extension register() called");
    // Register memory tools
    console.log("[moltbrain] Registering recall_context tool");
    api.registerTool(
      {
        name: "recall_context",
        label: "Recall Context",
        description: "Retrieve relevant memories based on current context",
        parameters: Type.Object({
          context: Type.String({ description: "The current context to find relevant memories for" }),
          maxResults: Type.Optional(Type.Number({ description: "Maximum number of memories to return", default: 10 })),
        }),
        async execute(_toolCallId, params) {
          // TODO: Connect to moltbrain API at http://localhost:37777
          return {
            content: [{ type: "text", text: JSON.stringify({ memories: [], count: 0 }, null, 2) }],
            details: { memories: [], count: 0 },
          };
        },
      },
      { name: "recall_context" },
    );
    console.log("[moltbrain] recall_context registered");

    console.log("[moltbrain] Registering search_memories tool");
    api.registerTool(
      {
        name: "search_memories",
        label: "Search Memories",
        description: "Search through stored memories",
        parameters: Type.Object({
          query: Type.String({ description: "Search query" }),
          limit: Type.Optional(Type.Number({ description: "Maximum results to return", default: 20 })),
          types: Type.Optional(Type.Array(Type.String(), { description: "Filter by memory types (preference, decision, learning, context)" })),
        }),
        async execute(_toolCallId, params) {
          // TODO: Connect to moltbrain API at http://localhost:37777
          return {
            content: [{ type: "text", text: JSON.stringify({ results: [], count: 0, query: params.query }, null, 2) }],
            details: { results: [], count: 0, query: params.query },
          };
        },
      },
      { name: "search_memories" },
    );
    console.log("[moltbrain] search_memories registered");

    console.log("[moltbrain] Registering save_memory tool");
    api.registerTool(
      {
        name: "save_memory",
        label: "Save Memory",
        description: "Manually save an important piece of information",
        parameters: Type.Object({
          content: Type.String({ description: "The information to remember" }),
          type: Type.Union([
            Type.Literal("preference"),
            Type.Literal("decision"),
            Type.Literal("learning"),
            Type.Literal("context"),
          ], { description: "Type of memory" }),
          metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown(), { description: "Additional metadata to store" })),
        }),
        async execute(_toolCallId, params) {
          // TODO: Connect to moltbrain API at http://localhost:37777
          const result = { id: `mem_${Date.now()}`, timestamp: new Date().toISOString(), message: "Memory saved successfully" };
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            details: result,
          };
        },
      },
      { name: "save_memory" },
    );
    console.log("[moltbrain] save_memory registered");
    console.log("[moltbrain] All tools registered successfully");
  },
};

export default moltbrainPlugin;
