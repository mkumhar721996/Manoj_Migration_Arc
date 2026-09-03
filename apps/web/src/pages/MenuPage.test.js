import test from "node:test";
import assert from "node:assert/strict";
import { menuPageView } from "./MenuPage.js";
import { createCartStore } from "../features/cart/cartStore.js";
import { CART_STORAGE_KEY } from "../features/cart/cartStorage.js";
import { findByTestId, textContentOf } from "../test/vnodeHelpers.js";

const catalog = [
  {
    id: "classic-margherita",
    name: "Classic Margherita",
    category: "Classic",
    price: 14.5,
    description: "d",
    image: "/images/classic-margherita.png",
  },
  {
    id: "diavola",
    name: "Diavola",
    category: "Specialty",
    price: 16.5,
    description: "d",
    image: "/images/diavola.png",
  },
];

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

function render(store) {
  return menuPageView({ state: store.getState(), catalog, store });
}

test("AC5 & AC11: on first render with an empty cart, no summary bar and an icon-only badge", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  const page = render(store);
  assert.equal(findByTestId(page, "sticky-cart-summary"), null);
  assert.equal(findByTestId(page, "cart-count"), null);
});

test("AC1 & AC2 & AC3: clicking Add to Cart adds the item, bumps the badge, and reveals the summary bar", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  findByTestId(page, "add-to-cart-classic-margherita").props.onClick();

  page = render(store);
  assert.equal(textContentOf(findByTestId(page, "cart-count")), "1");
  assert.ok(findByTestId(page, "sticky-cart-summary"));
});

test("AC7 & AC10: adding two distinct items twice/once reflects combined totals", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();
  page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();
  page = render(store);
  findByTestId(page, "add-to-cart-classic-margherita").props.onClick();

  page = render(store);
  assert.equal(textContentOf(findByTestId(page, "cart-count")), "3");
  assert.equal(
    textContentOf(findByTestId(page, "cart-summary-subtitle")),
    "3 item(s) · $47.50",
  );
});

test("AC12: decrementing an item on the menu page reduces badge and summary totals", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();
  page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();

  page = render(store);
  findByTestId(page, "decrement-button").props.onClick();

  page = render(store);
  assert.equal(textContentOf(findByTestId(page, "cart-count")), "1");
  assert.equal(
    textContentOf(findByTestId(page, "cart-summary-subtitle")),
    "1 item(s) · $16.50",
  );
});

test("AC5 & AC11: decrementing the last unit hides the badge count and the summary bar again", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();

  page = render(store);
  findByTestId(page, "decrement-button").props.onClick();

  page = render(store);
  assert.equal(findByTestId(page, "cart-count"), null);
  assert.equal(findByTestId(page, "sticky-cart-summary"), null);
});

test("AC13: adding an item while storage is unavailable shows the non-blocking warning banner", () => {
  const store = createCartStore({ storage: makeThrowingStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  assert.equal(findByTestId(page, "cart-warning-banner"), null);

  findByTestId(page, "add-to-cart-diavola").props.onClick();
  page = render(store);
  assert.ok(findByTestId(page, "cart-warning-banner"));
});

test("AC14: with storage unavailable, the cart still updates in-session for the current page", () => {
  const store = createCartStore({ storage: makeThrowingStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  findByTestId(page, "add-to-cart-diavola").props.onClick();
  page = render(store);
  assert.equal(textContentOf(findByTestId(page, "cart-count")), "1");
});

test("AC16: an update in one tab is reflected in another tab sharing the same storage", () => {
  const storage = makeMemoryStorage();
  const eventTarget = new EventTarget();
  const tabAStore = createCartStore({ storage, eventTarget });
  const tabBStore = createCartStore({ storage, eventTarget });

  let tabAPage = menuPageView({ state: tabAStore.getState(), catalog, store: tabAStore });
  findByTestId(tabAPage, "add-to-cart-diavola").props.onClick();

  eventTarget.dispatchEvent(
    Object.assign(new Event("storage"), {
      key: CART_STORAGE_KEY,
      newValue: storage.getItem(CART_STORAGE_KEY),
    }),
  );

  const tabBPage = menuPageView({ state: tabBStore.getState(), catalog, store: tabBStore });
  assert.equal(textContentOf(findByTestId(tabBPage, "cart-count")), "1");
  assert.ok(findByTestId(tabBPage, "sticky-cart-summary"));
});

test("AC15: rapid sequential clicks on the same item each increment the badge once", () => {
  const store = createCartStore({ storage: makeMemoryStorage(), eventTarget: new EventTarget() });
  let page = render(store);
  for (let i = 0; i < 5; i += 1) {
    findByTestId(page, "add-to-cart-diavola").props.onClick();
  }
  page = render(store);
  assert.equal(textContentOf(findByTestId(page, "cart-count")), "5");
});
