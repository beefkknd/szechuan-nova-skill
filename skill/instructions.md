# szechuan-nova skill — detailed instructions

This document expands on `SKILL.md` with concrete guidance for how the agent should use each tool and compose the overall flow.

## Activation

Activate `szechuan-nova` when the user's request is ordering-shaped AND mentions Chinese food, Sichuan, or names a participating restaurant. For ambiguous cases ("I'm hungry, suggest something"), ask the user whether they want Chinese food before invoking the skill.

## Tool reference

### `search_restaurants`

**Inputs**
- `cuisine` (string, optional): `"sichuan"`, `"chinese"`
- `near` (string, optional): free-text area. First word is matched against each restaurant's city (case-insensitive).
- `status` (enum, optional): `"open"` | `"any"` — not yet enforced server-side, safe to omit.

**When to call:** first step in almost every conversation, unless the user named a specific restaurant (skip to `get_menu`).

**Failure modes:** zero results. Surface that and ask the user to broaden the area or cuisine.

### `get_menu`

**Inputs**
- `restaurant` (string, required): slug from `search_restaurants`.
- `include_nutrition` (boolean, optional, default `true`).

**When to call:** when the user wants to browse a specific restaurant, pick items manually, or inspect modifiers.

**Do not** dump the entire raw menu to the user. Summarize by section, or filter to items matching the user's stated intent.

### `compose_meal`

**Inputs**
- `restaurant` (string, required)
- `max_price_cents` (int, optional)
- `spicy` (boolean, optional)
- `protein_min_g` (int, optional)
- `avoid_allergens` (string array, optional)
- `avoid_ingredients` (string array, optional) — matched against item descriptions (case-insensitive substring).
- `max_suggestions` (int, optional, 1..5)

**When to call:** user has constraints (price, spice, protein, allergens) and wants the skill to suggest rather than pick manually.

**Presentation:** return 1–3 composed meals. For each, show: dish names, total price, estimated protein, and the `notes` array (which flags confidence and missing-target warnings). Let the user pick or ask for variations.

### `check_availability`

**Inputs**
- `restaurant` (string, required)
- `at` (ISO timestamp, optional, default now)
- `mode` (enum, optional): `"pickup"` | `"delivery"`

**When to call:** before `generate_cart_url`, always. If the restaurant is closed, do not generate a cart — surface it and ask the user whether to schedule for later or pick another restaurant.

### `generate_cart_url`

**Inputs**
- `restaurant` (string, required)
- `items` (array, required): `{ item_id, quantity, modifiers?, notes? }`
- `mode` (enum, default `"pickup"`): `"pickup"` | `"delivery"`
- `agent_context` (string, optional): free-text about why/what the user asked for. Goes into the order log for debugging.

**When to call:** after the user has confirmed the meal selection AND `check_availability` said the restaurant is open.

**Output handling:**
- Surface the `handoff_url` to the user as a clickable link.
- Include the `subtotal_cents` as a formatted dollar amount.
- Repeat the `next_step` verbatim OR paraphrase faithfully: "Open this link to review and pay on the restaurant's site."
- **Never say "your order has been placed."** The order intent is logged; the user still needs to confirm.

### `get_recent_orders`

**Inputs**
- `limit` (int, optional, default 10)
- `restaurant` (string, optional): filter to one slug

**When to call:** only when the user or author explicitly asks to see recent orders (typically for demos or debugging). Never call this speculatively.

## Guardrails

1. **Trust boundary.** You never hold payment. You never claim payment has been made.
2. **Allergens.** Allergen constraints are hard filters. When the user says "no peanuts," the `avoid_allergens: ["peanut"]` filter MUST be applied. Never substitute the allergen-free version silently; if the user wants a modification, ask.
3. **Nutrition disclaimers.** When you report nutrition to the user, always include that the values are LLM-estimated.
4. **Language.** Prefer the English dish name. Include the Chinese name (`name_zh`) if the user seems to be a Chinese speaker or asks.

## Error handling

- `{ error: "unknown restaurant: <slug>" }`: the user's restaurant slug is wrong. Call `search_restaurants` to re-list.
- `{ error: "unknown item: <id> at <slug>" }`: the menu cache doesn't have this item. Call `get_menu` to refresh your view of the menu before retrying.
- Connection refused / timeout: the MCP server is down or unreachable from your network. Tell the user the service is temporarily unavailable; do not retry more than twice.

## Style

- Be terse. Restaurant selection and meal composition should each fit in a few sentences.
- Use the restaurant's display name, not the slug, when talking to the user.
- Format prices as "$17.95" rather than "1795 cents."
- If asked a question about the skill itself ("how does this work?"), point to `SKILL.md` or this file rather than reciting the whole architecture.
