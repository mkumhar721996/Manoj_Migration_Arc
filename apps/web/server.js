import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { resolveStaticFilePath } from "./staticFileResolver.js";

/**
 * Minimal dependency-free static file server standing in for a bundler dev
 * server (no npm registry access in this environment, see summary — Vite
 * could not be installed). Serves index.html, ES modules under src/ and
 * images under public/ as-is; no build step is needed since the app is
 * plain, browser-native JavaScript.
 */

const root = new URL(".", import.meta.url).pathname;
const port = process.env.PORT ?? 5173;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  const resolvedPath = resolveStaticFilePath(root, req.url);

  if (!resolvedPath) {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  try {
    const body = await readFile(resolvedPath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(resolvedPath)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, () => {
  console.log(`Forno Rosso web running at http://localhost:${port}`);
});
