import { formatUSD } from "../cart/formatCurrency.js";
import { renderButton } from "../components/button.js";
import { escapeHtml } from "../utils/escapeHtml.js";

export function renderMenuItemCard(item) {
  return `
    <li class="menu-item-card" data-testid="menu-item-card" data-id="${escapeHtml(item.id)}">
      <span class="menu-item-card__name">${escapeHtml(item.name)}</span>
      <span class="menu-item-card__price">${formatUSD(item.unitPrice)}</span>
      ${renderButton({
        variant: "primary-dark",
        label: "Add to Cart",
        actionId: "add-to-cart",
        itemId: item.id,
      })}
    </li>
  `;
}
