import { handleAction } from "../cart/cartApp.js";
import { createCartStore } from "../cart/cartStore.js";
import { renderCartSummaryPanel } from "../cart/cartSummaryView.js";
import { renderMenuGrid } from "./menuGridView.js";
import { menuItems } from "./menuItems.js";

function defaultNavigate(path) {
  window.location.assign(path);
}

export function mountMenuApp({
  container,
  storage = window.localStorage,
  navigate = defaultNavigate,
}) {
  const store = createCartStore({ storage, now: Date.now });
  const checkoutUrl = container.dataset.checkoutUrl || "/checkout";

  function render() {
    const state = store.getState();
    container.innerHTML = `
      ${renderMenuGrid(menuItems)}
      ${renderCartSummaryPanel(state)}
    `;
  }

  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.disabled) return;

    handleAction({
      actionId: target.dataset.action,
      itemId: target.dataset.id,
      store,
      navigate,
      checkoutUrl,
      menuItems,
    });
  });

  store.subscribe(render);
  render();

  return store;
}
