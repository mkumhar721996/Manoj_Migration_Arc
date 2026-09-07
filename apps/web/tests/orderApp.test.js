import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { handleAction } from "../src/order/orderApp.js";
import { createOrderStore } from "../src/order/orderStore.js";

function makeProduct(overrides = {}) {
  return { id: "margherita", name: "Classic Margherita", unitPrice: 14.5, stock: 10, ...overrides };
}

function makeFakeGateway() {
  const calls = [];
  return {
    calls,
    placeOrder: async (args) => {
      calls.push(args);
      return { orderId: "ORD-1" };
    },
  };
}

describe("handleAction: place-order (unauthenticated)", () => {
  test("redirects to /login and never submits the order", async () => {
    const gateway = makeFakeGateway();
    const store = createOrderStore({ product: makeProduct(), gateway });
    let navigatedTo = null;

    await handleAction({
      actionId: "place-order",
      auth: { getCurrentUser: () => null },
      store,
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    assert.equal(navigatedTo, "/login");
    assert.equal(gateway.calls.length, 0);
    assert.equal(store.getState().status, "idle");
  });
});

describe("handleAction: place-order (authenticated)", () => {
  test("submits the order and does not navigate", async () => {
    const gateway = makeFakeGateway();
    const store = createOrderStore({ product: makeProduct(), gateway });
    store.setQuantity(1);
    let navigatedTo = null;

    await handleAction({
      actionId: "place-order",
      auth: { getCurrentUser: () => ({ id: "user-1" }) },
      store,
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    assert.equal(navigatedTo, null);
    assert.equal(gateway.calls.length, 1);
    assert.equal(store.getState().status, "success");
  });
});

describe("handleAction: select-payment", () => {
  test("dispatches the selected payment method to the store", async () => {
    const store = createOrderStore({ product: makeProduct(), gateway: makeFakeGateway() });

    await handleAction({
      actionId: "select-payment",
      method: "upi",
      auth: { getCurrentUser: () => ({ id: "user-1" }) },
      store,
      navigate: () => {},
    });

    assert.equal(store.getState().paymentMethod, "upi");
  });
});
