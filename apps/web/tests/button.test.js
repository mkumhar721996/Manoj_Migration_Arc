import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderButton } from "../src/components/button.js";

describe("renderButton", () => {
  test("renders the label and action id", () => {
    const html = renderButton({
      variant: "primary-brand",
      label: "Proceed to Checkout",
      actionId: "checkout",
    });

    assert.match(html, /Proceed to Checkout/);
    assert.match(html, /data-action="checkout"/);
    assert.doesNotMatch(html, /disabled/);
  });

  test("renders a disabled attribute when disabled is true", () => {
    const html = renderButton({
      variant: "primary-brand",
      label: "Proceed to Checkout",
      actionId: "checkout",
      disabled: true,
    });

    assert.match(html, /disabled/);
  });

  test("includes an item id data attribute when itemId is provided", () => {
    const html = renderButton({
      variant: "primary-dark",
      label: "+",
      actionId: "increment",
      itemId: "margherita",
    });

    assert.match(html, /data-id="margherita"/);
  });
});
