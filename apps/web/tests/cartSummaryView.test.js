import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderCartSummaryPanel } from "../src/cart/cartSummaryView.js";

describe("renderCartSummaryPanel with an empty cart", () => {
  const html = renderCartSummaryPanel({ itemCount: 0, subtotal: 0 });

  test("has the panel root hook", () => {
    assert.match(html, /class="cart-summary-panel"/);
    assert.match(html, /data-testid="cart-summary-panel"/);
  });

  test("shows '0 items' and '$0.00'", () => {
    assert.match(html, /0 items/);
    assert.match(html, /\$0\.00/);
  });

  test("shows the Checkout CTA in a visually disabled state", () => {
    assert.match(html, /Checkout/);
    assert.match(html, /data-action="checkout"[^>]*disabled/);
  });
});

describe("renderCartSummaryPanel with items in the cart", () => {
  const html = renderCartSummaryPanel({ itemCount: 3, subtotal: 53.5 });

  test("shows the updated item count and total", () => {
    assert.match(html, /3 items/);
    assert.match(html, /\$53\.50/);
  });

  test("shows the Checkout CTA enabled (not disabled)", () => {
    assert.doesNotMatch(html, /data-action="checkout"[^>]*disabled/);
  });
});

describe("renderCartSummaryPanel accessibility", () => {
  test("wraps the item count and total in a single polite live region", () => {
    const html = renderCartSummaryPanel({ itemCount: 0, subtotal: 0 });
    const liveRegionMatch = html.match(
      /aria-live="polite"[^>]*aria-atomic="true"[^>]*>([\s\S]*?)<\/div>/,
    );

    assert.ok(liveRegionMatch, "expected an aria-live=polite aria-atomic=true region");
    assert.match(liveRegionMatch[1], /0 items/);
    assert.match(liveRegionMatch[1], /\$0\.00/);
  });

  test("the live region's content changes when the cart state changes", () => {
    const emptyHtml = renderCartSummaryPanel({ itemCount: 0, subtotal: 0 });
    const filledHtml = renderCartSummaryPanel({ itemCount: 1, subtotal: 14.5 });

    const emptyMatch = emptyHtml.match(/aria-live="polite"[^>]*>([\s\S]*?)<\/div>/);
    const filledMatch = filledHtml.match(/aria-live="polite"[^>]*>([\s\S]*?)<\/div>/);

    assert.notEqual(emptyMatch[1], filledMatch[1]);
  });
});
