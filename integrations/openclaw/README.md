# Claude Recall for MoltBot

Long-term memory extension for [MoltBot](https://github.com/moltbot/moltbot) that learns and recalls your context automatically.

## Installation

### Option 1: As MoltBot Extension (Recommended)

#### For Bundled Installation

If you're using MoltBot from source or have cloned the repository:

1. **Copy the extension to MoltBot's extensions directory:**
   ```bash
   cd your-moltbot-installation/extensions
   git clone https://github.com/nhevers/claude-recall.git claude-recall
   cd claude-recall/integrations/clawd
   ```

2. **Install dependencies and build:**
   ```bash
   npm install && npm run build
   ```

3. **Enable the plugin:**
   ```bash
   pnpm moltbot plugins enable claude-recall
   ```
   
   **Important:** Bundled plugins are disabled by default in MoltBot. You must explicitly enable them.

4. **Configure in MoltBot config** (optional):
   ```json
   {
     "plugins": {
       "entries": {
         "claude-recall": {
           "enabled": true,
           "config": {
             "dataDir": ".claude-recall",
             "maxMemories": 10,
             "autoCapture": true
           }
         }
       }
     }
   }
   ```

5. **Restart MoltBot gateway** (if running) to apply changes.

#### For Standalone Installation

If you're installing in a user directory:

1. **Clone to your extensions directory:**
   ```bash
   cd ~/.moltbot/extensions
   git clone https://github.com/nhevers/claude-recall.git claude-recall
   cd claude-recall/integrations/clawd
   npm install && npm run build
   ```

2. **Enable the plugin:**
   ```bash
   pnpm moltbot plugins enable claude-recall
   ```

3. **Restart MoltBot gateway.**

### Option 2: As MoltBot Skill

Copy `skill.json` to your MoltBot skills directory:

```bash
cp integrations/clawd/skill.json ~/.moltbot/skills/claude-recall.json
```

Configure in your MoltBot config:

```json
{
  "skills": {
    "claude-recall": {
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

Add to your MoltBot MCP config:

```json
{
  "mcp": {
    "servers": {
      "claude-recall": {
        "command": "node",
        "args": ["path/to/claude-recall/src/mcp/server.js", "--stdio"]
      }
    }
  }
}
```

## Features

### Automatic Memory Capture

The extension hooks into MoltBot's agent loop to automatically capture:

- **Preferences**: User-stated preferences and likes/dislikes
- **Decisions**: Important decisions made during conversations
- **Learnings**: Technical insights and discoveries
- **Context**: Project-specific information

### Context Injection

Before each response, relevant memories are automatically injected into the context, giving MoltBot awareness of past interactions.

### Multi-Channel Support

Works across all MoltBot channels:
- Discord
- Slack
- iMessage
- Microsoft Teams
- Signal
- WebChat

## Available Tools

When installed as an extension, these tools become available to the MoltBot agent:

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
| `dataDir` | string | `.claude-recall` | Storage directory |
| `maxMemories` | number | `10` | Max memories per context |
| `autoCapture` | boolean | `true` | Auto-capture observations |
| `channels` | array | `[]` | Enabled channels (empty = all) |

## Troubleshooting

### Plugin Not Loading

**Problem:** Plugin shows as "disabled" in `pnpm moltbot plugins list`

**Solution:**
1. Enable the plugin: `pnpm moltbot plugins enable claude-recall`
2. Restart the MoltBot gateway
3. Verify in config: `plugins.entries.claude-recall.enabled` should be `true`

### Tools Not Appearing

**Problem:** Tools (`recall_context`, `search_memories`, `save_memory`) don't appear in agent's tool list

**Solution:**
1. Verify plugin is enabled (see above)
2. Rebuild TypeScript: `npm run build` or `pnpm tsc`
3. Restart MoltBot gateway
4. Check logs for registration messages: `[claude-recall] Extension register() called`

### Bundled Plugin Disabled by Default

**Note:** If the extension is installed in MoltBot's `extensions/` directory (bundled), it will be disabled by default. You must explicitly enable it using `pnpm moltbot plugins enable claude-recall`.

## API

### Hooks

The extension implements these MoltBot lifecycle hooks:

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
