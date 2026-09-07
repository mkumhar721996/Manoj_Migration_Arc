import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateBreakdown, validateQuantity, TAX_RATE } from "../src/order/orderMath.js";

describe("calculateBreakdown", () => {
  test("computes subtotal, tax, discount and total for a typical order", () => {
    const breakdown = calculateBreakdown({
      unitPrice: 10,
      quantity: 3,
      taxRate: 0.1,
      discount: 5,
    });

    assert.equal(breakdown.subtotal, 30);
    assert.equal(breakdown.tax, 3);
    assert.equal(breakdown.discount, 5);
    assert.equal(breakdown.total, 28);
  });

  test("defaults discount to 0 and taxRate to TAX_RATE when omitted", () => {
    const breakdown = calculateBreakdown({ unitPrice: 20, quantity: 2 });

    assert.equal(breakdown.subtotal, 40);
    assert.equal(breakdown.tax, 40 * TAX_RATE);
    assert.equal(breakdown.discount, 0);
    assert.equal(breakdown.total, 40 + 40 * TAX_RATE);
  });

  test("supports a zero tax rate", () => {
    const breakdown = calculateBreakdown({
      unitPrice: 10,
      quantity: 1,
      taxRate: 0,
      discount: 0,
    });

    assert.equal(breakdown.tax, 0);
    assert.equal(breakdown.total, 10);
  });
});

describe("validateQuantity", () => {
  test("rejects zero", () => {
    assert.equal(validateQuantity(0), false);
  });

  test("rejects negative numbers", () => {
    assert.equal(validateQuantity(-1), false);
  });

  test("accepts positive integers", () => {
    assert.equal(validateQuantity(1), true);
  });
});
