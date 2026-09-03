import { h } from "../../dom.js";

/**
 * Net-new component (AC12's '-' decrement control has no Figma counterpart
 * — see summary). Built only from approved tokens: --ink text/border,
 * --border 1px stroke, radius 8, body-medium 14/500 Geist.
 * @param {{quantity: number, onDecrement: () => void}} props
 */
export function quantityStepperView({ quantity, onDecrement }) {
  if (quantity <= 0) return null;
  return h(
    "div",
    { className: "quantity-stepper", "data-testid": "quantity-stepper" },
    [
      h(
        "button",
        {
          type: "button",
          className: "quantity-stepper__button",
          "data-testid": "decrement-button",
          "aria-label": "Decrease quantity",
          onClick: onDecrement,
        },
        ["-"],
      ),
      h(
        "span",
        { className: "quantity-stepper__value", "data-testid": "quantity-value" },
        [String(quantity)],
      ),
    ],
  );
}
