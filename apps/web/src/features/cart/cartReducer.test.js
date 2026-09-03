import test from "node:test";
import assert from "node:assert/strict";
import { cartReducer, emptyCartState, MAX_QUANTITY } from "./cartReducer.js";

test("AC1: ADD_ITEM adds a new line item with quantity 1", () => {
  const next = cartReducer(emptyCartState(), {
    type: "ADD_ITEM",
    itemId: "classic-margherita",
  });
  assert.deepEqual(next.items, [
    { itemId: "classic-margherita", quantity: 1 },
  ]);
});

test("AC6: ADD_ITEM on an existing line increments quantity instead of duplicating", () => {
  const once = cartReducer(emptyCartState(), {
    type: "ADD_ITEM",
    itemId: "diavola",
  });
  const twice = cartReducer(once, { type: "ADD_ITEM", itemId: "diavola" });
  assert.deepEqual(twice.items, [{ itemId: "diavola", quantity: 2 }]);
});

test("AC9: ADD_ITEM caps quantity at 99", () => {
  const atCap = { items: [{ itemId: "x", quantity: MAX_QUANTITY }] };
  const next = cartReducer(atCap, { type: "ADD_ITEM", itemId: "x" });
  assert.equal(next.items[0].quantity, MAX_QUANTITY);
});

test("AC12: DECREMENT_ITEM reduces quantity by 1", () => {
  const state = { items: [{ itemId: "x", quantity: 2 }] };
  const next = cartReducer(state, { type: "DECREMENT_ITEM", itemId: "x" });
  assert.deepEqual(next.items, [{ itemId: "x", quantity: 1 }]);
});

test("AC12: DECREMENT_ITEM removes the line once it would drop to 0", () => {
  const state = { items: [{ itemId: "x", quantity: 1 }] };
  const next = cartReducer(state, { type: "DECREMENT_ITEM", itemId: "x" });
  assert.deepEqual(next.items, []);
});
