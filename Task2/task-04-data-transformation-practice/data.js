// A realistic dataset — mixed priorities, some overdue, some done, one with no assignee.

export const tasks = [
  {
    id: 1,
    title: "Fix nav overlap on mobile",
    assignee: "Ayesha",
    priority: "high",
    status: "done",
    hours: 2,
    due: "2026-08-10",
    tags: ["css", "bug"]
  },
  {
    id: 2,
    title: "Write validation module",
    assignee: "Abdullah",
    priority: "medium",
    status: "done",
    hours: 3,
    due: "2026-08-12",
    tags: ["js"]
  },
  {
    id: 3,
    title: "Add dark mode toggle",
    assignee: "Sadiq",
    priority: "low",
    status: "active",
    hours: 4,
    due: "2026-08-25",
    tags: ["css", "feature"]
  },
  {
    id: 4,
    title: "Set up ESLint and Prettier",
    assignee: "Abdullah",
    priority: "high",
    status: "done",
    hours: 1,
    due: "2026-08-09",
    tags: ["tooling"]
  },
  {
    id: 5,
    title: "Build API error states",
    assignee: "Ayesha",
    priority: "high",
    status: "active",
    hours: 5,
    due: "2026-08-14",
    tags: ["js", "ux"]
  },
  {
    id: 6,
    title: "Refactor render function",
    assignee: "Attique",
    priority: "medium",
    status: "active",
    hours: 2,
    due: "2026-08-30",
    tags: ["js"]
  },
  {
    id: 7,
    title: "Update the README",
    assignee: null,
    priority: "low",
    status: "active",
    hours: 1,
    due: "2026-09-05",
    tags: ["docs"]
  },
  {
    id: 8,
    title: "Cache API responses",
    assignee: "Sadiq",
    priority: "medium",
    status: "active",
    hours: 6,
    due: "2026-08-16",
    tags: ["js", "perf"]
  },
  {
    id: 9,
    title: "Fix focus trap in modal",
    assignee: "Ayesha",
    priority: "high",
    status: "active",
    hours: 3,
    due: "2026-08-11",
    tags: ["a11y", "bug"]
  },
  {
    id: 10,
    title: "Add keyboard shortcuts",
    assignee: "Attique",
    priority: "low",
    status: "done",
    hours: 2,
    due: "2026-08-13",
    tags: ["a11y", "feature"]
  }
];

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
