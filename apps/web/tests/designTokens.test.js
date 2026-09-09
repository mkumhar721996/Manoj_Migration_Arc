import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const stylesDir = join(webRoot, "src", "styles");

const tokensCss = readFileSync(join(stylesDir, "tokens.css"), "utf8");
const indexHtml = readFileSync(join(webRoot, "index.html"), "utf8");
const checkoutHtml = readFileSync(join(webRoot, "checkout.html"), "utf8");

function readCssFile(name) {
  return readFileSync(join(stylesDir, name), "utf8");
}

function cssFileNames() {
  return readdirSync(stylesDir).filter((name) => name.endsWith(".css"));
}

function nonTokenCssFiles() {
  return cssFileNames()
    .filter((name) => name !== "tokens.css")
    .map((name) => ({ name, content: readCssFile(name) }));
}

describe("AC1: Fraunces and Geist typefaces", () => {
  test("tokens.css names Fraunces for display and Geist for body", () => {
    assert.match(tokensCss, /--font-display:\s*["']?Fraunces/);
    assert.match(tokensCss, /--font-body:\s*["']?Geist/);
  });

  test("index.html and checkout.html load the Fraunces and Geist webfonts", () => {
    for (const html of [indexHtml, checkoutHtml]) {
      const stylesheetLinks = [...html.matchAll(/<link[^>]*>/g)]
        .map((m) => m[0])
        .filter((tag) => /rel="stylesheet"/.test(tag));
      const fontLink = stylesheetLinks.find((tag) => tag.includes("fonts.googleapis.com"));
      assert.ok(fontLink, "expected a Google Fonts stylesheet link");
      assert.match(fontLink, /Fraunces/);
      assert.match(fontLink, /Geist/);
    }
  });

  test("base.css sets body font to --font-body and headings to --font-display", () => {
    const baseCss = readCssFile("base.css");
    assert.match(baseCss, /body\s*{[^}]*font-family:\s*var\(--font-body\)/s);
    assert.match(baseCss, /(h1|h2|h3)[^{]*{[^}]*font-family:\s*var\(--font-display\)/s);
  });
});

describe("AC2: color palette semantic roles", () => {
  test("tokens.css binds the 7 required hex values to their documented semantic roles", () => {
    assert.match(tokensCss, /--color-brand-accent:\s*#c82d25/i);
    assert.match(tokensCss, /--color-success:\s*#2a7043/i);
    assert.match(tokensCss, /--color-bg-inverse:\s*#151212/i);
    assert.match(tokensCss, /--color-fg-default:\s*#151212/i);
    assert.match(tokensCss, /--color-bg-surface-muted:\s*#f3efe9/i);
    assert.match(tokensCss, /--color-bg-page:\s*#fcfaf6/i);
    assert.match(tokensCss, /--color-bg-surface:\s*#ffffff/i);
  });

  test("order.css marks success state with --color-success", () => {
    const orderCss = readCssFile("order.css");
    assert.match(orderCss, /\.order-success\s*{[^}]*color:\s*var\(--color-success\)/s);
  });

  test("base.css marks the primary brand button with --color-brand-accent", () => {
    const baseCss = readCssFile("base.css");
    assert.match(
      baseCss,
      /\.button--primary-brand\s*{[^}]*background:\s*var\(--color-brand-accent\)/s,
    );
  });
});

describe("AC3: typography scale tokens", () => {
  test("tokens.css defines the font-size and font-weight scale", () => {
    assert.match(tokensCss, /--font-size-xs:\s*12px/);
    assert.match(tokensCss, /--font-size-sm:\s*14px/);
    assert.match(tokensCss, /--font-size-md:\s*16px/);
    assert.match(tokensCss, /--font-size-lg:\s*18px/);
    assert.match(tokensCss, /--font-size-xl:\s*20px/);
    assert.match(tokensCss, /--font-weight-regular:\s*400/);
    assert.match(tokensCss, /--font-weight-semibold:\s*600/);
    assert.match(tokensCss, /--font-weight-bold:\s*700/);
  });

  test("no raw px font-size or numeric font-weight remains outside tokens.css", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      assert.doesNotMatch(
        content,
        /font-size:\s*\d/,
        `${name} should reference a var(--font-size-*) token instead of a raw font-size`,
      );
      assert.doesNotMatch(
        content,
        /font-weight:\s*\d/,
        `${name} should reference a var(--font-weight-*) token instead of a raw font-weight`,
      );
    }
  });
});

describe("AC4: spacing tokens", () => {
  test("every padding/margin/gap declaration uses a var(--space-*) token", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      const declarations = content.matchAll(/(padding|margin|gap)(?:-[a-z]+)?:\s*([^;]+);/g);
      for (const [, property, value] of declarations) {
        const isZeroOrAuto = /^(0|auto)( (0|auto))*$/.test(value.trim());
        if (isZeroOrAuto) continue;
        assert.match(
          value,
          /var\(--space-\d+\)/,
          `${name}: ${property}: ${value} should use a var(--space-*) token`,
        );
      }
    }
  });
});

describe("AC5: no values outside the defined token set", () => {
  test("no raw hex colors outside tokens.css", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      assert.doesNotMatch(content, /#[0-9a-fA-F]{3,8}\b/, `${name} contains a raw hex color`);
    }
  });

  test("no literal font-family names outside tokens.css", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      assert.doesNotMatch(content, /font-family:\s*["']?(Fraunces|Geist)/, `${name} hard-codes a font name instead of using var(--font-display)/var(--font-body)`);
    }
  });

  test("no raw px spacing values outside tokens.css (border-width 1px excepted)", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      const declarations = content.matchAll(/(padding|margin|gap)(?:-[a-z]+)?:\s*([^;]+);/g);
      for (const [, , value] of declarations) {
        assert.doesNotMatch(value, /\d+px/, `${name} contains a raw px spacing value: ${value}`);
      }
    }
  });
});

describe("AC6: single documented shared token source", () => {
  test("only tokens.css defines --color-*/--font-*/--space-* custom properties", () => {
    for (const { name, content } of nonTokenCssFiles()) {
      assert.doesNotMatch(
        content,
        /^\s*--(color|font|space)-[\w-]+\s*:/m,
        `${name} redeclares a design token; tokens should only live in tokens.css`,
      );
    }
  });

  test("tokens.css documents the token groups", () => {
    assert.match(tokensCss, /color/i);
    assert.match(tokensCss, /typography|font/i);
    assert.match(tokensCss, /spacing|space/i);
    assert.match(tokensCss, /\/\*/, "expected doc comments grouping token categories");
  });
});
