function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderButton({
  variant,
  label,
  actionId,
  itemId,
  disabled = false,
  ariaLabel,
}) {
  const attrs = [
    `class="button button--${variant}"`,
    `data-action="${escapeHtml(actionId)}"`,
    "type=\"button\"",
  ];
  if (itemId !== undefined) attrs.push(`data-id="${escapeHtml(itemId)}"`);
  if (ariaLabel) attrs.push(`aria-label="${escapeHtml(ariaLabel)}"`);
  if (disabled) attrs.push("disabled");

  return `<button ${attrs.join(" ")}>${escapeHtml(label)}</button>`;
}
