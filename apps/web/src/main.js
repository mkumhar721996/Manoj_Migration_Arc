import { mount } from "./dom.js";
import { menuPageView } from "./pages/MenuPage.js";
import { createCartStore } from "./features/cart/cartStore.js";
import { menuItems } from "./data/menuItems.js";

const root = document.getElementById("root");

let storage;
try {
  storage = window.localStorage;
} catch {
  storage = undefined;
}

const store = createCartStore({ storage, eventTarget: window });

function render() {
  mount(menuPageView({ state: store.getState(), catalog: menuItems, store }), root);
}

store.subscribe(render);
render();
