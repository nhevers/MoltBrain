# Custom Modes Guide

Learn how to create custom observation modes for different workflows.

## What are Modes?

Modes define how claude-recall captures and categorizes observations. The default `code` mode is optimized for software development, but you can create custom modes for:

- Research and analysis
- Writing and documentation
- Data exploration
- System administration

## Mode Structure

A mode is a JSON file in `extension/profiles/`:

```json
{
  "id": "research",
  "name": "Research Mode",
  "description": "Optimized for research and analysis workflows",
  "observation_types": [
    {
      "type": "finding",
      "description": "A research finding or insight",
      "icon": "🔍"
    },
    {
      "type": "source",
      "description": "A source or reference",
      "icon": "📚"
    },
    {
      "type": "hypothesis",
      "description": "A hypothesis to test",
      "icon": "💡"
    }
  ],
  "concepts": [
    "methodology",
    "data-source",
    "conclusion",
    "limitation"
  ],
  "prompts": {
    "observation": "Analyze this interaction and extract research-relevant observations...",
    "summary": "Summarize this research session..."
  }
}
```

## Creating a Custom Mode

### 1. Create the mode file

```bash
cp extension/profiles/code.json extension/profiles/my-mode.json
```

### 2. Edit the configuration

```json
{
  "id": "my-mode",
  "name": "My Custom Mode",
  "observation_types": [
    // Define your observation types
  ]
}
```

### 3. Activate the mode

In `~/.claude-recall/settings.json`:

```json
{
  "CLAUDE_RECALL_MODE": "my-mode"
}
```

### 4. Restart the worker

```bash
claude-recall restart
```

## Example: Writing Mode

```json
{
  "id": "writing",
  "name": "Writing Mode",
  "description": "For creative writing and documentation",
  "observation_types": [
    {
      "type": "draft",
      "description": "A draft or revision",
      "icon": "📝"
    },
    {
      "type": "feedback",
      "description": "Feedback or critique",
      "icon": "💬"
    },
    {
      "type": "reference",
      "description": "A reference or inspiration",
      "icon": "🔗"
    }
  ],
  "concepts": [
    "tone",
    "structure",
    "audience",
    "style"
  ]
}
```

## Community Modes

Check out community-contributed modes in `contrib/modes/`:

- `research.json` - Research and analysis
- `devops.json` - System administration
- `data.json` - Data science workflows

## Tips

1. **Keep observation types focused** - 3-5 types is usually enough
2. **Use descriptive concepts** - They help with search and filtering
3. **Customize prompts** - Tailor the AI prompts to your workflow
4. **Test incrementally** - Start with small changes and iterate
