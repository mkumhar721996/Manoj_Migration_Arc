import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderCartPage } from "../src/cart/cartView.js";
import { MAX_QUANTITY } from "../src/cart/cartMath.js";

function makeItem(overrides = {}) {
  return {
    id: "margherita",
    name: "Classic Margherita",
    unitPrice: 14.5,
    quantity: 2,
    ...overrides,
  };
}

describe("renderCartPage with items", () => {
  const state = {
    items: [makeItem({ unitPrice: 14.5, quantity: 2 })],
    subtotal: 29,
    itemCount: 2,
    error: null,
  };
  const html = renderCartPage(state);

  test("shows the line item name, unit price, quantity and line total", () => {
    assert.match(html, /Classic Margherita/);
    assert.match(html, /\$14\.50/);
    assert.match(html, />2</);
    assert.match(html, /\$29\.00/);
  });

  test("shows the subtotal formatted in USD with no tax or delivery fee", () => {
    assert.match(html, /\$29\.00/);
    assert.doesNotMatch(html, /tax/i);
    assert.doesNotMatch(html, /delivery/i);
  });

  test("shows an enabled 'Proceed to Checkout' CTA", () => {
    assert.match(html, /Proceed to Checkout/);
    assert.match(html, /data-action="checkout"/);
    assert.doesNotMatch(
      html,
      /data-action="checkout"[^>]*disabled/,
    );
  });

  test("does not show the empty-state message", () => {
    assert.doesNotMatch(html, /empty/i);
  });
});

describe("renderCartPage stepper at maximum quantity", () => {
  test("disables the '+' button when quantity is 99", () => {
    const html = renderCartPage({
      items: [makeItem({ quantity: MAX_QUANTITY })],
      subtotal: 14.5 * MAX_QUANTITY,
      itemCount: MAX_QUANTITY,
      error: null,
    });

    assert.match(
      html,
      /data-action="increment"[^>]*data-id="margherita"[^>]*disabled/,
    );
  });
});

describe("renderCartPage with no items", () => {
  const html = renderCartPage({
    items: [],
    subtotal: 0,
    itemCount: 0,
    error: null,
  });

  test("shows an empty-state message", () => {
    assert.match(html, /empty/i);
  });

  test("shows the 'Proceed to Checkout' CTA in a disabled state", () => {
    assert.match(
      html,
      /data-action="checkout"[^>]*disabled/,
    );
  });
});

describe("renderCartPage with an error", () => {
  test("displays the error message", () => {
    const html = renderCartPage({
      items: [makeItem()],
      subtotal: 29,
      itemCount: 2,
      error: "We couldn't save your cart changes. Please try again.",
    });

    assert.match(html, /We couldn't save your cart changes/);
  });
});

describe("renderCartPage escaping", () => {
  test("escapes a double quote in an item id so it cannot break out of the data-id attribute", () => {
    const html = renderCartPage({
      items: [makeItem({ id: `test" onmouseover="alert(1)` })],
      subtotal: 29,
      itemCount: 2,
      error: null,
    });

    assert.doesNotMatch(html, /data-id="test" onmouseover="alert\(1\)"/);
    assert.match(html, /data-id="test&quot; onmouseover=&quot;alert\(1\)"/);
  });
});
