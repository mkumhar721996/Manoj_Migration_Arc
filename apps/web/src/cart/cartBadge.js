export function renderCartBadge(itemCount) {
  if (itemCount === 0) return "";
  return `<span class="cart-badge__count" data-testid="cart-badge-count">${itemCount}</span>`;
}
