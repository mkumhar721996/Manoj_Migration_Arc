import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createOrderGateway,
  OutOfStockError,
  PaymentFailedError,
} from "../src/order/orderGateway.js";

function makeProduct(overrides = {}) {
  return { id: "margherita", name: "Classic Margherita", unitPrice: 14.5, stock: 5, ...overrides };
}

describe("placeOrder: stock check", () => {
  test("rejects with OutOfStockError when quantity exceeds available stock", async () => {
    const gateway = createOrderGateway();

    await assert.rejects(
      () =>
        gateway.placeOrder({
          product: makeProduct({ stock: 1 }),
          quantity: 2,
          paymentMethod: "card",
        }),
      OutOfStockError,
    );
  });
});

describe("placeOrder: payment", () => {
  test("propagates a PaymentFailedError from an injected chargePayment and does not return an orderId", async () => {
    const gateway = createOrderGateway({
      chargePayment: async () => {
        throw new PaymentFailedError();
      },
    });

    await assert.rejects(
      () =>
        gateway.placeOrder({
          product: makeProduct(),
          quantity: 1,
          paymentMethod: "card",
        }),
      PaymentFailedError,
    );
  });

  test("resolves with a unique order id when stock and payment both succeed", async () => {
    const gateway = createOrderGateway();

    const result = await gateway.placeOrder({
      product: makeProduct(),
      quantity: 1,
      paymentMethod: "card",
    });

    assert.ok(result.orderId);
  });
});
