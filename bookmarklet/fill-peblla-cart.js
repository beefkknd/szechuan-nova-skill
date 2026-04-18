/**
 * szechuan-nova bookmarklet — populate a Peblla tenant cart from URL hash.
 *
 * Installation: the user drags the <a href="javascript:..."> link on the
 * handoff page to their bookmarks bar.
 *
 * Usage: the user navigates to the restaurant's Peblla ordering page with
 * the cart payload encoded in the URL hash, e.g.
 *     https://order.peblla.com/<tenant>/order#cart=<base64url-json>
 * Then clicks the bookmarklet. This script reads the hash, writes the
 * equivalent cart into localStorage, and reloads the page so Peblla's
 * React app renders the populated cart.
 *
 * The cart payload shape:
 * {
 *   "shop_id": "<peblla shop id>",
 *   "org_id":  "<peblla org id (optional)>",
 *   "items": [
 *     {
 *       "dish_id":       "<peblla dishId>",
 *       "menu_id":       "<peblla menuId (dishMenuList)>",
 *       "category_id":   "<peblla categoryId>",
 *       "category_name": "<displayed category>",
 *       "name":          "<dishName>",
 *       "image_url":     "<url or empty>",
 *       "price":         2.95,
 *       "quantity":      2,
 *       "notes":         "<optional>"
 *     }
 *   ]
 * }
 */

(function () {
  'use strict';

  function readHashCart() {
    var hash = (location.hash || '').replace(/^#/, '');
    var params = new URLSearchParams(hash);
    var raw = params.get('cart');
    if (!raw) throw new Error('No ?cart= parameter found in URL hash. Did you click the "Open Peblla" button on the handoff page first?');
    // base64url -> base64
    var b64 = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonStr);
  }

  function buildPebllaCartEntry(item, idx) {
    var qty = Number(item.quantity) || 1;
    var price = Number(item.price) || 0;
    var uniq = Date.now().toString(36) + '-' + idx + '-' + Math.random().toString(36).slice(2, 8);
    return {
      menuId: String(item.menu_id || item.dish_id),
      dishName: String(item.name || ''),
      dishId: String(item.dish_id),
      imageUrl: String(item.image_url || ''),
      categoryId: String(item.category_id || ''),
      categoryName: String(item.category_name || ''),
      tasteItemList: [],
      addOnGroupList: [],
      count: qty,
      minimalOrderQuantity: 1,
      specialInstructions: '',
      price: price,
      dishPrice: price,
      note: String(item.notes || ''),
      subTotalPrice: +(price * qty).toFixed(2),
      token: 'nova-' + uniq,
      token_count: 'nova-tc-' + uniq,
    };
  }

  function run() {
    var cart;
    try {
      cart = readHashCart();
    } catch (err) {
      window.alert('szechuan-nova: ' + err.message);
      return;
    }

    var shopId = cart.shop_id;
    if (!shopId) {
      window.alert('szechuan-nova: cart payload missing shop_id');
      return;
    }

    var key = '__ordering_website_special_local_' + shopId;
    var items = Array.isArray(cart.items) ? cart.items : [];
    if (items.length === 0) {
      window.alert('szechuan-nova: cart has no items');
      return;
    }

    var pebllaCart = {
      __cart_list_v2: items.map(buildPebllaCartEntry),
      expiry: Date.now() + 30 * 24 * 3600 * 1000,
      __combo_list: [],
    };

    try {
      localStorage.setItem(key, JSON.stringify(pebllaCart));
    } catch (err) {
      window.alert('szechuan-nova: localStorage write failed — ' + err.message);
      return;
    }

    // Strip the hash and reload so the URL bar is clean after refresh.
    var clean = window.location.pathname + window.location.search;
    window.location.replace(clean);
  }

  run();
})();
