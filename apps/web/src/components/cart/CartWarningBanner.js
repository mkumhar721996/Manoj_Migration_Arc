import { h } from "../../dom.js";

/**
 * Non-blocking storage warning (no corresponding Figma node — this story's
 * AC13 has no design counterpart, see summary). `role="status"` so
 * assistive tech announces it without stealing focus or blocking input.
 * @param {{visible: boolean}} props
 */
export function cartWarningBannerView({ visible }) {
  if (!visible) return null;
  return h(
    "p",
    {
      className: "cart-warning-banner",
      "data-testid": "cart-warning-banner",
      role: "status",
    },
    ["Your cart will not be saved — storage is unavailable in this browser."],
  );
}
