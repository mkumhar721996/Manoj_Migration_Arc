import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  CART_STORAGE_KEY,
  CART_TTL_MS,
  loadCart,
  saveCart,
} from "../src/cart/cartStorage.js";

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

const sampleItems = [
  { id: "margherita", name: "Classic Margherita", unitPrice: 14.5, quantity: 2 },
];

describe("saveCart", () => {
  test("writes items and a timestamp under the cart storage key", () => {
    const storage = createMemoryStorage();
    const now = 1_000_000;

    saveCart(storage, sampleItems, now);

    const raw = storage.getItem(CART_STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.deepEqual(parsed.items, sampleItems);
    assert.equal(parsed.savedAt, now);
  });

  test("propagates errors thrown by the underlying storage", () => {
    const storage = {
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    assert.throws(() => saveCart(storage, sampleItems, Date.now()));
  });
});

describe("loadCart", () => {
  test("rehydrates items persisted less than 24 hours ago", () => {
    const now = 1_000_000_000;
    const storage = createMemoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify({
        items: sampleItems,
        savedAt: now - 1000,
      }),
    });

    assert.deepEqual(loadCart(storage, now), sampleItems);
  });

  test("returns an empty cart when persisted more than 24 hours ago", () => {
    const now = 1_000_000_000;
    const storage = createMemoryStorage({
      [CART_STORAGE_KEY]: JSON.stringify({
        items: sampleItems,
        savedAt: now - CART_TTL_MS - 1,
      }),
    });

    assert.deepEqual(loadCart(storage, now), []);
  });

  test("returns an empty cart when nothing is persisted", () => {
    const storage = createMemoryStorage();
    assert.deepEqual(loadCart(storage, Date.now()), []);
  });

  test("returns an empty cart when persisted data is malformed", () => {
    const storage = createMemoryStorage({ [CART_STORAGE_KEY]: "not json" });
    assert.deepEqual(loadCart(storage, Date.now()), []);
  });
});
