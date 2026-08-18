# @handset/mcp

The [Handset](https://handset.dev) API as an MCP server: give any AI agent
a business phone system — send texts, place calls, read live transcripts
and AI summaries, buy numbers, provision tenants.

## Setup

```bash
# Claude Code
claude mcp add handset -e HANDSET_API_KEY=hs_test_... -- npx -y @handset/mcp
```

```json
// Claude Desktop / Cursor (mcpServers config)
{
  "handset": {
    "command": "npx",
    "args": ["-y", "@handset/mcp"],
    "env": { "HANDSET_API_KEY": "hs_test_..." }
  }
}
```

Use your **test-mode key**: it runs Handset's simulated carrier — numbers
are free and instant, calls answer in a second, nothing touches a real
phone. The server refuses `hs_live_` keys unless `HANDSET_ALLOW_LIVE=1`
is set, because a live key lets the agent text and call real people.

## Tools

Tenants & numbers: `list_tenants`, `create_tenant`, `search_numbers`,
`buy_number`, `list_numbers` · Messaging: `send_message`,
`list_conversations`, `get_thread` · Voice: `make_call`, `get_call`,
`list_calls`, `get_transcript`, `start_transcription`, `list_voicemails` ·
`get_usage`.

## Companion skill

`npx -y @handset/mcp --skill` prints an agent skill (SKILL.md) that teaches
coding agents the Handset integration patterns — pipe it into
`.claude/skills/handset/SKILL.md`.

Docs: https://docs.handset.dev · Get a key: https://handset.dev/early-access
