export const CART_STORAGE_KEY = "forno-rosso.cart.v1";

/** @param {Storage | undefined} storage */
export function isStorageAvailable(storage) {
  if (!storage) return false;
  const probeKey = `${CART_STORAGE_KEY}.__probe__`;
  try {
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {Storage} storage
 * @param {{items: {itemId: string, quantity: number}[]}} state
 */
export function saveCart(storage, state) {
  storage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

/** @param {Storage} storage */
export function loadCart(storage) {
  try {
    const raw = storage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}
