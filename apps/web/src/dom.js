/**
 * Minimal hyperscript-style vnode + mount, standing in for a UI framework
 * (React is unavailable — no npm registry access in this environment, see
 * summary). `h()` returns plain, inspectable objects so component view
 * logic can be unit-tested with node:test without a real DOM. `mount()` is
 * the thin, browser-only glue that turns a vnode tree into real DOM nodes.
 */

/**
 * @param {string} tag
 * @param {Record<string, unknown>} [props]
 * @param {Array<unknown>} [children]
 */
export function h(tag, props = {}, children = []) {
  return { tag, props, children };
}

/** @param {unknown} vnode */
function build(vnode) {
  if (vnode === null || vnode === undefined || vnode === false) {
    return document.createTextNode("");
  }
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(String(vnode));
  }
  const el = document.createElement(vnode.tag);
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "className") {
      el.className = String(value);
    } else if (value !== undefined && value !== null && value !== false) {
      el.setAttribute(key, value === true ? "" : String(value));
    }
  }
  for (const child of vnode.children || []) {
    el.appendChild(build(child));
  }
  return el;
}

/**
 * @param {unknown} vnode
 * @param {Element} container
 */
export function mount(vnode, container) {
  container.innerHTML = "";
  container.appendChild(build(vnode));
}
