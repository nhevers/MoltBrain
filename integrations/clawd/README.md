# MoltBrain for OpenClaw

Long-term memory extension for [OpenClaw](https://github.com/openclaw/openclaw) that learns and recalls your context automatically.

## Installation

### Option 1: As OpenClaw Extension (Recommended)

#### For Bundled Installation

If you're using OpenClaw from source or have cloned the repository:

1. **Copy the extension to OpenClaw's extensions directory:**
   ```bash
   cd your-openclaw-installation/extensions
   git clone https://github.com/nhevers/moltbrain.git moltbrain
   cd moltbrain/integrations/openclaw
   ```

2. **Install dependencies and build:**
   ```bash
   npm install && npm run build
   ```

3. **Enable the plugin:**
   ```bash
   pnpm openclaw plugins enable moltbrain
   ```
   
   **Important:** Bundled plugins are disabled by default in OpenClaw. You must explicitly enable them.

4. **Configure in OpenClaw config** (optional):
   ```json
   {
     "plugins": {
       "entries": {
         "moltbrain": {
           "enabled": true,
           "config": {
             "dataDir": ".moltbrain",
             "maxMemories": 10,
             "autoCapture": true
           }
         }
       }
     }
   }
   ```

5. **Restart OpenClaw gateway** (if running) to apply changes.

#### For Standalone Installation

If you're installing in a user directory:

1. **Clone to your extensions directory:**
   ```bash
   cd ~/.openclaw/extensions
   git clone https://github.com/nhevers/moltbrain.git moltbrain
   cd moltbrain/integrations/openclaw
   npm install && npm run build
   ```

2. **Enable the plugin:**
   ```bash
   pnpm openclaw plugins enable moltbrain
   ```

3. **Restart OpenClaw gateway.**

### Option 2: As OpenClaw Skill

Copy `skill.json` to your OpenClaw skills directory:

```bash
cp integrations/openclaw/skill.json ~/.openclaw/skills/moltbrain.json
```

Configure in your OpenClaw config:

```json
{
  "skills": {
    "moltbrain": {
      "maxMemories": 10,
      "channels": ["discord", "slack", "imessage"]
    }
  }
}
```

### Option 3: Via MCP Server

Start the MCP server:

```bash
npm run mcp:start
```

Add to your OpenClaw MCP config:

```json
{
  "mcp": {
    "servers": {
      "moltbrain": {
        "command": "node",
        "args": ["path/to/moltbrain/src/mcp/server.js", "--stdio"]
      }
    }
  }
}
```

## Features

### Automatic Memory Capture

The extension hooks into OpenClaw's agent loop to automatically capture:

- **Preferences**: User-stated preferences and likes/dislikes
- **Decisions**: Important decisions made during conversations
- **Learnings**: Technical insights and discoveries
- **Context**: Project-specific information

### Context Injection

Before each response, relevant memories are automatically injected into the context, giving OpenClaw awareness of past interactions.

### Multi-Channel Support

Works across all OpenClaw channels:
- Discord
- Slack
- iMessage
- Microsoft Teams
- Signal
- WebChat

## Available Tools

When installed as an extension, these tools become available to the OpenClaw agent:

### `recall_context`

Retrieve relevant memories based on current context.

**Parameters:**
- `context` (string): The current context to find relevant memories for
- `maxResults` (number, optional): Maximum number of memories to return (default: 10)

**Example:**
```
recall_context("working on the authentication module")
```

### `search_memories`

Search through stored memories.

**Parameters:**
- `query` (string): Search query
- `limit` (number, optional): Maximum results to return (default: 20)
- `types` (array of strings, optional): Filter by memory types (preference, decision, learning, context)

**Example:**
```
search_memories("database schema", limit=10, types=["decision", "learning"])
```

### `save_memory`

Manually save important information.

**Parameters:**
- `content` (string): The information to remember
- `type` (string): Type of memory - one of: "preference", "decision", "learning", "context"
- `metadata` (object, optional): Additional metadata to store

**Example:**
```
save_memory("Always use prepared statements for SQL queries", type="preference")
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dataDir` | string | `.moltbrain` | Storage directory |
| `maxMemories` | number | `10` | Max memories per context |
| `autoCapture` | boolean | `true` | Auto-capture observations |
| `channels` | array | `[]` | Enabled channels (empty = all) |

## Troubleshooting

### Plugin Not Loading

**Problem:** Plugin shows as "disabled" in `pnpm openclaw plugins list`

**Solution:**
1. Enable the plugin: `pnpm openclaw plugins enable moltbrain`
2. Restart the OpenClaw gateway
3. Verify in config: `plugins.entries.moltbrain.enabled` should be `true`

### Tools Not Appearing

**Problem:** Tools (`recall_context`, `search_memories`, `save_memory`) don't appear in agent's tool list

**Solution:**
1. Verify plugin is enabled (see above)
2. Rebuild TypeScript: `npm run build` or `pnpm tsc`
3. Restart OpenClaw gateway
4. Check logs for registration messages: `[moltbrain] Extension register() called`

### Bundled Plugin Disabled by Default

**Note:** If the extension is installed in OpenClaw's `extensions/` directory (bundled), it will be disabled by default. You must explicitly enable it using `pnpm openclaw plugins enable moltbrain`.

## API

### Hooks

The extension implements these OpenClaw lifecycle hooks:

- `onSessionStart`: Initialize session memory
- `onMessage`: Inject relevant context
- `onResponse`: Extract and save observations
- `onSessionEnd`: Generate session summary

### MCP Methods

When using MCP, these methods are available:

- `memory/search`: Search memories
- `memory/recall`: Get context-relevant memories
- `memory/save`: Store new memory
- `memory/timeline`: Get recent activity

## MoltBook Integration

MoltBrain integrates with [MoltBook](https://moltbook.com) to share memories and learn from other agents. See the [MoltBook integration guide](../../integrations/moltbook/README.md) for details.

## Development

### Building

```bash
npm install
npm run build
```

### Watching for Changes

```bash
npm run watch
```

## License

MIT
