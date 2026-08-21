/* Sample data for the list, detail and profile screens. Local, so the app runs
   with no network — a remote image URL is used in task 8 specifically to show
   the loading and error states. */

export const categories = ["All", "Peripherals", "Displays", "Audio", "Accessories"];

export const products = [
  {
    id: "p1",
    name: "Mechanical keyboard",
    category: "Peripherals",
    price: 89,
    rating: 4.6,
    stock: 42,
    emoji: "⌨️",
    blurb: "Hot-swappable switches, aluminium case, and a detachable USB-C cable.",
    tags: ["hot-swap", "75%", "RGB"]
  },
  {
    id: "p2",
    name: "27-inch 4K monitor",
    category: "Displays",
    price: 449,
    rating: 4.8,
    stock: 8,
    emoji: "🖥️",
    blurb: "IPS panel with 99% sRGB coverage and a single-cable USB-C dock.",
    tags: ["4K", "USB-C", "IPS"]
  },
  {
    id: "p3",
    name: "USB-C dock",
    category: "Peripherals",
    price: 129,
    rating: 4.1,
    stock: 0,
    emoji: "🔌",
    blurb: "Eleven ports including dual HDMI, gigabit ethernet and 100W passthrough.",
    tags: ["11 ports", "100W"]
  },
  {
    id: "p4",
    name: "Studio headphones",
    category: "Audio",
    price: 199,
    rating: 4.9,
    stock: 17,
    emoji: "🎧",
    blurb: "Closed-back monitors with a flat response and replaceable earpads.",
    tags: ["closed-back", "50mm"]
  },
  {
    id: "p5",
    name: "Desk lamp",
    category: "Accessories",
    price: 39,
    rating: 3.8,
    stock: 63,
    emoji: "💡",
    blurb: "Adjustable colour temperature with a matte finish that kills glare.",
    tags: ["dimmable", "USB"]
  },
  {
    id: "p6",
    name: "Webcam 1080p",
    category: "Peripherals",
    price: 74,
    rating: 4.2,
    stock: 3,
    emoji: "📷",
    blurb: "Sixty frames a second with autofocus and a physical privacy shutter.",
    tags: ["60fps", "shutter"]
  },
  {
    id: "p7",
    name: "Monitor arm",
    category: "Accessories",
    price: 62,
    rating: 4.4,
    stock: 21,
    emoji: "🦾",
    blurb: "Gas-spring arm rated to 9kg with integrated cable routing.",
    tags: ["gas spring", "VESA"]
  },
  {
    id: "p8",
    name: "Audio interface",
    category: "Audio",
    price: 179,
    rating: 4.7,
    stock: 6,
    emoji: "🎚️",
    blurb: "Two combo inputs, 48V phantom power, and near-zero latency monitoring.",
    tags: ["2-in", "48V"]
  },
  {
    id: "p9",
    name: "Ultrawide monitor",
    category: "Displays",
    price: 699,
    rating: 4.5,
    stock: 5,
    emoji: "🖥️",
    blurb: "34-inch curved ultrawide with a 144Hz refresh rate.",
    tags: ["34in", "144Hz"]
  },
  {
    id: "p10",
    name: "Vertical mouse",
    category: "Peripherals",
    price: 55,
    rating: 4.0,
    stock: 34,
    emoji: "🖱️",
    blurb: "Ergonomic vertical grip with six programmable buttons.",
    tags: ["ergonomic", "6 buttons"]
  },
  {
    id: "p11",
    name: "Studio monitors",
    category: "Audio",
    price: 329,
    rating: 4.8,
    stock: 4,
    emoji: "🔊",
    blurb: "Five-inch woofers with front-firing ports for small rooms.",
    tags: ["5in", "pair"]
  },
  {
    id: "p12",
    name: "Laptop stand",
    category: "Accessories",
    price: 44,
    rating: 4.3,
    stock: 58,
    emoji: "📐",
    blurb: "Folding aluminium stand that raises the screen to eye level.",
    tags: ["folding", "aluminium"]
  }
];

export const profile = {
  name: "Syed Abdullah Ayaz",
  handle: "@dev4bdullah",
  role: "Frontend Intern",
  location: "Lahore, Pakistan",
  bio: "Building mobile interfaces that stay usable on a small screen and a slow connection.",
  stats: [
    { label: "Orders", value: 24 },
    { label: "Reviews", value: 11 },
    { label: "Saved", value: 38 }
  ],
  settings: [
    { id: "s1", label: "Push notifications", value: true },
    { id: "s2", label: "Email receipts", value: true },
    { id: "s3", label: "Dark theme", value: true },
    { id: "s4", label: "Haptic feedback", value: false }
  ]
};

export function formatPrice(value) {
  return `$${Number(value).toLocaleString("en-US")}`;
}
