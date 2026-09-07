import { renderMenuItemCard } from "./menuItemCardView.js";

export function renderMenuGrid(items) {
  return `
    <ul class="menu-grid">
      ${items.map(renderMenuItemCard).join("")}
    </ul>
  `;
}
