export const TAX_RATE = 0.08;

export function calculateBreakdown({ unitPrice, quantity, taxRate = TAX_RATE, discount = 0 }) {
  const subtotal = unitPrice * quantity;
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;

  return { subtotal, tax, discount, total };
}

export function validateQuantity(quantity) {
  return Number.isInteger(quantity) && quantity > 0;
}
