import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderMenuGrid } from "../src/menu/menuGridView.js";

describe("renderMenuGrid", () => {
  const items = [
    { id: "classic-margherita", name: "Classic Margherita", unitPrice: 14.5 },
    { id: "diavola", name: "Diavola", unitPrice: 16.5 },
  ];
  const html = renderMenuGrid(items);

  test("has the grid container hook", () => {
    assert.match(html, /class="menu-grid"/);
  });

  test("renders a card for every item", () => {
    assert.match(html, /Classic Margherita/);
    assert.match(html, /Diavola/);
  });
});
