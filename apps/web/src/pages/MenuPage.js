import { h } from "../dom.js";
import { siteHeaderView } from "../components/layout/SiteHeader.js";
import { cartWarningBannerView } from "../components/cart/CartWarningBanner.js";
import { menuGridView } from "../components/menu/MenuGrid.js";
import { stickyCartSummaryBarView } from "../components/cart/StickyCartSummaryBar.js";
import { selectTotalUnits, selectSubtotal } from "../features/cart/cartSelectors.js";

/**
 * @param {{
 *   state: {items: {itemId: string, quantity: number}[], persistenceWarning: boolean},
 *   catalog: Array<{id: string, name: string, category: string, price: number, description: string, image: string}>,
 *   store: {addItem: (itemId: string) => void, decrementItem: (itemId: string) => void},
 * }} props
 */
export function menuPageView({ state, catalog, store }) {
  const totalUnits = selectTotalUnits(state.items);
  const subtotal = selectSubtotal(state.items, catalog);
  const quantities = Object.fromEntries(
    state.items.map((line) => [line.itemId, line.quantity]),
  );

  return h("div", { className: "menu-page", "data-testid": "menu-page" }, [
    siteHeaderView({ cartCount: totalUnits }),
    cartWarningBannerView({ visible: state.persistenceWarning }),
    menuGridView({
      items: catalog,
      quantities,
      onAddToCart: (itemId) => store.addItem(itemId),
      onDecrement: (itemId) => store.decrementItem(itemId),
    }),
    stickyCartSummaryBarView({ totalUnits, subtotal }),
  ]);
}
