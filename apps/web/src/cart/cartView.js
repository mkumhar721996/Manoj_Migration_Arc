import { lineTotal, MAX_QUANTITY } from "./cartMath.js";
import { formatUSD } from "./formatCurrency.js";
import { renderButton } from "../components/button.js";
import { escapeHtml } from "../utils/escapeHtml.js";

function renderStepper(item) {
  return `
    <div class="quantity-stepper">
      ${renderButton({
        variant: "primary-dark",
        label: "−",
        actionId: "decrement",
        itemId: item.id,
        ariaLabel: `Decrease quantity for ${item.name}`,
      })}
      <span class="quantity-stepper__value">${item.quantity}</span>
      ${renderButton({
        variant: "primary-dark",
        label: "+",
        actionId: "increment",
        itemId: item.id,
        ariaLabel: `Increase quantity for ${item.name}`,
        disabled: item.quantity >= MAX_QUANTITY,
      })}
    </div>
  `;
}

function renderLineItem(item) {
  return `
    <li class="cart-line-item" data-testid="cart-line-item" data-id="${escapeHtml(item.id)}">
      <span class="cart-line-item__name">${escapeHtml(item.name)}</span>
      <span class="cart-line-item__unit-price">${formatUSD(item.unitPrice)}</span>
      ${renderStepper(item)}
      <span class="cart-line-item__line-total">${formatUSD(lineTotal(item))}</span>
    </li>
  `;
}

function renderEmptyState() {
  return `<p class="cart-empty-state">Your cart is empty.</p>`;
}

function renderError(error) {
  if (!error) return "";
  return `<p class="cart-error" role="alert">${escapeHtml(error)}</p>`;
}

export function renderCartPage(state) {
  const hasItems = state.items.length > 0;

  return `
    <div class="cart-page">
      ${renderError(state.error)}
      ${
        hasItems
          ? `<ul class="cart-line-items">${state.items.map(renderLineItem).join("")}</ul>`
          : renderEmptyState()
      }
      <div class="cart-summary">
        <span class="cart-summary__label">Subtotal</span>
        <span class="cart-summary__value">${formatUSD(state.subtotal)}</span>
      </div>
      ${renderButton({
        variant: "primary-brand",
        label: "Proceed to Checkout",
        actionId: "checkout",
        disabled: !hasItems,
      })}
    </div>
  `;
}
