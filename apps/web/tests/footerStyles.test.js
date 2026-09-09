import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const cssPath = fileURLToPath(
  new URL("../src/styles/footer.css", import.meta.url),
);
const css = readFileSync(cssPath, "utf8");

describe("footer.css", () => {
  test("uses the display font token for the brand/heading text", () => {
    assert.match(css, /\.site-footer__brand[^}]*var\(--font-display\)/s);
  });

  test("uses the body font token for body text", () => {
    assert.match(css, /\.site-footer[^_][^{]*\{[^}]*var\(--font-body\)/s);
  });

  test("does not contain hardcoded hex colors", () => {
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,6}/);
  });
});
