import { renderCartPage } from "./cartView.js";
import { createCartStore } from "./cartStore.js";

export function handleAction({ actionId, itemId, store, navigate }) {
  switch (actionId) {
    case "increment":
      store.incrementQuantity(itemId);
      break;
    case "decrement":
      store.decrementQuantity(itemId);
      break;
    case "checkout":
      if (store.getState().items.length > 0) {
        navigate("/checkout");
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
  storage = window.localStorage,
  navigate = defaultNavigate,
}) {
  const store = createCartStore({ storage, now: Date.now });

  function render() {
    container.innerHTML = renderCartPage(store.getState());
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
