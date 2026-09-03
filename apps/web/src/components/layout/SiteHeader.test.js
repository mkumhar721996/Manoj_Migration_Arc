import test from "node:test";
import assert from "node:assert/strict";
import { siteHeaderView } from "./SiteHeader.js";
import { findByTestId, textContentOf } from "../../test/vnodeHelpers.js";

test("AC11: header badge shows icon-only when the cart is empty", () => {
  const vnode = siteHeaderView({ cartCount: 0 });
  assert.equal(findByTestId(vnode, "cart-count"), null);
});

test("AC2: header badge shows the total unit count", () => {
  const vnode = siteHeaderView({ cartCount: 4 });
  assert.equal(textContentOf(findByTestId(vnode, "cart-count")), "4");
});
