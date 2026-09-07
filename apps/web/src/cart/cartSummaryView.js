import { formatItemCountLabel } from "./cartMath.js";
import { formatUSD } from "./formatCurrency.js";
import { renderButton } from "../components/button.js";

export function renderCartSummaryPanel(state) {
  const hasItems = state.itemCount > 0;

  return `
    <div class="cart-summary-panel" data-testid="cart-summary-panel">
      <div class="cart-summary-panel__icon-tile" aria-hidden="true">🛍️</div>
      <div class="cart-summary-panel__body">
        <span class="cart-summary-panel__title">Cart Summary</span>
        <div class="cart-summary-panel__details" aria-live="polite" aria-atomic="true">
          <span class="cart-summary-panel__count">${formatItemCountLabel(state.itemCount)}</span>
          <span class="cart-summary-panel__total">${formatUSD(state.subtotal)}</span>
        </div>
      </div>
      ${renderButton({
        variant: "primary-brand",
        size: "compact",
        label: "Checkout",
        actionId: "checkout",
        disabled: !hasItems,
      })}
    </div>
  `;
}
