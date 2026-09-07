import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createCartStore } from "../src/cart/cartStore.js";
import { CART_STORAGE_KEY } from "../src/cart/cartStorage.js";
import { MAX_QUANTITY } from "../src/cart/cartMath.js";

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

describe("incrementQuantity", () => {
  test("increases quantity by 1 and updates subtotal/itemCount", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.incrementQuantity("margherita");

    const state = store.getState();
    assert.equal(state.items[0].quantity, 3);
    assert.equal(state.subtotal, 43.5);
    assert.equal(state.itemCount, 3);
  });

  test("does not increment past the maximum quantity", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: MAX_QUANTITY })],
    });

    store.incrementQuantity("margherita");

    assert.equal(store.getState().items[0].quantity, MAX_QUANTITY);
  });

  test("persists the updated cart to storage immediately", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 42,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.incrementQuantity("margherita");

    const persisted = JSON.parse(storage.getItem(CART_STORAGE_KEY));
    assert.equal(persisted.items[0].quantity, 3);
    assert.equal(persisted.savedAt, 42);
  });
});

describe("addItem", () => {
  test("adds a new item with quantity 1 when it is not already in the cart", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [],
    });

    store.addItem({ id: "diavola", name: "Diavola", unitPrice: 16.5 });

    const state = store.getState();
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 1);
    assert.equal(state.itemCount, 1);
    assert.equal(state.subtotal, 16.5);
  });

  test("increments the quantity of an item already in the cart", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.addItem({ id: "margherita", name: "Classic Margherita", unitPrice: 14.5 });

    const state = store.getState();
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 3);
  });

  test("persists the added item to storage immediately", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 42,
      initialItems: [],
    });

    store.addItem({ id: "diavola", name: "Diavola", unitPrice: 16.5 });

    const persisted = JSON.parse(storage.getItem(CART_STORAGE_KEY));
    assert.equal(persisted.items[0].quantity, 1);
    assert.equal(persisted.savedAt, 42);
  });

  test("does not increment past the maximum quantity", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: MAX_QUANTITY })],
    });

    store.addItem({ id: "margherita", name: "Classic Margherita", unitPrice: 14.5 });

    assert.equal(store.getState().items[0].quantity, MAX_QUANTITY);
  });
});

describe("decrementQuantity", () => {
  test("decreases quantity by 1 when quantity is greater than 1", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 3 })],
    });

    store.decrementQuantity("margherita");

    const state = store.getState();
    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 2);
    assert.equal(state.itemCount, 2);
  });

  test("removes the item entirely when quantity is 1", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 1 })],
    });

    store.decrementQuantity("margherita");

    const state = store.getState();
    assert.equal(state.items.length, 0);
    assert.equal(state.subtotal, 0);
    assert.equal(state.itemCount, 0);
  });
});

describe("localStorage write failures", () => {
  test("reverts the quantity change when persisting fails", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.incrementQuantity("margherita");

    assert.equal(store.getState().items[0].quantity, 2);
  });

  test("reverts a removal when persisting fails", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 1 })],
    });

    store.decrementQuantity("margherita");

    assert.equal(store.getState().items.length, 1);
  });

  test("surfaces an error message when persisting fails", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.incrementQuantity("margherita");

    assert.ok(store.getState().error);
  });

  test("clears a previous error once a change persists successfully", () => {
    let shouldFail = true;
    const storage = {
      getItem: () => null,
      setItem: () => {
        if (shouldFail) throw new Error("quota exceeded");
      },
    };
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    store.incrementQuantity("margherita");
    assert.ok(store.getState().error);

    shouldFail = false;
    store.incrementQuantity("margherita");
    assert.equal(store.getState().error, null);
  });
});

describe("subscribe", () => {
  test("notifies subscribers after a committed change", () => {
    const storage = createMemoryStorage();
    const store = createCartStore({
      storage,
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 })],
    });

    let notifiedState = null;
    store.subscribe((state) => {
      notifiedState = state;
    });

    store.incrementQuantity("margherita");

    assert.equal(notifiedState.items[0].quantity, 3);
  });
});
