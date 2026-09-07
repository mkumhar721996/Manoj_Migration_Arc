import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { handleAction } from "../src/cart/cartApp.js";
import { createCartStore } from "../src/cart/cartStore.js";
import { renderCartBadge } from "../src/cart/cartBadge.js";
import { renderCartPage } from "../src/cart/cartView.js";

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

describe("handleAction: return-to-menu", () => {
  test("navigates to /menu when the CTA is selected", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [],
    });
    let navigatedTo = null;

    handleAction({
      actionId: "return-to-menu",
      store,
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    assert.equal(navigatedTo, "/menu");
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

describe("cart badge reacts to store subscription", () => {
  test("badge markup reflects the updated total unit count after a quantity change", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem({ quantity: 2 }), makeItem({ id: "diavola", quantity: 1 })],
    });

    let badgeMarkup = renderCartBadge(store.getState().itemCount);
    store.subscribe((state) => {
      badgeMarkup = renderCartBadge(state.itemCount);
    });

    handleAction({ actionId: "increment", itemId: "margherita", store, navigate: () => {} });

    assert.match(badgeMarkup, />4</);
  });

  test("badge markup is empty after removing the last item", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem({ quantity: 1 })],
    });

    let badgeMarkup = renderCartBadge(store.getState().itemCount);
    store.subscribe((state) => {
      badgeMarkup = renderCartBadge(state.itemCount);
    });

    handleAction({ actionId: "decrement", itemId: "margherita", store, navigate: () => {} });

    assert.equal(badgeMarkup, "");
  });
});

describe("cart transitions to empty state after removing the last item", () => {
  test("re-render shows the empty state and no navigation/reload occurs", () => {
    const store = createCartStore({
      storage: createMemoryStorage(),
      now: () => 1,
      initialItems: [makeItem({ quantity: 1 })],
    });
    const navigateCalls = [];
    let latestMarkup = renderCartPage(store.getState());
    store.subscribe((state) => {
      latestMarkup = renderCartPage(state);
    });

    handleAction({
      actionId: "decrement",
      itemId: "margherita",
      store,
      navigate: (path) => navigateCalls.push(path),
    });

    assert.equal(store.getState().items.length, 0);
    assert.match(latestMarkup, /empty/i);
    assert.doesNotMatch(latestMarkup, /cart-line-item/);
    assert.doesNotMatch(latestMarkup, /data-action="checkout"/);
    assert.equal(navigateCalls.length, 0);
  });
});
