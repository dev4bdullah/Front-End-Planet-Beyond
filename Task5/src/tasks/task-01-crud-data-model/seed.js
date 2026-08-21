import { SCHEMAS } from "./model";

/* Fixed ids and timestamps, so the seed data is identical on every load —
   a moving dataset makes a demo impossible to reason about. */

const base = new Date("2026-08-10T09:00:00.000Z").getTime();
const at = offsetHours => new Date(base + offsetHours * 3600_000).toISOString();

export const SEED = {
  products: [
    {
      id: "prd_seed1",
      name: "Mechanical keyboard",
      sku: "KB-1042",
      category: "peripherals",
      price: 89,
      stock: 42,
      status: "active",
      email: "supply@keychron.example",
      notes: "Hot-swappable switches.",
      createdAt: at(0),
      updatedAt: at(2)
    },
    {
      id: "prd_seed2",
      name: "27-inch 4K monitor",
      sku: "MN-2201",
      category: "displays",
      price: 449,
      stock: 8,
      status: "active",
      email: "",
      notes: "",
      createdAt: at(1),
      updatedAt: at(1)
    },
    {
      id: "prd_seed3",
      name: "USB-C dock",
      sku: "DK-3310",
      category: "peripherals",
      price: 129,
      stock: 0,
      status: "archived",
      email: "",
      notes: "Discontinued by supplier.",
      createdAt: at(2),
      updatedAt: at(30)
    },
    {
      id: "prd_seed4",
      name: "Studio headphones",
      sku: "HP-4420",
      category: "audio",
      price: 199,
      stock: 17,
      status: "active",
      email: "",
      notes: "",
      createdAt: at(3),
      updatedAt: at(3)
    },
    {
      id: "prd_seed5",
      name: "Desk lamp",
      sku: "LM-5150",
      category: "accessories",
      price: 39,
      stock: 63,
      status: "draft",
      email: "",
      notes: "Awaiting photography.",
      createdAt: at(4),
      updatedAt: at(5)
    },
    {
      id: "prd_seed6",
      name: "Audio interface",
      sku: "AI-6600",
      category: "audio",
      price: 179,
      stock: 3,
      status: "active",
      email: "",
      notes: "Low stock.",
      createdAt: at(5),
      updatedAt: at(28)
    }
  ],

  users: [
    {
      id: "usr_seed1",
      name: "Ayesha Raiz",
      email: "ayesha@example.com",
      role: "admin",
      status: "active",
      notes: "",
      createdAt: at(0),
      updatedAt: at(0)
    },
    {
      id: "usr_seed2",
      name: "Sadiq Rehman",
      email: "sadiq@example.com",
      role: "editor",
      status: "active",
      notes: "",
      createdAt: at(1),
      updatedAt: at(1)
    },
    {
      id: "usr_seed3",
      name: "Syed Abdullah Ayaz",
      email: "abdullah@example.com",
      role: "editor",
      status: "active",
      notes: "Frontend intern.",
      createdAt: at(2),
      updatedAt: at(6)
    },
    {
      id: "usr_seed4",
      name: "Attique Ahmed",
      email: "attique@example.com",
      role: "viewer",
      status: "draft",
      notes: "Invite not accepted yet.",
      createdAt: at(3),
      updatedAt: at(3)
    }
  ],

  tasks: [
    {
      id: "tsk_seed1",
      title: "Fix nav overlap on mobile",
      assignee: "Ayesha Raiz",
      priority: "high",
      status: "active",
      dueDate: "2026-08-28",
      notes: "",
      createdAt: at(0),
      updatedAt: at(0)
    },
    {
      id: "tsk_seed2",
      title: "Write the validation module",
      assignee: "Syed Abdullah Ayaz",
      priority: "medium",
      status: "archived",
      dueDate: "2026-08-22",
      notes: "Done, awaiting review.",
      createdAt: at(1),
      updatedAt: at(9)
    },
    {
      id: "tsk_seed3",
      title: "Add dark mode toggle",
      assignee: "Sadiq Rehman",
      priority: "low",
      status: "draft",
      dueDate: "2026-09-10",
      notes: "",
      createdAt: at(2),
      updatedAt: at(2)
    },
    {
      id: "tsk_seed4",
      title: "Review DevTools notes",
      assignee: "Attique Ahmed",
      priority: "low",
      status: "active",
      dueDate: "2026-09-02",
      notes: "",
      createdAt: at(3),
      updatedAt: at(3)
    },
    {
      id: "tsk_seed5",
      title: "Ship the CRUD deliverable",
      assignee: "Syed Abdullah Ayaz",
      priority: "high",
      status: "active",
      dueDate: "2026-08-30",
      notes: "Day 5 capstone.",
      createdAt: at(4),
      updatedAt: at(12)
    }
  ]
};

export function seedFor(entity) {
  return SEED[entity].map(record => ({ ...record }));
}

export function emptyStore() {
  return Object.fromEntries(Object.keys(SCHEMAS).map(entity => [entity, []]));
}

export function seededStore() {
  return Object.fromEntries(Object.keys(SCHEMAS).map(entity => [entity, seedFor(entity)]));
}
