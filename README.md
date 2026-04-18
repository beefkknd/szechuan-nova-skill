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
https://malpractice-pharmacology-builder-citizens.trycloudflare.com/mcp
```

This endpoint is a Cloudflare quick tunnel to the author's private MCP server. It is publicly reachable over HTTPS but the URL is ephemeral and can change. If the endpoint stops responding, run your own MCP server and set `MCP_SERVER_URL` in your agent runtime. The MCP server implementation is maintained privately.

## How the cart gets filled: the bookmarklet

Restaurants on closed POS platforms (like Peblla) don't accept URL-based cart pre-fill. To bridge from "agent composed a cart" to "user on the restaurant's checkout page with saved card ready," this skill pairs a lightweight handoff page (served by the MCP server) with a tiny JavaScript bookmarklet the user drags to their bookmarks bar once.

Flow:

1. Agent calls `generate_cart_url`. MCP returns a handoff URL — e.g., `https://<mcp-host>/handoff/42`.
2. User opens the handoff URL. First time only: drags the **Fill Cart** link on the page to their bookmarks bar.
3. On the same page, user clicks **"Open <Restaurant> with cart encoded →"**. A new tab opens the real Peblla ordering page with the cart embedded in the URL hash.
4. User clicks the bookmarklet. It reads the hash, writes the cart into the page's `localStorage`, reloads.
5. The restaurant's own site now renders the populated cart. User clicks **Check Out**, pays with their saved card.

The bookmarklet runs inside the user's normal browser, on the restaurant's own origin, with the user's own cookies and saved payment — nothing proxies through our infrastructure. See `bookmarklet/fill-peblla-cart.js` for the source (short, auditable).

## Files

- `SKILL.md` — skill manifest, when-to-use, tool reference, trust boundary
- `skill/instructions.md` — longer playbook for the agent
- `skill/examples/sample-conversations.md` — worked examples
- `skill/handoff-templates/cart-prefill.json.tpl` — cart handoff payload template
- `bookmarklet/fill-peblla-cart.js` — source of the drag-to-install bookmarklet (Peblla tenants)
- `bookmarklet/README.md` — install and usage notes

## License

MIT. See `LICENSE`.
