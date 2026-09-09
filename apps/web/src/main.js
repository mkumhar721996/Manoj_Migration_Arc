import { mountCartApp } from "./cart/cartApp.js";
import { mountFooter } from "./components/footer.js";

mountCartApp({
  container: document.getElementById("root"),
  badgeContainer: document.getElementById("cart-badge"),
});

mountFooter(document.getElementById("site-footer"));
