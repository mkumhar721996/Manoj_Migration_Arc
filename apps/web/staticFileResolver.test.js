import test from "node:test";
import assert from "node:assert/strict";
import { resolveStaticFilePath } from "./staticFileResolver.js";

const root = "/srv/app";

test("resolves the root URL to index.html", () => {
  assert.equal(resolveStaticFilePath(root, "/"), "/srv/app/index.html");
});

test("resolves a normal src path under root", () => {
  assert.equal(
    resolveStaticFilePath(root, "/src/main.js"),
    "/srv/app/src/main.js",
  );
});

test("maps /images/* requests into public/images/*", () => {
  assert.equal(
    resolveStaticFilePath(root, "/images/diavola.png"),
    "/srv/app/public/images/diavola.png",
  );
});

test("rejects a dot-dot path traversal attempt", () => {
  assert.equal(
    resolveStaticFilePath(root, "/../../../etc/passwd"),
    null,
  );
});

test("rejects an encoded/nested dot-dot traversal attempt", () => {
  assert.equal(
    resolveStaticFilePath(root, "/src/../../../etc/passwd"),
    null,
  );
});

test("rejects a percent-encoded traversal sequence", () => {
  assert.equal(
    resolveStaticFilePath(root, "/images/..%2f..%2fetc/passwd"),
    null,
  );
});
