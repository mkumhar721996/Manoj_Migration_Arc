import test from "node:test";
import assert from "node:assert/strict";
import { quantityStepperView } from "./QuantityStepper.js";
import { findByTestId, textContentOf } from "../../test/vnodeHelpers.js";

test("AC12: renders nothing when quantity is 0 (no design counterpart otherwise)", () => {
  assert.equal(quantityStepperView({ quantity: 0, onDecrement: () => {} }), null);
});

test("AC12: shows the current quantity when it is at least 1", () => {
  const vnode = quantityStepperView({ quantity: 2, onDecrement: () => {} });
  assert.equal(textContentOf(findByTestId(vnode, "quantity-value")), "2");
});

test("AC12: clicking '-' invokes onDecrement", () => {
  let called = false;
  const vnode = quantityStepperView({
    quantity: 1,
    onDecrement: () => {
      called = true;
    },
  });
  const decrementButton = findByTestId(vnode, "decrement-button");
  decrementButton.props.onClick();
  assert.equal(called, true);
});
