import { h } from "../../dom.js";
import { addToCartButtonView } from "./AddToCartButton.js";
import { quantityStepperView } from "./QuantityStepper.js";

/**
 * @param {{
 *   item: {id: string, name: string, category: string, price: number, description: string, image: string},
 *   quantity: number,
 *   onAddToCart: (itemId: string) => void,
 *   onDecrement: (itemId: string) => void,
 * }} props
 */
export function menuItemCardView({ item, quantity, onAddToCart, onDecrement }) {
  return h(
    "article",
    { className: "menu-item-card", "data-testid": `menu-item-card-${item.id}` },
    [
      h("img", {
        className: "menu-item-card__image",
        src: item.image,
        alt: item.name,
      }),
      h("div", { className: "menu-item-card__body" }, [
        h("div", { className: "menu-item-card__heading-row" }, [
          h("h3", { className: "menu-item-card__name" }, [item.name]),
          h("span", { className: "menu-item-card__price" }, [
            `$${item.price.toFixed(2)}`,
          ]),
        ]),
        h("p", { className: "menu-item-card__category" }, [
          item.category.toUpperCase(),
        ]),
        h("p", { className: "menu-item-card__description" }, [item.description]),
        h("div", { className: "menu-item-card__actions" }, [
          addToCartButtonView({
            itemId: item.id,
            onClick: () => onAddToCart(item.id),
          }),
          quantityStepperView({
            quantity,
            onDecrement: () => onDecrement(item.id),
          }),
        ]),
      ]),
    ],
  );
}
