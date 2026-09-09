import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderFooter, FOOTER_CONTENT } from "../src/components/footer.js";

describe("renderFooter", () => {
  test("renders the brand name, hours, and address/contact", () => {
    const html = renderFooter();

    assert.ok(html.includes(FOOTER_CONTENT.brand));
    assert.ok(html.includes(FOOTER_CONTENT.hours));
    assert.ok(html.includes(FOOTER_CONTENT.address));
    assert.ok(html.includes(FOOTER_CONTENT.contact));
  });

  test("renders an anchor for each social link", () => {
    const html = renderFooter();

    for (const social of FOOTER_CONTENT.socialLinks) {
      const anchor = new RegExp(
        `<a[^>]*href="${social.href}"[^>]*>${social.label}</a>`,
      );
      assert.match(html, anchor);
    }
  });

  test("renders an anchor for each legal link", () => {
    const html = renderFooter();

    for (const legal of FOOTER_CONTENT.legalLinks) {
      const anchor = new RegExp(
        `<a[^>]*href="${legal.href}"[^>]*>${legal.label}</a>`,
      );
      assert.match(html, anchor);
    }
  });

  test("social links open in a new tab safely", () => {
    const html = renderFooter();

    for (const social of FOOTER_CONTENT.socialLinks) {
      const anchorMatch = html.match(
        new RegExp(`<a[^>]*href="${social.href}"[^>]*>`),
      );
      assert.ok(anchorMatch, `expected an anchor for ${social.label}`);
      assert.match(anchorMatch[0], /target="_blank"/);
      assert.match(anchorMatch[0], /rel="noopener noreferrer"/);
    }
  });

  test("legal links open in the same tab", () => {
    const html = renderFooter();

    for (const legal of FOOTER_CONTENT.legalLinks) {
      const anchorMatch = html.match(
        new RegExp(`<a[^>]*href="${legal.href}"[^>]*>`),
      );
      assert.ok(anchorMatch, `expected an anchor for ${legal.label}`);
      assert.doesNotMatch(anchorMatch[0], /target=/);
    }
  });

});
