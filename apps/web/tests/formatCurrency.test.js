import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { formatUSD } from "../src/cart/formatCurrency.js";

describe("formatUSD", () => {
  test("formats a value with a $ symbol and two decimal places", () => {
    assert.equal(formatUSD(12.5), "$12.50");
  });

  test("pads whole numbers to two decimal places", () => {
    assert.equal(formatUSD(9), "$9.00");
  });

  test("formats zero", () => {
    assert.equal(formatUSD(0), "$0.00");
  });

  test("rounds to two decimal places", () => {
    assert.equal(formatUSD(12.505), "$12.51");
  });
});
