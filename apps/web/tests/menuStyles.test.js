import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../src/styles/menu.css", import.meta.url)),
  "utf8",
);

describe("menu.css: sticky cart summary panel (desktop)", () => {
  test("pins the cart summary panel with position: fixed", () => {
    const ruleMatch = css.match(/\.cart-summary-panel\s*{[^}]*}/);
    assert.ok(ruleMatch, "expected a .cart-summary-panel rule");
    assert.match(ruleMatch[0], /position:\s*fixed/);
  });

  test("reserves a right-hand margin on the grid so the panel never covers a card", () => {
    assert.match(css, /padding-right:\s*428px/);
  });
});

describe("menu.css: mobile breakpoint", () => {
  test("has a max-width media query repositioning the panel to a full-width bottom bar", () => {
    const mediaMatch = css.match(/@media[^{]*max-width[^{]*{[\s\S]*}/);
    assert.ok(mediaMatch, "expected a max-width media query");
    assert.match(mediaMatch[0], /\.cart-summary-panel/);
    assert.match(mediaMatch[0], /width:\s*100%/);
    assert.match(mediaMatch[0], /bottom:\s*0/);
  });
});
