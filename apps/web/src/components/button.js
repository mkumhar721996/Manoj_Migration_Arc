import { escapeHtml } from "../utils/escapeHtml.js";

export function renderButton({
  variant,
  size,
  label,
  actionId,
  itemId,
  disabled = false,
  ariaLabel,
}) {
  const classes = ["button", `button--${variant}`];
  if (size) classes.push(`button--${size}`);

  const attrs = [
    `class="${classes.join(" ")}"`,
    `data-action="${escapeHtml(actionId)}"`,
    "type=\"button\"",
  ];
  if (itemId !== undefined) attrs.push(`data-id="${escapeHtml(itemId)}"`);
  if (ariaLabel) attrs.push(`aria-label="${escapeHtml(ariaLabel)}"`);
  if (disabled) attrs.push("disabled");

  return `<button ${attrs.join(" ")}>${escapeHtml(label)}</button>`;
}
