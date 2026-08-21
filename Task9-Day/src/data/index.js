/* Local fallback data. The app talks to dummyjson.com for real, but the
   navigation tasks (1–6) must work with no network — a demo that needs wifi
   to show a drawer is a bad demo. */

export const localProducts = [
  {
    id: 1,
    title: "Mechanical keyboard",
    category: "peripherals",
    price: 89,
    rating: 4.6,
    stock: 42,
    emoji: "⌨️",
    description: "Hot-swappable switches and a machined aluminium case."
  },
  {
    id: 2,
    title: "27-inch 4K monitor",
    category: "displays",
    price: 449,
    rating: 4.8,
    stock: 8,
    emoji: "🖥️",
    description: "Factory-calibrated panel with a single-cable USB-C dock."
  },
  {
    id: 3,
    title: "USB-C dock",
    category: "peripherals",
    price: 129,
    rating: 4.1,
    stock: 0,
    emoji: "🔌",
    description: "Eleven ports, including dual DisplayPort and 100W passthrough."
  },
  {
    id: 4,
    title: "Studio headphones",
    category: "audio",
    price: 199,
    rating: 4.9,
    stock: 17,
    emoji: "🎧",
    description: "Closed-back monitors with a flat response curve."
  },
  {
    id: 5,
    title: "Desk lamp",
    category: "accessories",
    price: 39,
    rating: 3.8,
    stock: 63,
    emoji: "💡",
    description: "Asymmetric optics that light the desk, not the screen."
  },
  {
    id: 6,
    title: "Audio interface",
    category: "audio",
    price: 179,
    rating: 4.7,
    stock: 3,
    emoji: "🎚️",
    description: "Two preamps, 32-bit converters, and no driver install."
  }
];

export const profile = {
  name: "Syed Abdullah Ayaz",
  handle: "@dev4bdullah",
  role: "Frontend Intern",
  location: "Rawalpindi, PK",
  bio: "Working through a frontend internship — day 8 of navigation and APIs.",
  stats: [
    { label: "Days done", value: "8" },
    { label: "Tasks", value: "97" },
    { label: "Streak", value: "8" }
  ]
};

export function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(number);
}

export function titleCase(value = "") {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, character => character.toUpperCase());
}
