import { join, resolve, sep } from "node:path";

/**
 * Resolves an incoming request URL to an absolute file path confined to
 * `root`, or returns null if the request tries to escape it (path
 * traversal). Percent-decodes the URL first so encoded ".." sequences are
 * caught too, then verifies the resolved path is `root` itself or a
 * descendant of it before ever touching the filesystem.
 * @param {string} root
 * @param {string} url
 */
export function resolveStaticFilePath(root, url) {
  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null;
  }

  const requestPath = decoded === "/" ? "/index.html" : decoded;
  const isImageRequest = requestPath.startsWith("/images");
  const relativePath = isImageRequest ? join("public", requestPath) : requestPath;

  const resolvedRoot = resolve(root);
  const allowedBase = isImageRequest ? join(resolvedRoot, "public") : resolvedRoot;
  const resolvedPath = resolve(resolvedRoot, `.${sep}${relativePath}`);

  if (resolvedPath !== allowedBase && !resolvedPath.startsWith(allowedBase + sep)) {
    return null;
  }

  return resolvedPath;
}
