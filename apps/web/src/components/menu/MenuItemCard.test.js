import test from "node:test";
import assert from "node:assert/strict";
import { menuItemCardView } from "./MenuItemCard.js";
import { findByTestId } from "../../test/vnodeHelpers.js";

const item = {
  id: "classic-margherita",
  name: "Classic Margherita",
  category: "Classic",
  price: 14.5,
  description: "San Marzano sauce, fresh buffalo mozzarella.",
  image: "/images/classic-margherita.png",
};

test("AC1: clicking Add to Cart calls onAddToCart with the item's id", () => {
  let addedId = null;
  const vnode = menuItemCardView({
    item,
    quantity: 0,
    onAddToCart: (id) => {
      addedId = id;
    },
    onDecrement: () => {},
  });
  const addButton = findByTestId(vnode, "add-to-cart-classic-margherita");
  addButton.props.onClick();
  assert.equal(addedId, "classic-margherita");
});

test("AC12: no stepper is rendered while quantity is 0", () => {
  const vnode = menuItemCardView({
    item,
    quantity: 0,
    onAddToCart: () => {},
    onDecrement: () => {},
  });
  assert.equal(findByTestId(vnode, "quantity-stepper"), null);
});

test("AC12: the stepper appears next to Add to Cart once quantity is >= 1", () => {
  const vnode = menuItemCardView({
    item,
    quantity: 1,
    onAddToCart: () => {},
    onDecrement: () => {},
  });
  assert.ok(findByTestId(vnode, "quantity-stepper"));
  assert.ok(findByTestId(vnode, "add-to-cart-classic-margherita"));
});

test("AC12: clicking '-' inside the card calls onDecrement with the item's id", () => {
  let decrementedId = null;
  const vnode = menuItemCardView({
    item,
    quantity: 1,
    onAddToCart: () => {},
    onDecrement: (id) => {
      decrementedId = id;
    },
  });
  findByTestId(vnode, "decrement-button").props.onClick();
  assert.equal(decrementedId, "classic-margherita");
});
