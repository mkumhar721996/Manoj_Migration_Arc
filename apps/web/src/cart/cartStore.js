import { MAX_QUANTITY, getCartItemCount, subtotal } from "./cartMath.js";
import { loadCart, saveCart } from "./cartStorage.js";

const PERSIST_ERROR_MESSAGE =
  "We couldn't save your cart changes. Please try again.";

export function createCartStore({ storage, now = Date.now, initialItems }) {
  let items = initialItems ?? loadCart(storage, now());
  let error = null;
  const listeners = new Set();

  function getState() {
    return {
      items: items.slice(),
      subtotal: subtotal(items),
      itemCount: getCartItemCount(items),
      error,
    };
  }

  function notify() {
    const state = getState();
    listeners.forEach((listener) => listener(state));
  }

  function commit(nextItems) {
    const previousItems = items;
    try {
      saveCart(storage, nextItems, now());
      items = nextItems;
      error = null;
    } catch {
      items = previousItems;
      error = PERSIST_ERROR_MESSAGE;
    }
    notify();
  }

  function incrementQuantity(id) {
    const target = items.find((item) => item.id === id);
    if (!target || target.quantity >= MAX_QUANTITY) return;

    commit(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function addItem(item) {
    const target = items.find((existing) => existing.id === item.id);

    if (target) {
      if (target.quantity >= MAX_QUANTITY) return;
      commit(
        items.map((existing) =>
          existing.id === item.id
            ? { ...existing, quantity: existing.quantity + 1 }
            : existing,
        ),
      );
      return;
    }

    commit([...items, { ...item, quantity: 1 }]);
  }

  function decrementQuantity(id) {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const nextItems =
      target.quantity <= 1
        ? items.filter((item) => item.id !== id)
        : items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
          );

    commit(nextItems);
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return { getState, subscribe, addItem, incrementQuantity, decrementQuantity };
}
