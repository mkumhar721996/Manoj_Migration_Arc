/** @param {{itemId: string, quantity: number}[]} items */
export function selectTotalUnits(items) {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

/**
 * @param {{itemId: string, quantity: number}[]} items
 * @param {{id: string, price: number}[]} catalog
 */
export function selectSubtotal(items, catalog) {
  return items.reduce((sum, line) => {
    const product = catalog.find((item) => item.id === line.itemId);
    const price = product ? product.price : 0;
    return sum + price * line.quantity;
  }, 0);
}

/**
 * @param {number} totalUnits
 * @param {number} subtotal
 */
export function formatCartSummary(totalUnits, subtotal) {
  return `${totalUnits} item(s) · $${subtotal.toFixed(2)}`;
}
