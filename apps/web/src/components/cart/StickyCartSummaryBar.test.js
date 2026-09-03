import test from "node:test";
import assert from "node:assert/strict";
import { stickyCartSummaryBarView } from "./StickyCartSummaryBar.js";
import { findByTestId, textContentOf } from "../../test/vnodeHelpers.js";

test("AC5: renders nothing when the cart is empty", () => {
  const vnode = stickyCartSummaryBarView({ totalUnits: 0, subtotal: 0 });
  assert.equal(vnode, null);
});

test("AC3: renders the bar when the cart has at least one item", () => {
  const vnode = stickyCartSummaryBarView({ totalUnits: 1, subtotal: 14.5 });
  assert.ok(findByTestId(vnode, "sticky-cart-summary"));
});

test("AC4: subtitle uses the 'N item(s) · $X.XX' format", () => {
  const vnode = stickyCartSummaryBarView({ totalUnits: 3, subtotal: 53.5 });
  const subtitle = findByTestId(vnode, "cart-summary-subtitle");
  assert.equal(textContentOf(subtitle), "3 item(s) · $53.50");
});

test("AC4: singular count still uses 'item(s)' format", () => {
  const vnode = stickyCartSummaryBarView({ totalUnits: 1, subtotal: 14.5 });
  const subtitle = findByTestId(vnode, "cart-summary-subtitle");
  assert.equal(textContentOf(subtitle), "1 item(s) · $14.50");
});

test("AC10: reflects a subtotal summed across distinct items", () => {
  const vnode = stickyCartSummaryBarView({ totalUnits: 2, subtotal: 31.0 });
  const subtitle = findByTestId(vnode, "cart-summary-subtitle");
  assert.equal(textContentOf(subtitle), "2 item(s) · $31.00");
});
