import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderCartBadge } from "../src/cart/cartBadge.js";

describe("renderCartBadge", () => {
  test("renders the item count when items are present", () => {
    assert.match(renderCartBadge(3), />3</);
  });

  test("updates to reflect a new total unit count", () => {
    assert.match(renderCartBadge(5), />5</);
  });

  test("renders nothing when the cart has no items", () => {
    assert.equal(renderCartBadge(0), "");
  });
});
