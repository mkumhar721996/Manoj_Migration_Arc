import { mountOrderApp } from "./orderApp.js";
import { createOrderGateway } from "./orderGateway.js";

const DEMO_PRODUCT = {
  id: "margherita",
  name: "Classic Margherita",
  unitPrice: 14.5,
  stock: 20,
};

function auth() {
  return {
    getCurrentUser: () => {
      const raw = window.sessionStorage.getItem("fornoRosso:user");
      return raw ? JSON.parse(raw) : null;
    },
  };
}

mountOrderApp({
  container: document.getElementById("root"),
  product: DEMO_PRODUCT,
  gateway: createOrderGateway(),
  auth: auth(),
});
