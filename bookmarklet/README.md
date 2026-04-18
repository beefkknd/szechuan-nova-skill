# szechuan-nova bookmarklet

A one-line JavaScript snippet you keep in your bookmarks bar. When you're on a Peblla-hosted restaurant order page with a szechuan-nova cart encoded in the URL hash, clicking the bookmarklet writes the cart into the page's `localStorage` and reloads — so Peblla's React app renders your populated cart and you can go straight to checkout.

## Install (once)

1. Open the handoff page your agent sends you (looks like `https://<nova-mcp-host>/handoff/<order_id>`).
2. Drag the **"Fill Cart"** link at the top of that page to your bookmarks bar.

That's it. Same bookmarklet works across every restaurant in the szechuan-nova network — only the cart data in the page's URL hash changes.

## How it works

- The handoff page shows your order summary and a big button: **"Open Sampan Cafe with cart encoded →"**. Clicking it opens the restaurant's Peblla ordering page with `#cart=<base64url-json>` on the end of the URL.
- You then click the **Fill Cart** bookmarklet. It reads the hash, transforms each cart item into Peblla's `localStorage` cart entry shape, writes to the key `__ordering_website_special_local_<shopId>`, and reloads.
- Peblla's app reads `localStorage` on mount, shows your populated Order Summary, and surfaces the **Check Out** button.
- You click Check Out and pay in the same browser tab with your saved card.

## Source

`fill-peblla-cart.js` in this directory is the human-readable source. The handoff page inlines the minified form into the bookmarklet link. You can inspect or re-minify it yourself.

## Limits

- Peblla-tenant sites only. Other POS vendors (Toast, Square, Clover) would need their own bookmarklet.
- Dishes with **required modifiers** (e.g., "pick a protein") aren't fully supported yet — the bookmarklet writes an empty `tasteItemList` and `addOnGroupList`. If Peblla's checkout rejects the cart because a required modifier is missing, the user has to add the item manually.
- Bookmarklets are increasingly restricted by some browsers. Chrome currently accepts them without confirmation; Firefox may prompt; Safari works on desktop.

## Security

The bookmarklet runs only on the page you click it on, with the cookies of that page. It writes one key to `localStorage`. It does not exfiltrate anything, call any external service, or touch payment flow. Read the source — it's short.
