import test from "node:test";
import assert from "node:assert/strict";
import { cartWarningBannerView } from "./CartWarningBanner.js";
import { findByTestId, textContentOf } from "../../test/vnodeHelpers.js";

test("AC13: renders nothing when there is no persistence warning", () => {
  assert.equal(cartWarningBannerView({ visible: false }), null);
});

test("AC13: renders a non-blocking status warning when storage is unavailable", () => {
  const vnode = cartWarningBannerView({ visible: true });
  assert.equal(vnode.props.role, "status");
  assert.match(textContentOf(vnode), /will not be saved/i);
});
