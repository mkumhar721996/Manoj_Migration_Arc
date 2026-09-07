import { renderCartPage } from "./cartView.js";
import { renderCartBadge } from "./cartBadge.js";
import { createCartStore } from "./cartStore.js";

export function handleAction({
  actionId,
  itemId,
  store,
  navigate,
  checkoutUrl = "/checkout",
  menuItems,
}) {
  switch (actionId) {
    case "increment":
      store.incrementQuantity(itemId);
      break;
    case "decrement":
      store.decrementQuantity(itemId);
      break;
    case "add-to-cart": {
      const menuItem = menuItems?.find((item) => item.id === itemId);
      if (menuItem) store.addItem(menuItem);
      break;
    }
    case "checkout":
      if (store.getState().items.length > 0) {
        navigate(checkoutUrl);
      }
      break;
    default:
      break;
  }
}

function defaultNavigate(path) {
  window.location.assign(path);
}

export function mountCartApp({
  container,
  badgeContainer,
  storage = window.localStorage,
  navigate = defaultNavigate,
}) {
  const store = createCartStore({ storage, now: Date.now });

  function render() {
    const state = store.getState();
    container.innerHTML = renderCartPage(state);
    if (badgeContainer) {
      badgeContainer.innerHTML = renderCartBadge(state.itemCount);
    }
  }

  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.disabled) return;

    handleAction({
      actionId: target.dataset.action,
      itemId: target.dataset.id,
      store,
      navigate,
    });
  });

  store.subscribe(render);
  render();

  return store;
}
