import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mountMenuApp } from "../src/menu/menuApp.js";

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

function createFakeContainer(checkoutUrl) {
  const listeners = [];
  return {
    dataset: checkoutUrl ? { checkoutUrl } : {},
    innerHTML: "",
    addEventListener: (type, listener) => listeners.push(listener),
    dispatchClick: (target) => {
      listeners.forEach((listener) => listener({ target }));
    },
  };
}

function findButton(container, actionId) {
  const regex = new RegExp(
    `<button[^>]*data-action="${actionId}"[^>]*>`,
  );
  const match = container.innerHTML.match(regex);
  const disabled = /disabled/.test(match[0]);
  const idMatch = match[0].match(/data-id="([^"]*)"/);
  return {
    dataset: {
      action: actionId,
      ...(idMatch ? { id: idMatch[1] } : {}),
    },
    disabled,
    closest: () => ({
      dataset: {
        action: actionId,
        ...(idMatch ? { id: idMatch[1] } : {}),
      },
      disabled,
    }),
  };
}

describe("menu app: checkout with an empty cart", () => {
  test("does not navigate to checkout when the Checkout button is activated", () => {
    const container = createFakeContainer();
    let navigatedTo = null;

    mountMenuApp({
      container,
      storage: createMemoryStorage(),
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    const checkoutButton = findButton(container, "checkout");
    container.dispatchClick(checkoutButton);

    assert.equal(navigatedTo, null);
  });
});

describe("menu app: add to cart updates the summary panel", () => {
  test("panel reflects the incremented count and total after Add to Cart", () => {
    const container = createFakeContainer();

    mountMenuApp({
      container,
      storage: createMemoryStorage(),
      navigate: () => {},
    });

    assert.match(container.innerHTML, /0 items/);
    assert.match(container.innerHTML, /\$0\.00/);

    const addButton = findButton(container, "add-to-cart");
    container.dispatchClick(addButton);

    assert.match(container.innerHTML, /1 item</);
    assert.match(container.innerHTML, /\$14\.50/);
  });
});

describe("menu app: checkout hands off to the deploy-configured URL", () => {
  test("navigates to the container's data-checkout-url when the cart has items", () => {
    const container = createFakeContainer("/deploy-configured-url");
    let navigatedTo = null;

    mountMenuApp({
      container,
      storage: createMemoryStorage(),
      navigate: (path) => {
        navigatedTo = path;
      },
    });

    const addButton = findButton(container, "add-to-cart");
    container.dispatchClick(addButton);

    const checkoutButton = findButton(container, "checkout");
    container.dispatchClick(checkoutButton);

    assert.equal(navigatedTo, "/deploy-configured-url");
  });
});
