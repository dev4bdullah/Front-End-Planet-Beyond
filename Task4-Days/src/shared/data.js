/* Local catalogue used by tasks 5, 6 and 12, so those pages work with no
   network. Task 9's service layer talks to a real API separately. */

export const products = [
  {
    id: 1,
    name: "Mechanical keyboard",
    category: "peripherals",
    price: 89,
    stock: 42,
    rating: 4.6,
    emoji: "⌨️",
    brand: "Keychron"
  },
  {
    id: 2,
    name: "27-inch 4K monitor",
    category: "displays",
    price: 449,
    stock: 8,
    rating: 4.8,
    emoji: "🖥️",
    brand: "Dell"
  },
  {
    id: 3,
    name: "USB-C dock",
    category: "peripherals",
    price: 129,
    stock: 0,
    rating: 4.1,
    emoji: "🔌",
    brand: "Anker"
  },
  {
    id: 4,
    name: "Studio headphones",
    category: "audio",
    price: 199,
    stock: 17,
    rating: 4.9,
    emoji: "🎧",
    brand: "Audio-Technica"
  },
  {
    id: 5,
    name: "Desk lamp",
    category: "accessories",
    price: 39,
    stock: 63,
    rating: 3.8,
    emoji: "💡",
    brand: "BenQ"
  },
  {
    id: 6,
    name: "Webcam 1080p",
    category: "peripherals",
    price: 74,
    stock: 3,
    rating: 4.2,
    emoji: "📷",
    brand: "Logitech"
  },
  {
    id: 7,
    name: "Monitor arm",
    category: "accessories",
    price: 62,
    stock: 21,
    rating: 4.4,
    emoji: "🦾",
    brand: "Ergotron"
  },
  {
    id: 8,
    name: "Audio interface",
    category: "audio",
    price: 179,
    stock: 0,
    rating: 4.7,
    emoji: "🎚️",
    brand: "Focusrite"
  },
  {
    id: 9,
    name: "Ultrawide monitor",
    category: "displays",
    price: 699,
    stock: 5,
    rating: 4.5,
    emoji: "🖥️",
    brand: "LG"
  },
  {
    id: 10,
    name: "Vertical mouse",
    category: "peripherals",
    price: 55,
    stock: 34,
    rating: 4.0,
    emoji: "🖱️",
    brand: "Logitech"
  },
  {
    id: 11,
    name: "Studio monitors",
    category: "audio",
    price: 329,
    stock: 6,
    rating: 4.8,
    emoji: "🔊",
    brand: "Yamaha"
  },
  {
    id: 12,
    name: "Laptop stand",
    category: "accessories",
    price: 44,
    stock: 58,
    rating: 4.3,
    emoji: "📐",
    brand: "Rain Design"
  }
];

export const categories = ["peripherals", "displays", "audio", "accessories"];

export const users = [
  {
    id: 1,
    name: "Ayesha Raiz",
    role: "Frontend",
    email: "ayesha@example.com",
    city: "Lahore",
    orders: 12
  },
  {
    id: 2,
    name: "Sadiq Rehman",
    role: "Backend",
    email: "sadiq@example.com",
    city: "Karachi",
    orders: 8
  },
  {
    id: 3,
    name: "Syed Abdullah Ayaz",
    role: "Frontend",
    email: "abdullah@example.com",
    city: "Rawalpindi",
    orders: 15
  },
  {
    id: 4,
    name: "Attique Ahmed",
    role: "QA",
    email: "attique@example.com",
    city: "Islamabad",
    orders: 5
  },
  {
    id: 5,
    name: "Hina Malik",
    role: "Design",
    email: "hina@example.com",
    city: "Lahore",
    orders: 9
  }
];

export function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function titleCase(value = "") {
  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}
