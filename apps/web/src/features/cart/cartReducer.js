export const MAX_QUANTITY = 99;

/** @returns {{items: {itemId: string, quantity: number}[]}} */
export function emptyCartState() {
  return { items: [] };
}

/**
 * @param {{items: {itemId: string, quantity: number}[]}} state
 * @param {{type: string, itemId?: string, items?: {itemId: string, quantity: number}[]}} action
 */
export function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find(
        (line) => line.itemId === action.itemId,
      );
      if (!existing) {
        return {
          items: [...state.items, { itemId: action.itemId, quantity: 1 }],
        };
      }
      return {
        items: state.items.map((line) =>
          line.itemId === action.itemId
            ? { ...line, quantity: Math.min(line.quantity + 1, MAX_QUANTITY) }
            : line,
        ),
      };
    }
    case "DECREMENT_ITEM": {
      const existing = state.items.find(
        (line) => line.itemId === action.itemId,
      );
      if (!existing) {
        return state;
      }
      if (existing.quantity <= 1) {
        return {
          items: state.items.filter((line) => line.itemId !== action.itemId),
        };
      }
      return {
        items: state.items.map((line) =>
          line.itemId === action.itemId
            ? { ...line, quantity: line.quantity - 1 }
            : line,
        ),
      };
    }
    default:
      return state;
  }
}
