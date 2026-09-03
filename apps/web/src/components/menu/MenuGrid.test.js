import test from "node:test";
import assert from "node:assert/strict";
import { menuGridView } from "./MenuGrid.js";
import { findByTestId } from "../../test/vnodeHelpers.js";

const items = [
  {
    id: "a",
    name: "A",
    category: "Classic",
    price: 10,
    description: "d",
    image: "/images/a.png",
  },
  {
    id: "b",
    name: "B",
    category: "Classic",
    price: 5,
    description: "d",
    image: "/images/b.png",
  },
];

test("renders one MenuItemCard per catalog item, wired to that item's quantity", () => {
  const vnode = menuGridView({
    items,
    quantities: { a: 2 },
    onAddToCart: () => {},
    onDecrement: () => {},
  });
  assert.ok(findByTestId(vnode, "menu-item-card-a"));
  assert.ok(findByTestId(vnode, "menu-item-card-b"));
  assert.ok(findByTestId(findByTestId(vnode, "menu-item-card-a"), "quantity-stepper"));
});
