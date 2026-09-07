import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderOrderPage } from "../src/order/orderView.js";
import { ORDER_SUCCESS_MESSAGE, OUT_OF_STOCK_MESSAGE } from "../src/order/orderMessages.js";
import { calculateBreakdown } from "../src/order/orderMath.js";

function makeProduct(overrides = {}) {
  return { id: "margherita", name: "Classic Margherita", unitPrice: 14.5, stock: 10, ...overrides };
}

function makeState(overrides = {}) {
  const product = overrides.product ?? makeProduct();
  const quantity = overrides.quantity ?? 2;
  return {
    product,
    quantity,
    paymentMethod: "card",
    status: "idle",
    orderId: null,
    error: null,
    breakdown: calculateBreakdown({ unitPrice: product.unitPrice, quantity }),
    ...overrides,
  };
}

describe("renderOrderPage: itemized breakdown", () => {
  test("shows subtotal, tax, discount and total", () => {
    const state = makeState({
      breakdown: { subtotal: 29, tax: 2.32, discount: 5, total: 26.32 },
    });
    const html = renderOrderPage(state);

    assert.match(html, /data-testid="order-subtotal"[^>]*>\$29\.00</);
    assert.match(html, /data-testid="order-tax"[^>]*>\$2\.32</);
    assert.match(html, /data-testid="order-discount"[^>]*>\$5\.00</);
    assert.match(html, /data-testid="order-total"[^>]*>\$26\.32</);
  });
});

describe("renderOrderPage: payment method picker", () => {
  test("renders exactly the 4 supported payment options", () => {
    const html = renderOrderPage(makeState());

    assert.match(html, /data-action="select-payment"[^>]*data-method="card"/);
    assert.match(html, /data-action="select-payment"[^>]*data-method="upi"/);
    assert.match(html, /data-action="select-payment"[^>]*data-method="netbanking"/);
    assert.match(html, /data-action="select-payment"[^>]*data-method="cod"/);

    const matches = html.match(/data-action="select-payment"/g) ?? [];
    assert.equal(matches.length, 4);
  });
});

describe("renderOrderPage: success", () => {
  test("shows the unique order id and success message", () => {
    const html = renderOrderPage(makeState({ status: "success", orderId: "ORD-1" }));

    assert.match(html, new RegExp(`data-testid="order-id"[^>]*>ORD-1<`));
    assert.match(
      html,
      new RegExp(`data-testid="order-success-message"[^>]*>${ORDER_SUCCESS_MESSAGE}<`),
    );
  });
});

describe("renderOrderPage: error", () => {
  test("shows the error message in an alert element", () => {
    const html = renderOrderPage(makeState({ status: "error", error: OUT_OF_STOCK_MESSAGE }));

    assert.match(html, new RegExp(`role="alert"[^>]*>${OUT_OF_STOCK_MESSAGE}<`));
  });
});
