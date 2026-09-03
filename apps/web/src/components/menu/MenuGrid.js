import { h } from "../../dom.js";
import { menuItemCardView } from "./MenuItemCard.js";

/**
 * @param {{
 *   items: Array<{id: string, name: string, category: string, price: number, description: string, image: string}>,
 *   quantities: Record<string, number>,
 *   onAddToCart: (itemId: string) => void,
 *   onDecrement: (itemId: string) => void,
 * }} props
 */
export function menuGridView({ items, quantities, onAddToCart, onDecrement }) {
  return h("div", { className: "menu-grid", "data-testid": "menu-grid" }, [
    items.length === 0
      ? h("p", { className: "menu-grid__empty" }, ["No items in this category."])
      : null,
    ...items.map((item) =>
      menuItemCardView({
        item,
        quantity: quantities[item.id] ?? 0,
        onAddToCart,
        onDecrement,
      }),
    ),
  ]);
}
