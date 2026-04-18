---
name: szechuan-nova
description: Find, browse, and compose orders from Northern Virginia Chinese restaurants via the szechuan-nova MCP server. Use when the user asks to order Chinese food, plan a meal under nutrition or spice constraints, or browse participating restaurants. Never claim to have completed an order — always hand off to the user's browser for human confirmation and payment.
type: mcp
---

# szechuan-nova

An agent skill for discovering and composing orders from Northern Virginia Chinese restaurants. Backed by a private MCP server; this repo contains only the skill manifest and playbook.

## When to use

Invoke this skill when the user says anything like:

- "Order me some Chinese food"
- "Find a Sichuan place near X"
- "What's a spicy lunch under $20 with no cilantro?"
- "Compose a high-protein meal from <restaurant>"
- "Show the menu at <restaurant>"
- "Put together a pickup order at <restaurant>"

Do NOT use this skill for: non-Chinese cuisines, grocery orders, restaurant reservations, reviews/ratings, or anything that requires actually paying.

## MCP endpoint

```
https://malpractice-pharmacology-builder-citizens.trycloudflare.com/mcp
```

This endpoint is a Cloudflare quick tunnel to the author's private MCP server. It is publicly reachable over HTTPS. The URL is ephemeral — if it stops responding, the tunnel has been torn down; set `MCP_SERVER_URL` in your runtime to your own MCP instance in that case.

- Transport: Streamable HTTP (JSON-RPC 2.0 over POST)
- Auth: none (authless)
- Stateless: each request is self-contained

## Tools

| Tool | Purpose |
|------|---------|
| `search_restaurants` | Find participating restaurants by cuisine and area |
| `get_menu` | Full structured menu for a restaurant |
| `compose_meal` | Suggest meal combinations under price / spice / protein / allergen constraints |
| `check_availability` | Is the restaurant open? Does it support pickup/delivery? |
| `generate_cart_url` | Log an order intent and return a cart-handoff URL |
| `get_recent_orders` | List recent order intents logged on the server (for demos and debugging) |

See `skill/instructions.md` for the detailed playbook and `skill/examples/sample-conversations.md` for worked examples.

## Trust boundary (CRITICAL)

- **The agent NEVER holds payment credentials.** This is a semantic layer, not a checkout.
- **`generate_cart_url` does not place an order.** It logs an intent and returns a URL. The user must open that URL, review the cart on the restaurant's actual ordering page, and complete payment there.
- **Never tell the user "I've placed your order"** or "your order is being prepared." You can say "I've prepared a cart for you to review — open this link to confirm and pay."
- **Nutrition is LLM-estimated**, not chef-verified. Surface the `disclaimer` field verbatim or paraphrased when returning nutrition info.
- **Respect allergen constraints strictly.** If the user says "no peanuts," exclude all items tagged `peanut` — do not substitute or guess.

## Expected conversation shape

1. User: describes what they want (cuisine, area, constraints, budget)
2. Agent: calls `search_restaurants` → presents candidates
3. User: picks a restaurant (or agent picks one if only one match)
4. Agent: calls `compose_meal` with the user's constraints → presents 1–3 options
5. User: picks an option or asks for a variation
6. Agent: calls `check_availability` to confirm the restaurant is open
7. Agent: calls `generate_cart_url` → shows the handoff URL to the user
8. User: clicks the URL, reviews, pays on the restaurant's site

If any step fails (no restaurants match, closed, item unavailable), surface the error clearly and suggest an adjustment.
