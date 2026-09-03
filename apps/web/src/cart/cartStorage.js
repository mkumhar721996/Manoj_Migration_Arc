export const CART_STORAGE_KEY = "fornoRosso:cart";
export const CART_TTL_MS = 24 * 60 * 60 * 1000;

export function saveCart(storage, items, now) {
  storage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, savedAt: now }));
}

export function loadCart(storage, now) {
  const raw = storage.getItem(CART_STORAGE_KEY);
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!parsed || !Array.isArray(parsed.items)) return [];
  if (now - parsed.savedAt >= CART_TTL_MS) return [];

  return parsed.items;
}
