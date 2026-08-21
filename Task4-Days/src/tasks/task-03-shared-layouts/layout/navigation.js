/* One list drives the sidebar, the topbar title and the router.
   `title` is the full task name from the sheet, `label` is the short form
   for the rail — keeping both here means they can never disagree. */

export const NAV = [
  {
    num: 1,
    slug: "router-setup",
    title: "React Router Setup",
    label: "Router Setup",
    group: "Routing"
  },
  { num: 2, slug: "base-pages", title: "Base Pages", label: "Base Pages", group: "Routing" },
  {
    num: 3,
    slug: "shared-layouts",
    title: "Shared Layouts",
    label: "Shared Layouts",
    group: "Routing"
  },
  {
    num: 4,
    slug: "nested-routes",
    title: "Nested Routes",
    label: "Nested Routes",
    group: "Routing"
  },
  {
    num: 5,
    slug: "dynamic-routes",
    title: "Dynamic Routes",
    label: "Dynamic Routes",
    group: "Routing"
  },
  {
    num: 6,
    slug: "url-search-params",
    title: "URL Search Params",
    label: "URL Search Params",
    group: "URL state"
  },
  {
    num: 7,
    slug: "outlet-context",
    title: "Outlet Context",
    label: "Outlet Context",
    group: "URL state"
  },
  {
    num: 8,
    slug: "navigation-ux",
    title: "Navigation UX",
    label: "Navigation UX",
    group: "URL state"
  },
  {
    num: 9,
    slug: "api-service-layer",
    title: "API Service Layer",
    label: "API Service Layer",
    group: "Data"
  },
  {
    num: 10,
    slug: "useeffect-cleanup",
    title: "useEffect & Cleanup",
    label: "useEffect & Cleanup",
    group: "Data"
  },
  { num: 11, slug: "custom-hooks", title: "Custom Hooks", label: "Custom Hooks", group: "Data" },
  { num: 12, slug: "deliverable", title: "Deliverable", label: "Deliverable", group: "Capstone" }
];

export const GROUPS = ["Routing", "URL state", "Data", "Capstone"];
