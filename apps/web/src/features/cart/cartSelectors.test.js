import test from "node:test";
import assert from "node:assert/strict";
import {
  selectTotalUnits,
  selectSubtotal,
  formatCartSummary,
} from "./cartSelectors.js";

test("AC2: selectTotalUnits sums quantity across all line items", () => {
  assert.equal(
    selectTotalUnits([
      { itemId: "a", quantity: 2 },
      { itemId: "b", quantity: 3 },
    ]),
    5,
  );
});

test("AC2: selectTotalUnits is 0 for an empty cart", () => {
  assert.equal(selectTotalUnits([]), 0);
});

test("AC10: selectSubtotal sums price * quantity across distinct items", () => {
  const catalog = [
    { id: "a", price: 10 },
    { id: "b", price: 5 },
  ];
  const items = [
    { itemId: "a", quantity: 2 },
    { itemId: "b", quantity: 1 },
  ];
  assert.equal(selectSubtotal(items, catalog), 25);
});

test("AC4: formatCartSummary renders 'N item(s) · $X.XX'", () => {
  assert.equal(formatCartSummary(3, 53.5), "3 item(s) · $53.50");
  assert.equal(formatCartSummary(1, 14.5), "1 item(s) · $14.50");
});
