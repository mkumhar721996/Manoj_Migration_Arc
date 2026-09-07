export const MAX_QUANTITY = 99;

export function lineTotal(item) {
  return item.unitPrice * item.quantity;
}

export function subtotal(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function getCartItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function formatItemCountLabel(count) {
  return `${count} item${count === 1 ? "" : "s"}`;
}
