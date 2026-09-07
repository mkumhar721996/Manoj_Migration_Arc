export class OutOfStockError extends Error {
  constructor() {
    super("Out of stock");
    this.name = "OutOfStockError";
  }
}

export class PaymentFailedError extends Error {
  constructor() {
    super("Payment failed");
    this.name = "PaymentFailedError";
  }
}

async function defaultChargePayment() {
  return true;
}

function generateOrderId() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createOrderGateway({ chargePayment = defaultChargePayment } = {}) {
  async function placeOrder({ product, quantity, paymentMethod }) {
    if (quantity > product.stock) {
      throw new OutOfStockError();
    }

    await chargePayment({ product, quantity, paymentMethod });

    return { orderId: generateOrderId() };
  }

  return { placeOrder };
}
