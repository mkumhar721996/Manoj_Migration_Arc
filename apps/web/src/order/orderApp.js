import { renderOrderPage } from "./orderView.js";
import { createOrderStore } from "./orderStore.js";

export async function handleAction({ actionId, method, auth, store, navigate }) {
  switch (actionId) {
    case "place-order":
      if (!auth.getCurrentUser()) {
        navigate("/login");
        return;
      }
      await store.submitOrder();
      break;
    case "select-payment":
      store.setPaymentMethod(method);
      break;
    default:
      break;
  }
}

function defaultNavigate(path) {
  window.location.assign(path);
}

export function mountOrderApp({ container, product, gateway, auth, navigate = defaultNavigate }) {
  const store = createOrderStore({ product, gateway });

  function render() {
    container.innerHTML = renderOrderPage(store.getState());
  }

  container.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target || target.disabled) return;

    handleAction({
      actionId: target.dataset.action,
      method: target.dataset.method,
      auth,
      store,
      navigate,
    });
  });

  store.subscribe(render);
  render();

  return store;
}
