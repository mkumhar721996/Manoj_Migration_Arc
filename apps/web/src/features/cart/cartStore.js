import { cartReducer, emptyCartState } from "./cartReducer.js";
import {
  CART_STORAGE_KEY,
  isStorageAvailable,
  loadCart,
  saveCart,
} from "./cartStorage.js";

/**
 * A tiny framework-agnostic observable store: reducer + persistence +
 * cross-tab sync via the "storage" event, in place of a React Context
 * (React is unavailable in this environment — see summary).
 * @param {{storage?: Storage, eventTarget?: EventTarget}} deps
 */
export function createCartStore({ storage, eventTarget } = {}) {
  const storageAvailable = isStorageAvailable(storage);
  let state = {
    ...(storageAvailable ? loadCart(storage) : emptyCartState()),
    persistenceWarning: false,
  };
  const listeners = new Set();

  function notify() {
    for (const listener of listeners) listener(state);
  }

  function persist() {
    if (!isStorageAvailable(storage)) {
      state = { ...state, persistenceWarning: true };
      return;
    }
    try {
      saveCart(storage, { items: state.items });
    } catch {
      state = { ...state, persistenceWarning: true };
    }
  }

  function dispatch(action) {
    state = { ...cartReducer(state, action), persistenceWarning: state.persistenceWarning };
    persist();
    notify();
  }

  if (eventTarget) {
    eventTarget.addEventListener("storage", (event) => {
      if (event.key !== CART_STORAGE_KEY || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        state = { ...state, items: Array.isArray(parsed.items) ? parsed.items : [] };
        notify();
      } catch {
        // ignore malformed cross-tab payloads
      }
    });
  }

  return {
    getState: () => state,
    dispatch,
    addItem: (itemId) => dispatch({ type: "ADD_ITEM", itemId }),
    decrementItem: (itemId) => dispatch({ type: "DECREMENT_ITEM", itemId }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
