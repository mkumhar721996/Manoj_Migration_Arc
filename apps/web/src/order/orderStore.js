import { calculateBreakdown, validateQuantity } from "./orderMath.js";
import { OutOfStockError, PaymentFailedError } from "./orderGateway.js";
import {
  OUT_OF_STOCK_MESSAGE,
  PAYMENT_FAILED_MESSAGE,
  INVALID_QUANTITY_MESSAGE,
  UNKNOWN_ERROR_MESSAGE,
} from "./orderMessages.js";

export const PAYMENT_METHODS = ["card", "upi", "netbanking", "cod"];

export function createOrderStore({ product, gateway, initialQuantity = 1 }) {
  let quantity = initialQuantity;
  let paymentMethod = PAYMENT_METHODS[0];
  let status = "idle";
  let orderId = null;
  let error = null;
  const listeners = new Set();

  function getState() {
    return {
      product,
      quantity,
      paymentMethod,
      status,
      orderId,
      error,
      breakdown: calculateBreakdown({ unitPrice: product.unitPrice, quantity }),
    };
  }

  function notify() {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  }

  function setQuantity(nextQuantity) {
    quantity = nextQuantity;
    notify();
  }

  function setPaymentMethod(nextMethod) {
    if (!PAYMENT_METHODS.includes(nextMethod)) return;
    paymentMethod = nextMethod;
    notify();
  }

  async function submitOrder() {
    if (!validateQuantity(quantity)) {
      status = "error";
      error = INVALID_QUANTITY_MESSAGE;
      orderId = null;
      notify();
      return;
    }

    status = "submitting";
    error = null;
    notify();

    try {
      const result = await gateway.placeOrder({ product, quantity, paymentMethod });
      status = "success";
      orderId = result.orderId;
      error = null;
    } catch (err) {
      status = "error";
      orderId = null;
      if (err instanceof OutOfStockError) {
        error = OUT_OF_STOCK_MESSAGE;
      } else if (err instanceof PaymentFailedError) {
        error = PAYMENT_FAILED_MESSAGE;
      } else {
        error = UNKNOWN_ERROR_MESSAGE;
      }
    }

    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, subscribe, setQuantity, setPaymentMethod, submitOrder };
}
