import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  MAX_QUANTITY,
  getCartItemCount,
  lineTotal,
  subtotal,
} from "../src/cart/cartMath.js";

function makeItem(overrides = {}) {
  return {
    id: "margherita",
    name: "Classic Margherita",
    unitPrice: 14.5,
    quantity: 2,
    ...overrides,
  };
}

describe("lineTotal", () => {
  test("multiplies unit price by quantity", () => {
    assert.equal(lineTotal(makeItem({ unitPrice: 12.5, quantity: 3 })), 37.5);
  });
});

describe("subtotal", () => {
  test("sums the line totals of all items", () => {
    const items = [
      makeItem({ id: "a", unitPrice: 10, quantity: 2 }),
      makeItem({ id: "b", unitPrice: 5, quantity: 1 }),
    ];
    assert.equal(subtotal(items), 25);
  });

  test("returns 0 for an empty cart", () => {
    assert.equal(subtotal([]), 0);
  });
});

describe("getCartItemCount", () => {
  test("sums the quantities of all items", () => {
    const items = [
      makeItem({ id: "a", quantity: 2 }),
      makeItem({ id: "b", quantity: 3 }),
    ];
    assert.equal(getCartItemCount(items), 5);
  });

  test("returns 0 for an empty cart", () => {
    assert.equal(getCartItemCount([]), 0);
  });
});

describe("MAX_QUANTITY", () => {
  test("is 99", () => {
    assert.equal(MAX_QUANTITY, 99);
  });
});
