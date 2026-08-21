import { PageHeader, Section } from "@shared/Section";
import { Badge } from "@ui";

const folders = [
  ["shared/", "used by more than one task — layout wrappers, cx helper, sample data"],
  ["styles/", "one stylesheet, design tokens at the top (task 10 owns this)"],
  ["tasks/", "one folder per sheet row, each self-contained"],
  ["tasks/task-04.../ui/", "the eleven base components, aliased to @ui"],
  ["tasks/task-05.../ui/", "the six interactive components, aliased to @interactive"],
  ["tasks/task-08.../forms/", "three forms plus the useForm hook they share"],
  ["tasks/task-12.../hooks/", "custom hooks used only by the deliverable"]
];

export default function Page() {
  return (
    <>
      <PageHeader
        number={2}
        title="React Folder Structure"
        brief="Create components, pages, layouts, hooks, services, utils, constants, and assets folders"
        lead="Organised by feature rather than by file type — each task folder holds everything that task needs."
      />

      <Section
        title="The tree"
        note="Every folder you're clicking through in the sidebar is a real directory under src/tasks."
      >
        <pre className="code">{`src/
├── main.jsx                    entry point — mounts <App />
├── App.jsx                     sidebar nav + renders the selected task
├── shared/                     used by more than one task
│   ├── Section.jsx             PageHeader + Section wrappers
│   ├── cx.js                   className helper
│   └── data.js                 sample team / task / product data
├── styles/
│   └── index.css               design tokens + every BEM block
└── tasks/
    ├── task-01-react-vite-setup/
    ├── task-02-react-folder-structure/
    ├── task-03-jsx-fundamentals/
    ├── task-04-reusable-base-components/
    │   ├── Page.jsx
    │   └── ui/                 Button, Input, Select, Card, Badge...
    ├── task-05-interactive-components/
    │   ├── Page.jsx
    │   └── ui/                 Modal, Tabs, Accordion, Dropdown...
    ├── task-06-props-and-composition/
    ├── task-07-state-management-basics/
    ├── task-08-controlled-forms/
    │   ├── Page.jsx
    │   ├── useForm.js
    │   └── forms/              Login, Profile, Product
    ├── task-09-list-rendering/
    ├── task-10-styling-strategy/
    ├── task-11-react-devtools-practice/
    └── task-12-deliverable/
        ├── Page.jsx
        ├── components/
        └── hooks/`}</pre>
      </Section>

      <Section title="What lives where">
        <table className="table">
          <thead>
            <tr>
              <th>Folder</th>
              <th>Holds</th>
            </tr>
          </thead>
          <tbody>
            {folders.map(([name, purpose]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td className="muted">{purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Feature-first, not type-first"
        note="The common alternative groups by file type: all components together, all hooks together, all styles together. That reads well on day one and badly by month three."
      >
        <div className="grid">
          <div className="demo">
            <p className="small">
              <strong>Type-first</strong> <Badge tone="warn">harder to change</Badge>
            </p>
            <pre className="code code--inline">{`components/
  TaskCard.jsx
  ProductCard.jsx
  LoginForm.jsx
hooks/
  useTasks.js
  useProducts.js
styles/
  taskCard.css
  productCard.css`}</pre>
            <p className="tiny muted" style={{ marginTop: "0.5rem" }}>
              Deleting the product feature means hunting through four folders.
            </p>
          </div>

          <div className="demo">
            <p className="small">
              <strong>Feature-first</strong> <Badge tone="ok">used here</Badge>
            </p>
            <pre className="code code--inline">{`tasks/
  TaskCard.jsx
  useTasks.js
products/
  ProductCard.jsx
  useProducts.js
auth/
  LoginForm.jsx`}</pre>
            <p className="tiny muted" style={{ marginTop: "0.5rem" }}>
              Deleting the product feature is deleting one folder.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Barrel files"
        note="Each ui/ folder has an index.js re-exporting everything, so a page imports once instead of eleven times."
        code={`// ui/index.js
export { default as Button } from "./Button";
export { default as Input } from "./Input";
export { default as Card } from "./Card";

// then anywhere:
import { Button, Input, Card } from "@ui";`}
      >
        <p className="section__note">
          Worth knowing the trade-off: a barrel means importing one component pulls the whole file
          into the module graph. Vite tree-shakes it away in production, but in a very large app
          barrels can slow the dev server. At this size they&apos;re clearly worth it.
        </p>
      </Section>
    </>
  );
}
