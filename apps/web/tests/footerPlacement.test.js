import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderCartPage } from "../src/cart/cartView.js";
import { renderOrderPage } from "../src/order/orderView.js";
import { FOOTER_CONTENT } from "../src/components/footer.js";

function readHtml(relativePath) {
  return readFileSync(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    "utf8",
  );
}

describe("footer placement", () => {
  test("index.html has a footer placeholder after </main>", () => {
    const html = readHtml("../index.html");
    const mainCloseIndex = html.indexOf("</main>");
    const footerIndex = html.indexOf('<footer id="site-footer"');

    assert.notEqual(mainCloseIndex, -1);
    assert.notEqual(footerIndex, -1);
    assert.ok(footerIndex > mainCloseIndex);
  });

  test("checkout.html has a footer placeholder after </main>", () => {
    const html = readHtml("../checkout.html");
    const mainCloseIndex = html.indexOf("</main>");
    const footerIndex = html.indexOf('<footer id="site-footer"');

    assert.notEqual(mainCloseIndex, -1);
    assert.notEqual(footerIndex, -1);
    assert.ok(footerIndex > mainCloseIndex);
  });

  test("cart page content never contains the footer", () => {
    const html = renderCartPage({ items: [], subtotal: 0, error: null });

    assert.doesNotMatch(html, /site-footer/);
    assert.doesNotMatch(html, new RegExp(FOOTER_CONTENT.brand));
  });

  test("order page content never contains the footer", () => {
    const html = renderOrderPage({
      items: [],
      breakdown: { subtotal: 0, tax: 0, discount: 0, total: 0 },
      paymentMethod: "card",
      status: "idle",
      error: null,
    });

    assert.doesNotMatch(html, /site-footer/);
    assert.doesNotMatch(html, new RegExp(FOOTER_CONTENT.brand));
  });
});
