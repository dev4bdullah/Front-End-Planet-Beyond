import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card } from "@ui";

const TOKEN_GROUPS = [
  {
    name: "Brand",
    tokens: [
      "brand-50",
      "brand-100",
      "brand-300",
      "brand-500",
      "brand-600",
      "brand-700",
      "brand-900"
    ]
  },
  { name: "Success", tokens: ["success-50", "success-500", "success-600", "success-700"] },
  { name: "Warning", tokens: ["warning-50", "warning-500", "warning-600", "warning-700"] },
  { name: "Danger", tokens: ["danger-50", "danger-500", "danger-600", "danger-700"] }
];

export default function Page() {
  return (
    <>
      <PageHeader
        number={1}
        title="Tailwind Dashboard Setup"
        brief="Install and configure Tailwind CSS in the React project with clean design tokens"
        lead="Tailwind v4 is configured in CSS, not JavaScript. Every token below generates its own utility class."
      />

      <Section
        title="Installation"
        note="Tailwind v4 ships as a Vite plugin. There is no tailwind.config.js and no postcss.config.js — a genuine change from v3, and the first thing that trips people coming from older tutorials."
        code={`npm install -D tailwindcss @tailwindcss/vite

// vite.config.js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()]
});

// src/styles/index.css — the whole framework, one line
@import "tailwindcss";`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["v3", "tailwind.config.js + postcss.config.js + 3 @tailwind directives", "neutral"],
            ["v4", "one Vite plugin + one @import", "success"],
            ["Config lives in", "CSS, via @theme", "brand"]
          ].map(([title, body, tone]) => (
            <Card key={title} className="text-sm">
              <div className="flex items-center gap-2">
                <Badge tone={tone}>{title}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Design tokens in @theme"
        note="Every custom property declared in @theme becomes a utility. --color-brand-600 generates bg-brand-600, text-brand-600, border-brand-600, ring-brand-600 and the rest — you don't list them."
        code={`@theme {
  --color-brand-600: #4f46e5;
  --color-success-500: #10b981;

  /* named by role, not by shade */
  --color-surface: #ffffff;
  --color-sunk: #f1f3f9;
  --color-hairline: #e3e7ef;

  --radius-card: 0.875rem;
  --shadow-card: 0 1px 2px rgb(15 18 25 / 4%), 0 8px 24px rgb(15 18 25 / 5%);
  --text-2xs: 0.6875rem;
}`}
      >
        <div className="space-y-3">
          {TOKEN_GROUPS.map(group => (
            <div key={group.name}>
              <p className="text-2xs mb-1.5 font-bold tracking-wide text-slate-500 uppercase">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {group.tokens.map(token => (
                  <div key={token} className="w-[86px]">
                    <div className={`h-9 rounded-lg border bg-${token}`} />
                    <p className="text-2xs mt-1 font-mono text-slate-500">{token}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Surfaces named by role"
        note="bg-surface reads better than bg-white dark:bg-slate-900 repeated in forty components — and when the surface colour changes, it's one edit in @theme instead of forty."
        code={`/* ❌ the colour decision is duplicated everywhere it's used */
<div className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">

/* ✅ the decision lives in @theme; components state intent */
<div className="bg-surface dark:bg-surface-dark">`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-card bg-canvas dark:bg-canvas-dark border p-4 text-center text-xs">
            <p className="font-mono font-semibold">canvas</p>
            <p className="mt-1 text-slate-500">the page behind everything</p>
          </div>
          <div className="rounded-card bg-surface shadow-card dark:bg-surface-dark border p-4 text-center text-xs">
            <p className="font-mono font-semibold">surface</p>
            <p className="mt-1 text-slate-500">cards, modals, the topbar</p>
          </div>
          <div className="rounded-card bg-sunk dark:bg-sunk-dark border p-4 text-center text-xs">
            <p className="font-mono font-semibold">sunk</p>
            <p className="mt-1 text-slate-500">wells, table headers, inputs</p>
          </div>
        </div>
      </Section>

      <Section
        title="Dark mode as a class, not a media query"
        note="@custom-variant redefines what dark: means. Pointing it at a class instead of prefers-color-scheme is what lets the toggle in the topbar override the operating system."
        code={`/* index.css */
@custom-variant dark (&:where(.dark, .dark *));

/* DashboardShell.jsx */
useEffect(() => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("day6.theme", theme);
}, [theme]);`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Use the toggle in the topbar. Every page changes at once, and the choice survives a
          refresh.
        </p>
      </Section>

      <Section
        title="Custom utilities, sparingly"
        note="@utility is for a pattern that would otherwise be a long arbitrary-value class repeated in ten files. Two earn it here; everything else stays as plain utilities."
        code={`@utility scrollbar-slim {
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-thumb {
    background: var(--color-hairline);
    border-radius: 999px;
  }
}

@utility shimmer {
  background: linear-gradient(90deg, var(--color-sunk) 25%, ... 50%, var(--color-sunk) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="shimmer h-9 w-40 rounded-lg" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            <code className="font-mono">shimmer</code> — used by every skeleton in tasks 4, 5 and 10
          </span>
        </div>
      </Section>

      <Section
        title="Keeping class lists readable"
        note="Two rules do most of the work: sort classes automatically, and pull variants into a lookup object instead of chaining ternaries inside className."
        code={`// .prettierrc — sorts every class list on save, so diffs stay small
{ "plugins": ["prettier-plugin-tailwindcss"] }

// variants as data, not as ternaries
const VARIANTS = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  danger:  "bg-danger-600 text-white hover:bg-danger-700"
};

<button className={cx("inline-flex rounded-lg", VARIANTS[variant], SIZES[size])} />`}
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="secondary">
            Secondary
          </Button>
          <Button size="sm" variant="outline">
            Outline
          </Button>
          <Button size="sm" variant="ghost">
            Ghost
          </Button>
          <Button size="sm" variant="danger">
            Danger
          </Button>
          <Button size="sm" variant="success">
            Success
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Six variants, three sizes, from two objects — task 3 covers the full system.
        </p>
      </Section>
    </>
  );
}
