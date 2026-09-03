import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../src/utils/escapeHtml.js";

describe("escapeHtml", () => {
  test("escapes ampersands, angle brackets and double quotes", () => {
    assert.equal(
      escapeHtml(`<script>&"</script>`),
      "&lt;script&gt;&amp;&quot;&lt;/script&gt;",
    );
  });

  test("prevents attribute injection via a double-quote-containing value", () => {
    const malicious = `test" onmouseover="alert(1)`;
    const attr = `data-id="${escapeHtml(malicious)}"`;

    assert.equal(attr, `data-id="test&quot; onmouseover=&quot;alert(1)"`);
    assert.equal((attr.match(/"/g) || []).length, 2);
  });
});
