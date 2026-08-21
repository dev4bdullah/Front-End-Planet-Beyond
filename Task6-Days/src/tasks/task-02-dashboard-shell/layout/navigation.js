import {
  Boxes,
  ChartLine,
  Component,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Palette,
  Rocket,
  ShieldAlert,
  Split,
  Sparkles,
  Table2,
  TestTube
} from "lucide-react";

/* One list drives the sidebar, the mobile menu, the topbar title and the router.
   Adding a page means adding a line here.

   `label` is the short form for the sidebar rail; `title` is the full task name
   from the sheet, which each page renders as its h1. Keeping both here means the
   two can never disagree. */

export const NAV = [
  {
    num: 1,
    slug: "tailwind-setup",
    title: "Tailwind Dashboard Setup",
    label: "Tailwind Setup",
    icon: Palette,
    group: "Foundation"
  },
  {
    num: 2,
    slug: "dashboard-shell",
    title: "Dashboard Shell",
    label: "Dashboard Shell",
    icon: LayoutDashboard,
    group: "Foundation"
  },
  {
    num: 3,
    slug: "ui-system",
    title: "Reusable UI System",
    label: "Reusable UI System",
    icon: Component,
    group: "Foundation"
  },
  {
    num: 4,
    slug: "kpi-cards",
    title: "Stats & KPI Cards",
    label: "Stats & KPI Cards",
    icon: Gauge,
    group: "Data"
  },
  {
    num: 5,
    slug: "data-table",
    title: "Professional Data Table",
    label: "Professional Data Table",
    icon: Table2,
    group: "Data"
  },
  {
    num: 6,
    slug: "charts",
    title: "Charts & Analytics",
    label: "Charts & Analytics",
    icon: ChartLine,
    group: "Data"
  },
  {
    num: 7,
    slug: "performance",
    title: "Performance Optimization",
    label: "Performance",
    icon: Rocket,
    group: "Polish"
  },
  {
    num: 8,
    slug: "code-splitting",
    title: "Code Splitting",
    label: "Code Splitting",
    icon: Split,
    group: "Polish"
  },
  {
    num: 9,
    slug: "error-boundaries",
    title: "Error Boundaries",
    label: "Error Boundaries",
    icon: ShieldAlert,
    group: "Polish"
  },
  {
    num: 10,
    slug: "ux-states",
    title: "UX States",
    label: "UX States",
    icon: ListChecks,
    group: "Polish"
  },
  {
    num: 11,
    slug: "framer-motion",
    title: "Framer Motion",
    label: "Framer Motion",
    icon: Sparkles,
    group: "Polish"
  },
  {
    num: 12,
    slug: "testing-build",
    title: "Testing & Build",
    label: "Testing & Build",
    icon: TestTube,
    group: "Polish"
  },
  {
    num: 13,
    slug: "deliverable",
    title: "Deliverable",
    label: "Deliverable",
    icon: Boxes,
    group: "Capstone"
  }
];

export const GROUPS = ["Foundation", "Data", "Polish", "Capstone"];
