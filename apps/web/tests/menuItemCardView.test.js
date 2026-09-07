import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderMenuItemCard } from "../src/menu/menuItemCardView.js";

describe("renderMenuItemCard", () => {
  const html = renderMenuItemCard({
    id: "classic-margherita",
    name: "Classic Margherita",
    unitPrice: 14.5,
  });

  test("shows the item name and formatted price", () => {
    assert.match(html, /Classic Margherita/);
    assert.match(html, /\$14\.50/);
  });

  test("renders an Add to Cart button wired to the item id", () => {
    assert.match(html, /Add to Cart/);
    assert.match(html, /data-action="add-to-cart"/);
    assert.match(html, /data-id="classic-margherita"/);
  });
});
