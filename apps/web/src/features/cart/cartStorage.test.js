import test from "node:test";
import assert from "node:assert/strict";
import {
  CART_STORAGE_KEY,
  isStorageAvailable,
  saveCart,
  loadCart,
} from "./cartStorage.js";

function makeMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

function makeThrowingStorage() {
  return {
    getItem() {
      throw new Error("disabled");
    },
    setItem() {
      throw new Error("disabled");
    },
    removeItem() {
      throw new Error("disabled");
    },
  };
}

test("AC8: saveCart then loadCart round-trips the cart state", () => {
  const storage = makeMemoryStorage();
  const state = { items: [{ itemId: "diavola", quantity: 1 }] };
  saveCart(storage, state);
  assert.deepEqual(loadCart(storage), state);
});

test("AC8: loadCart returns an empty cart when nothing was saved", () => {
  const storage = makeMemoryStorage();
  assert.deepEqual(loadCart(storage), { items: [] });
});

test("AC13: isStorageAvailable is false when storage throws on write", () => {
  assert.equal(isStorageAvailable(makeThrowingStorage()), false);
});

test("AC13: isStorageAvailable is true for working storage", () => {
  assert.equal(isStorageAvailable(makeMemoryStorage()), true);
});

test("AC13: isStorageAvailable is false when storage is undefined", () => {
  assert.equal(isStorageAvailable(undefined), false);
});

test("CART_STORAGE_KEY is a stable, non-empty key", () => {
  assert.equal(typeof CART_STORAGE_KEY, "string");
  assert.ok(CART_STORAGE_KEY.length > 0);
});
