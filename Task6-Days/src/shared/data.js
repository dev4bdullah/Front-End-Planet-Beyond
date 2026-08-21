/* Sample data for the whole dashboard. Deliberately messy in places — a null
   assignee, a zero-stock product, a refunded order — so the empty, warning and
   error states on every page have something real to render. */

export const kpis = [
  {
    id: "revenue",
    label: "Revenue",
    value: 48290,
    prefix: "$",
    delta: 12.4,
    spark: [31, 34, 33, 38, 41, 44, 48]
  },
  {
    id: "orders",
    label: "Orders",
    value: 1284,
    delta: 8.1,
    spark: [820, 910, 880, 1010, 1120, 1190, 1284]
  },
  {
    id: "customers",
    label: "Customers",
    value: 3412,
    delta: -2.3,
    spark: [3610, 3580, 3540, 3500, 3470, 3440, 3412]
  },
  {
    id: "refunds",
    label: "Refund rate",
    value: 2.8,
    suffix: "%",
    delta: -0.6,
    spark: [4.1, 3.9, 3.6, 3.3, 3.1, 2.9, 2.8]
  }
];

export const revenueSeries = [
  { month: "Feb", revenue: 31200, orders: 820, target: 30000 },
  { month: "Mar", revenue: 34100, orders: 910, target: 32000 },
  { month: "Apr", revenue: 33050, orders: 880, target: 34000 },
  { month: "May", revenue: 38400, orders: 1010, target: 36000 },
  { month: "Jun", revenue: 41250, orders: 1120, target: 38000 },
  { month: "Jul", revenue: 44600, orders: 1190, target: 40000 },
  { month: "Aug", revenue: 48290, orders: 1284, target: 42000 }
];

export const categorySplit = [
  { name: "Peripherals", value: 18400 },
  { name: "Displays", value: 14250 },
  { name: "Audio", value: 8900 },
  { name: "Accessories", value: 6740 }
];

export const trafficSources = [
  { source: "Organic", sessions: 12400, conversion: 3.2 },
  { source: "Direct", sessions: 8100, conversion: 4.1 },
  { source: "Referral", sessions: 4600, conversion: 2.7 },
  { source: "Social", sessions: 3900, conversion: 1.4 },
  { source: "Email", sessions: 2200, conversion: 5.8 }
];

const NAMES = [
  "Ayesha Raiz",
  "Sadiq Rehman",
  "Syed Abdullah Ayaz",
  "Attique Ahmed",
  "Hina Malik",
  "Bilal Khan",
  "Zara Sheikh",
  "Usman Tariq",
  "Fatima Noor",
  "Hamza Iqbal",
  "Sana Javed",
  "Omar Farooq"
];

const PRODUCTS = [
  ["Mechanical keyboard", "Peripherals", 89],
  ["27-inch 4K monitor", "Displays", 449],
  ["USB-C dock", "Peripherals", 129],
  ["Studio headphones", "Audio", 199],
  ["Desk lamp", "Accessories", 39],
  ["Webcam 1080p", "Peripherals", 74],
  ["Monitor arm", "Accessories", 62],
  ["Audio interface", "Audio", 179]
];

const STATUSES = ["paid", "pending", "shipped", "refunded", "failed"];

/* Generated once at module load so every page sees the same rows. */
export const orders = Array.from({ length: 47 }, (_, index) => {
  const [product, category, price] = PRODUCTS[index % PRODUCTS.length];
  const quantity = (index % 3) + 1;
  const date = new Date(2026, 7, 17 - (index % 30));

  return {
    id: `ORD-${String(2481 - index).padStart(4, "0")}`,
    customer: index === 6 ? null : NAMES[index % NAMES.length],
    product,
    category,
    quantity,
    total: price * quantity,
    status: STATUSES[index % STATUSES.length],
    date: date.toISOString().slice(0, 10)
  };
});

export const products = PRODUCTS.map(([name, category, price], index) => ({
  id: index + 1,
  name,
  category,
  price,
  stock: [42, 8, 0, 17, 63, 3, 21, 0][index],
  rating: [4.6, 4.8, 4.1, 4.9, 3.8, 4.2, 4.4, 4.7][index]
}));

export const activity = [
  {
    id: 1,
    who: "Ayesha Raiz",
    what: "refunded order ORD-2475",
    when: "12 minutes ago",
    tone: "warning"
  },
  { id: 2, who: "Sadiq Rehman", what: "shipped 4 orders", when: "40 minutes ago", tone: "success" },
  { id: 3, who: "System", what: "payment gateway timed out", when: "1 hour ago", tone: "danger" },
  {
    id: 4,
    who: "Syed Abdullah Ayaz",
    what: "added 2 products",
    when: "3 hours ago",
    tone: "brand"
  },
  {
    id: 5,
    who: "Attique Ahmed",
    what: "updated stock for 6 items",
    when: "5 hours ago",
    tone: "brand"
  }
];

export const STATUS_TONE = {
  paid: "success",
  shipped: "brand",
  pending: "warning",
  refunded: "neutral",
  failed: "danger"
};

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
