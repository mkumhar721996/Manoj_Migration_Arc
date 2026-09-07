import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createOrderStore, PAYMENT_METHODS } from "../src/order/orderStore.js";
import { OutOfStockError, PaymentFailedError } from "../src/order/orderGateway.js";
import {
  OUT_OF_STOCK_MESSAGE,
  PAYMENT_FAILED_MESSAGE,
  INVALID_QUANTITY_MESSAGE,
} from "../src/order/orderMessages.js";

function makeProduct(overrides = {}) {
  return { id: "margherita", name: "Classic Margherita", unitPrice: 14.5, stock: 10, ...overrides };
}

function makeFakeGateway({ placeOrder } = {}) {
  const calls = [];
  return {
    calls,
    placeOrder: async (args) => {
      calls.push(args);
      if (placeOrder) return placeOrder(args);
      return { orderId: "ORD-1" };
    },
  };
}

describe("setPaymentMethod", () => {
  test("updates state.paymentMethod for a valid method", () => {
    const store = createOrderStore({ product: makeProduct(), gateway: makeFakeGateway() });

    store.setPaymentMethod("upi");

    assert.equal(store.getState().paymentMethod, "upi");
  });

  test("ignores an invalid payment method", () => {
    const store = createOrderStore({ product: makeProduct(), gateway: makeFakeGateway() });
    const before = store.getState().paymentMethod;

    store.setPaymentMethod("bitcoin");

    assert.equal(store.getState().paymentMethod, before);
  });

  test("PAYMENT_METHODS exposes exactly card, upi, netbanking, cod", () => {
    assert.deepEqual(PAYMENT_METHODS, ["card", "upi", "netbanking", "cod"]);
  });
});

describe("submitOrder: success", () => {
  test("creates the order with a valid quantity and payment method", async () => {
    const gateway = makeFakeGateway({ placeOrder: async () => ({ orderId: "ORD-1" }) });
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(2);
    store.setPaymentMethod("card");

    await store.submitOrder();

    const state = store.getState();
    assert.equal(state.status, "success");
    assert.equal(state.orderId, "ORD-1");
    assert.equal(gateway.calls.length, 1);
    assert.deepEqual(gateway.calls[0], {
      product: makeProduct(),
      quantity: 2,
      paymentMethod: "card",
    });
  });
});

describe("submitOrder: out of stock", () => {
  test("sets an out-of-stock error and never sets an orderId", async () => {
    const gateway = makeFakeGateway({
      placeOrder: async () => {
        throw new OutOfStockError();
      },
    });
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(2);
    store.setPaymentMethod("card");

    await store.submitOrder();

    const state = store.getState();
    assert.equal(state.status, "error");
    assert.equal(state.error, OUT_OF_STOCK_MESSAGE);
    assert.equal(state.orderId, null);
  });
});

describe("submitOrder: payment failure", () => {
  test("sets a payment-failed error and never sets an orderId", async () => {
    const gateway = makeFakeGateway({
      placeOrder: async () => {
        throw new PaymentFailedError();
      },
    });
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(1);
    store.setPaymentMethod("card");

    await store.submitOrder();

    const state = store.getState();
    assert.equal(state.status, "error");
    assert.equal(state.error, PAYMENT_FAILED_MESSAGE);
    assert.equal(state.orderId, null);
  });
});

describe("submitOrder: invalid quantity", () => {
  test("sets an invalid-quantity error, never calls the gateway, and never creates an order", async () => {
    const gateway = makeFakeGateway();
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(0);
    store.setPaymentMethod("card");

    await store.submitOrder();

    const state = store.getState();
    assert.equal(state.status, "error");
    assert.equal(state.error, INVALID_QUANTITY_MESSAGE);
    assert.equal(state.orderId, null);
    assert.equal(gateway.calls.length, 0);
  });

  test("rejects a negative quantity the same way", async () => {
    const gateway = makeFakeGateway();
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(-1);

    await store.submitOrder();

    assert.equal(store.getState().error, INVALID_QUANTITY_MESSAGE);
    assert.equal(gateway.calls.length, 0);
  });
});
