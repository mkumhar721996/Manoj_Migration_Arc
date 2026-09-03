/**
 * @typedef {object} MenuItem
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string} description
 * @property {string} image
 */

/** @type {MenuItem[]} */
export const menuItems = [
  {
    id: "classic-margherita",
    name: "Classic Margherita",
    category: "Classic",
    price: 14.5,
    description:
      "San Marzano sauce, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.",
    image: "/images/classic-margherita.png",
  },
  {
    id: "diavola",
    name: "Diavola",
    category: "Specialty",
    price: 16.5,
    description:
      "Spicy calabrian salami, fresh mozzarella, tomato base, organic chili oil, fresh basil.",
    image: "/images/diavola.png",
  },
  {
    id: "funghi-e-tartufo",
    name: "Funghi e Tartufo",
    category: "Specialty",
    price: 18.0,
    description:
      "Wild porcini and cremini mushrooms, truffle-infused olive oil, white mozzarella base.",
    image: "/images/funghi-e-tartufo.png",
  },
  {
    id: "prosciutto-e-rucola",
    name: "Prosciutto e Rucola",
    category: "Specialty",
    price: 19.0,
    description:
      "Prosciutto di Parma, wild arugula, shaved parmigiano-reggiano, sweet balsamic glaze.",
    image: "/images/prosciutto-e-rucola.png",
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    category: "Classic",
    price: 16.0,
    description:
      "Buffalo mozzarella, gorgonzola dolce, fresh ricotta, aged parmigiano-reggiano.",
    image: "/images/quattro-formaggi.png",
  },
  {
    id: "verdure-grigliate",
    name: "Verdure Grigliate",
    category: "Vegetarian",
    price: 15.0,
    description:
      "Grilled bell peppers, eggplant, roasted zucchini, marinated cherry tomatoes, herb pesto.",
    image: "/images/verdure-grigliate.png",
  },
  {
    id: "calzone-rosso",
    name: "Calzone Rosso",
    category: "Classic",
    price: 17.0,
    description:
      "Folded sourdough stuffed with ricotta, spicy salami, crushed tomatoes, fresh mozzarella.",
    image: "/images/calzone-rosso.png",
  },
  {
    id: "rosemary-garlic-focaccia",
    name: "Rosemary Garlic Focaccia",
    category: "Sides & Drinks",
    price: 8.5,
    description:
      "Fresh baked warm sourdough focaccia, woodfired rosemary, garlic salt, olive oil.",
    image: "/images/rosemary-garlic-focaccia.png",
  },
  {
    id: "tiramisu-della-casa",
    name: "Tiramisu della Casa",
    category: "Sides & Drinks",
    price: 9.0,
    description:
      "Traditional espresso-soaked ladyfingers, whipped farm mascarpone, pure cocoa dust.",
    image: "/images/tiramisu-della-casa.png",
  },
];
