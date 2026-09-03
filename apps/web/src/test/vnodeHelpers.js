/**
 * Depth-first search for the first vnode whose props["data-testid"] matches.
 * Test-only helper (mirrors Testing Library's getByTestId) letting tests
 * assert on plain h()-produced vnode trees without a real DOM.
 * @param {unknown} vnode
 * @param {string} testId
 */
export function findByTestId(vnode, testId) {
  if (!vnode || typeof vnode !== "object") return null;
  if (vnode.props && vnode.props["data-testid"] === testId) return vnode;
  for (const child of vnode.children || []) {
    const found = findByTestId(child, testId);
    if (found) return found;
  }
  return null;
}

/** @param {unknown} vnode */
export function textContentOf(vnode) {
  if (vnode === null || vnode === undefined || vnode === false) return "";
  if (typeof vnode === "string" || typeof vnode === "number") return String(vnode);
  return (vnode.children || []).map(textContentOf).join("");
}
