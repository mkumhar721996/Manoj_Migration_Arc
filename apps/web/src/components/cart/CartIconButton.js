import { h } from "../../dom.js";

/** @param {{count: number}} props */
export function cartIconButtonView({ count }) {
  return h(
    "span",
    {
      className: "cart-icon-button",
      "data-testid": "cart-icon-button",
      role: "status",
      "aria-label": count > 0 ? `Cart, ${count} item(s)` : "Cart, empty",
    },
    [
      h(
        "svg",
        {
          "data-testid": "cart-icon",
          className: "cart-icon-button__glyph",
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
        },
        [],
      ),
      count > 0
        ? h(
            "span",
            {
              "data-testid": "cart-count",
              className: "cart-icon-button__count",
            },
            [String(count)],
          )
        : null,
    ],
  );
}
