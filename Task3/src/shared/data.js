/* Shared sample data so the list, props and form pages all describe
   the same imaginary team. */

export const team = [
  { id: 1, name: "Ayesha Raiz", role: "Frontend", tasks: 12, done: 9, status: "active" },
  { id: 2, name: "Sadiq Rehman", role: "Backend", tasks: 8, done: 8, status: "away" },
  { id: 3, name: "Syed Abdullah Ayaz", role: "Frontend", tasks: 15, done: 11, status: "active" },
  { id: 4, name: "Attique Ahmed", role: "QA", tasks: 5, done: 2, status: "offline" }
];

export const tasks = [
  {
    id: "t1",
    title: "Fix nav overlap on mobile",
    priority: "high",
    done: true,
    owner: "Ayesha Raiz"
  },
  {
    id: "t2",
    title: "Write the validation module",
    priority: "medium",
    done: true,
    owner: "Syed Abdullah Ayaz"
  },
  { id: "t3", title: "Add dark mode toggle", priority: "low", done: false, owner: "Sadiq Rehman" },
  {
    id: "t4",
    title: "Build API error states",
    priority: "high",
    done: false,
    owner: "Ayesha Raiz"
  },
  { id: "t5", title: "Review DevTools notes", priority: "low", done: false, owner: "Attique Ahmed" }
];

export const products = [
  { id: 1, name: "Mechanical keyboard", category: "Peripherals", price: 89, stock: 12 },
  { id: 2, name: "27-inch monitor", category: "Displays", price: 240, stock: 3 },
  { id: 3, name: "USB-C dock", category: "Peripherals", price: 65, stock: 0 },
  { id: 4, name: "Desk lamp", category: "Accessories", price: 32, stock: 24 }
];
