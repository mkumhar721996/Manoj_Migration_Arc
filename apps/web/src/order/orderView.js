import { formatUSD } from "../cart/formatCurrency.js";
import { renderButton } from "../components/button.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { PAYMENT_METHODS } from "./orderStore.js";
import { ORDER_SUCCESS_MESSAGE } from "./orderMessages.js";

const PAYMENT_METHOD_LABELS = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net Banking",
  cod: "Cash on Delivery",
};

function renderBreakdown(breakdown) {
  return `
    <dl class="order-breakdown">
      <dt>Subtotal</dt>
      <dd data-testid="order-subtotal">${formatUSD(breakdown.subtotal)}</dd>
      <dt>Tax</dt>
      <dd data-testid="order-tax">${formatUSD(breakdown.tax)}</dd>
      <dt>Discount</dt>
      <dd data-testid="order-discount">${formatUSD(breakdown.discount)}</dd>
      <dt>Total</dt>
      <dd data-testid="order-total">${formatUSD(breakdown.total)}</dd>
    </dl>
  `;
}

function renderPaymentMethodPicker(selectedMethod) {
  return `
    <div class="order-payment-methods">
      ${PAYMENT_METHODS.map(
        (method) => `
          <button
            type="button"
            class="button button--payment-method${method === selectedMethod ? " is-selected" : ""}"
            data-action="select-payment"
            data-method="${escapeHtml(method)}"
            aria-pressed="${method === selectedMethod}"
          >${escapeHtml(PAYMENT_METHOD_LABELS[method])}</button>
        `,
      ).join("")}
    </div>
  `;
}

function renderError(error) {
  if (!error) return "";
  return `<p class="order-error" role="alert">${escapeHtml(error)}</p>`;
}

function renderSuccess(state) {
  if (state.status !== "success") return "";
  return `
    <div class="order-success">
      <p data-testid="order-success-message">${escapeHtml(ORDER_SUCCESS_MESSAGE)}</p>
      <p>Order ID: <span data-testid="order-id">${escapeHtml(state.orderId)}</span></p>
    </div>
  `;
}

export function renderOrderPage(state) {
  return `
    <div class="order-page">
      ${renderError(state.error)}
      ${renderSuccess(state)}
      ${renderBreakdown(state.breakdown)}
      ${renderPaymentMethodPicker(state.paymentMethod)}
      ${renderButton({
        variant: "primary-brand",
        label: "Place Order",
        actionId: "place-order",
        disabled: state.status === "submitting",
      })}
    </div>
  `;
}
