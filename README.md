# szechuan-nova-skill

An agent skill for discovering and composing orders from Northern Virginia Chinese restaurants. Designed for MCP-aware runtimes (Claude Desktop, Claude Code, Gemini CLI, OpenClaw, and similar).

The skill is a semantic layer only. It does not hold payment credentials, does not process payments, and does not place orders on the user's behalf. It returns structured menu data and a cart-handoff URL for the user to confirm and pay on the restaurant's own site.

## Install

Clone this repo and register the directory as a skill in your agent runtime.

```bash
git clone https://github.com/beefkknd/szechuan-nova-skill.git
```

Then point your runtime at `SKILL.md` per its own skill-installation docs.

## MCP server

The skill connects to a remote MCP server at:

```
http://100.111.157.36:8787/mcp
```

This endpoint is reachable over the author's Tailscale network only. To use the skill from a different network, run your own MCP server and set `MCP_SERVER_URL` in your agent runtime. The MCP server implementation is maintained privately.

## Files

- `SKILL.md` — skill manifest, when-to-use, tool reference, trust boundary
- `skill/instructions.md` — longer playbook for the agent
- `skill/examples/sample-conversations.md` — worked examples
- `skill/handoff-templates/cart-prefill.json.tpl` — cart handoff payload template

## License

MIT. See `LICENSE`.
