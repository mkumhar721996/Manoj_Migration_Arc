import { h } from "../../dom.js";

/** @param {{itemId: string, onClick: () => void}} props */
export function addToCartButtonView({ itemId, onClick }) {
  return h(
    "button",
    {
      type: "button",
      className: "add-to-cart-button",
      "data-testid": `add-to-cart-${itemId}`,
      onClick,
    },
    [
      h("svg", { className: "add-to-cart-button__icon", "aria-hidden": "true" }, []),
      h("span", {}, ["Add to Cart"]),
    ],
  );
}
