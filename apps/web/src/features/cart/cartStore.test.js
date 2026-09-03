import test from "node:test";
import assert from "node:assert/strict";
import { createCartStore } from "./cartStore.js";
import { CART_STORAGE_KEY } from "./cartStorage.js";

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

test("AC8: a fresh store hydrates from whatever a previous store persisted", () => {
  const storage = makeMemoryStorage();
  const eventTarget = new EventTarget();

  const tabBeforeReload = createCartStore({ storage, eventTarget });
  tabBeforeReload.addItem("diavola");

  const tabAfterReload = createCartStore({ storage, eventTarget });
  assert.deepEqual(tabAfterReload.getState().items, [
    { itemId: "diavola", quantity: 1 },
  ]);
});

test("AC13: addItem sets persistenceWarning when storage is unavailable", () => {
  const store = createCartStore({
    storage: makeThrowingStorage(),
    eventTarget: new EventTarget(),
  });
  assert.equal(store.getState().persistenceWarning, false);
  store.addItem("diavola");
  assert.equal(store.getState().persistenceWarning, true);
});

test("AC14: cart still updates in-memory this session when storage is unavailable, but nothing survives a reload", () => {
  const storage = makeThrowingStorage();
  const eventTarget = new EventTarget();

  const tabBeforeReload = createCartStore({ storage, eventTarget });
  tabBeforeReload.addItem("diavola");
  assert.deepEqual(tabBeforeReload.getState().items, [
    { itemId: "diavola", quantity: 1 },
  ]);

  const tabAfterReload = createCartStore({ storage, eventTarget });
  assert.deepEqual(tabAfterReload.getState().items, []);
});

test("AC15: rapid sequential addItem calls each increment once, up to the cap", () => {
  const store = createCartStore({
    storage: makeMemoryStorage(),
    eventTarget: new EventTarget(),
  });
  for (let i = 0; i < 5; i += 1) {
    store.addItem("diavola");
  }
  assert.equal(store.getState().items[0].quantity, 5);
});

test("AC15: rapid sequential addItem calls stop incrementing at the 99 cap", () => {
  const storage = makeMemoryStorage();
  const store = createCartStore({ storage, eventTarget: new EventTarget() });
  for (let i = 0; i < 97; i += 1) {
    store.addItem("diavola");
  }
  for (let i = 0; i < 5; i += 1) {
    store.addItem("diavola");
  }
  assert.equal(store.getState().items[0].quantity, 99);
});

test("AC16: a storage event from another tab hydrates this tab's store", () => {
  const storage = makeMemoryStorage();
  const eventTarget = new EventTarget();

  const tabA = createCartStore({ storage, eventTarget });
  const tabB = createCartStore({ storage, eventTarget });

  tabA.addItem("diavola");
  const newValue = storage.getItem(CART_STORAGE_KEY);

  eventTarget.dispatchEvent(
    Object.assign(new Event("storage"), {
      key: CART_STORAGE_KEY,
      newValue,
    }),
  );

  assert.deepEqual(tabB.getState().items, [
    { itemId: "diavola", quantity: 1 },
  ]);
});

test("AC16: subscribers are notified when the storage event hydrates state", () => {
  const storage = makeMemoryStorage();
  const eventTarget = new EventTarget();
  const tabA = createCartStore({ storage, eventTarget });
  const tabB = createCartStore({ storage, eventTarget });

  let notified = false;
  tabB.subscribe(() => {
    notified = true;
  });

  tabA.addItem("diavola");
  eventTarget.dispatchEvent(
    Object.assign(new Event("storage"), {
      key: CART_STORAGE_KEY,
      newValue: storage.getItem(CART_STORAGE_KEY),
    }),
  );

  assert.equal(notified, true);
});
