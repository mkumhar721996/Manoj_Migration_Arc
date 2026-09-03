import test from "node:test";
import assert from "node:assert/strict";
import { cartIconButtonView } from "./CartIconButton.js";
import { findByTestId, textContentOf } from "../../test/vnodeHelpers.js";

test("AC11: with an empty cart, the badge renders as an icon with no numeric count", () => {
  const vnode = cartIconButtonView({ count: 0 });
  assert.equal(findByTestId(vnode, "cart-count"), null);
  assert.ok(findByTestId(vnode, "cart-icon"));
});

test("AC2: with count 1, the badge shows the count", () => {
  const vnode = cartIconButtonView({ count: 1 });
  const countNode = findByTestId(vnode, "cart-count");
  assert.ok(countNode);
  assert.equal(textContentOf(countNode), "1");
});

test("AC7: with count 2, the badge shows 2", () => {
  const vnode = cartIconButtonView({ count: 2 });
  assert.equal(textContentOf(findByTestId(vnode, "cart-count")), "2");
});
