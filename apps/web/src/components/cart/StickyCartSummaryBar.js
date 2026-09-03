import { h } from "../../dom.js";
import { formatCartSummary } from "../../features/cart/cartSelectors.js";

/**
 * Sticky cart summary bar (Figma node 13:187). Rendered as a fixed
 * bottom-right overlay per the recorded (deferred, not human-confirmed)
 * `sticky-cart-summary-position` assumption, so it stays visible above the
 * footer instead of reproducing the literal in-flow Figma position that
 * sits hidden behind it.
 * @param {{totalUnits: number, subtotal: number, onCheckout?: () => void}} props
 */
export function stickyCartSummaryBarView({ totalUnits, subtotal, onCheckout }) {
  if (totalUnits <= 0) return null;

  return h(
    "div",
    {
      className: "sticky-cart-summary",
      "data-testid": "sticky-cart-summary",
      role: "region",
      "aria-label": "Cart summary",
    },
    [
      h("span", { className: "sticky-cart-summary__icon", "aria-hidden": "true" }, []),
      h("div", { className: "sticky-cart-summary__copy" }, [
        h("p", { className: "sticky-cart-summary__title" }, ["Cart Summary"]),
        h(
          "p",
          {
            className: "sticky-cart-summary__subtitle",
            "data-testid": "cart-summary-subtitle",
          },
          [formatCartSummary(totalUnits, subtotal)],
        ),
      ]),
      h(
        "button",
        {
          type: "button",
          className: "sticky-cart-summary__checkout",
          "data-testid": "checkout-button",
          onClick: onCheckout ?? (() => {}),
        },
        ["Checkout"],
      ),
    ],
  );
}
