# szechuan-nova — sample conversations

Worked examples of the skill in action. Illustrative, not prescriptive; the agent should adapt style to its own runtime.

## Example 1 — Spicy lunch under $20, no cilantro

**User:** I want a spicy Sichuan lunch, pickup, under $20, high protein, no cilantro.

**Agent (internal):**
1. `search_restaurants({ cuisine: "sichuan" })` → candidate list
2. `check_availability({ restaurant: "<slug>", mode: "pickup" })` → open
3. `compose_meal({ restaurant: "<slug>", max_price_cents: 2000, spicy: true, protein_min_g: 30, avoid_ingredients: ["cilantro"] })` → 2 suggestions

**Agent (to user):**
> I found a Sichuan place nearby, open for pickup. Two options under $20:
>
> 1. **Twice-Cooked Pork** — $17.95, ~36g protein. Pork belly, leeks, sweet bean paste.
> 2. **Kung Pao Chicken** — $16.95, ~42g protein. Wok-fired chicken with peanuts, dried chilies, Sichuan peppercorn.
>
> Nutrition is LLM-estimated, not chef-verified. Which would you like, or should I swap in a side?

**User:** Kung Pao, extra spicy, no peanuts.

**Agent (internal):**
- `generate_cart_url({ restaurant: "<slug>", items: [{ item_id: "hot-01", quantity: 1, modifiers: { spice_level: "extra_spicy", no_peanuts: true } }], mode: "pickup", agent_context: "lunch, spicy, under $20, no peanuts" })`

**Agent (to user):**
> Cart ready: 1× Kung Pao Chicken (extra spicy, no peanuts), $16.95, pickup. Open this link to review and pay on the restaurant's site:
> `<handoff_url>`
>
> I haven't placed the order — you'll need to confirm and pay on the restaurant's page.

## Example 2 — Restaurant named by the user

**User:** Show me the menu at <Restaurant>.

**Agent (internal):**
1. `get_menu({ restaurant: "<slug>" })`

**Agent (to user):**
> <Restaurant> menu, summarized by section:
>
> - **Appetizers** (N): …
> - **Mains** (N): …
> - **Noodles & Rice** (N): …
>
> Want details on any of these, or should I compose a meal?

## Example 3 — Constraint can't be met

**User:** A meal under $10, high protein, spicy.

**Agent (internal):**
1. `compose_meal({ restaurant: "<slug>", max_price_cents: 1000, spicy: true, protein_min_g: 30 })` → empty or short list with notes

**Agent (to user):**
> Under $10 is tight for a spicy, high-protein main — the cheapest qualifying item is Dan Dan Noodles at $12.95. I can:
>
> - Raise the budget to $13 → Dan Dan Noodles fits.
> - Drop the "spicy" constraint → Hot & Sour Soup at $7.95 (mild, ~10g protein).
>
> Which way?

## Example 4 — Restaurant closed

**User:** Order me Mapo Tofu from <Restaurant> right now. [hypothetically at 23:30]

**Agent (internal):**
1. `check_availability({ restaurant: "<slug>", at: "2026-04-18T23:30:00", mode: "pickup" })` → `{ is_open: false, hours_today: "11:00-21:00" }`

**Agent (to user):**
> <Restaurant> is closed now (today: 11:00–21:00). Want me to prep the cart anyway so you can order tomorrow, or try a different restaurant?
