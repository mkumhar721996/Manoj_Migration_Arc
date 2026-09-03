import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { handleAction } from "../src/cart/cartApp.js";
import { createCartStore } from "../src/cart/cartStore.js";

function createMemoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function makeItem(overrides = {}) {
  return {
    id: "margherita",
    name: "Classic Margherita",
    unitPrice: 14.5,
    quantity: 2,
    ...overrides,
  };
}

describe("handleAction: checkout", () => {
  test("navigates to /checkout when the cart has items", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem()],
    });
    let navigatedTo = null;

    handleAction({
      actionId: "checkout",
      store,
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    assert.equal(navigatedTo, "/checkout");
  });

  test("does not navigate when the cart is empty", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [],
    });
    let navigatedTo = null;

    handleAction({
      actionId: "checkout",
      store,
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    assert.equal(navigatedTo, null);
  });
});

describe("handleAction: increment/decrement", () => {
  test("dispatches increment to the store for the given item id", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    handleAction({ actionId: "increment", itemId: "margherita", store, navigate: () => {} });

    assert.equal(store.getState().items[0].quantity, 3);
  });

  test("dispatches decrement to the store for the given item id", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    handleAction({ actionId: "decrement", itemId: "margherita", store, navigate: () => {} });

    assert.equal(store.getState().items[0].quantity, 1);
  });
});
