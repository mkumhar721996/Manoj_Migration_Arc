import { h } from "../../dom.js";
import { cartIconButtonView } from "../cart/CartIconButton.js";

/**
 * Minimal header slice: brand mark + CartIconButton only. Full nav links,
 * active-state underline and the ETA text are out of this story's ACs — see
 * summary's explicit out-of-scope note.
 * @param {{cartCount: number}} props
 */
export function siteHeaderView({ cartCount }) {
  return h(
    "header",
    { className: "site-header", "data-testid": "site-header" },
    [
      h("span", { className: "site-header__brand" }, ["Forno Rosso"]),
      cartIconButtonView({ count: cartCount }),
    ],
  );
}
