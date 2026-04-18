{
  "nova_cart_version": "0.1",
  "restaurant_slug": "{{restaurant_slug}}",
  "mode": "{{mode}}",
  "items": [
    {
      "item_id": "{{item_id}}",
      "quantity": {{quantity}},
      "modifiers": {{modifiers_json}},
      "notes": "{{notes}}"
    }
  ],
  "subtotal_cents": {{subtotal_cents}},
  "disclaimer": "This payload is the output of szechuan-nova's generate_cart_url. The restaurant's own ordering page is the source of truth for pricing, availability, and final total at checkout."
}
