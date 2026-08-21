import { PageHeader, Section } from "@shared/Section";
import { Badge, Card, Table } from "@ui";

const SUITES = [
  [
    "Button.test.jsx",
    6,
    "label renders, click fires, disabled and loading block the handler, props spread through, type defaults to button"
  ],
  [
    "Input.test.jsx",
    5,
    "label is associated, ids are unique per instance, error reaches assistive tech, hint hides behind an error"
  ],
  [
    "DataTable.test.jsx",
    11,
    "pagination, search, status filter, numeric sort both directions, selection, bulk action, both empty states"
  ],
  [
    "ErrorBoundary.test.jsx",
    5,
    "children render, a render error is caught, onError fires, recovery works, custom fallback"
  ],
  [
    "StatCard.test.jsx",
    6,
    "value formatting, delta hidden when absent, invertDelta colouring, skeleton shape"
  ]
];

export default function Page() {
  return (
    <>
      <PageHeader
        number={12}
        title="Testing & Build"
        brief="Add basic Vitest/React Testing Library tests, run production build, and fix warnings"
        lead="33 tests across five files, and none of them assert on a class name."
      />

      <Section
        title="Run them"
        code={`npm test           # once, then exit — what CI runs
npm run test:watch # re-runs on save
npm run build      # production bundle
npm run preview    # serve the built bundle to check it before deploying`}
      >
        <pre className="scrollbar-slim text-2xs overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono leading-relaxed text-slate-200">
          {` ✓ src/tasks/task-12-.../tests/DataTable.test.jsx     (11 tests) 1357ms
 ✓ src/tasks/task-12-.../tests/ErrorBoundary.test.jsx  (5 tests)  247ms
 ✓ src/tasks/task-12-.../tests/Button.test.jsx         (6 tests)  288ms
 ✓ src/tasks/task-12-.../tests/StatCard.test.jsx       (6 tests)  105ms
 ✓ src/tasks/task-12-.../tests/Input.test.jsx          (5 tests)  248ms

 Test Files  5 passed (5)
      Tests  33 passed (33)`}
        </pre>
      </Section>

      <Section
        title="What's covered"
        note="The DataTable file is the largest deliberately — it holds the most logic, so it carries the most risk. Coverage follows complexity, not file count."
      >
        <Card padded={false}>
          <Table>
            <Table.Head>
              <Table.HeadCell>File</Table.HeadCell>
              <Table.HeadCell className="w-16 text-right">Tests</Table.HeadCell>
              <Table.HeadCell className="hidden md:table-cell">Covers</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {SUITES.map(([file, count, covers]) => (
                <Table.Row key={file}>
                  <Table.Cell className="font-mono text-xs">{file}</Table.Cell>
                  <Table.Cell className="text-right">
                    <Badge tone="success">{count}</Badge>
                  </Table.Cell>
                  <Table.Cell className="hidden text-xs text-slate-500 md:table-cell dark:text-slate-400">
                    {covers}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </Section>

      <Section
        title="Query by role, not by class"
        note="Not one assertion in these files checks a class name. Restyle every component and the tests still pass; break the disabled state and they fail. That's the difference between testing behaviour and testing implementation."
        code={`// ✅ what a user perceives
screen.getByRole("button", { name: "Save changes" })
screen.getByLabelText("Email address")     // only passes if htmlFor/id match
expect(button).toBeDisabled()
expect(field).toHaveAccessibleDescription("That domain looks wrong")

// ❌ breaks on any refactor, proves nothing about behaviour
container.querySelector(".btn--primary")
expect(wrapper.state().isOpen).toBe(true)`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A useful side effect: <code className="font-mono text-xs">getByLabelText</code> only
          passes if the label and input are genuinely associated, so an accessibility bug fails a
          test rather than shipping quietly.
        </p>
      </Section>

      <Section
        title="The two tests that caught real bugs"
        note="These are the ones worth writing. Both encode a decision that would otherwise be easy to undo by accident."
        code={`// 1. numeric sort — alphabetically, 129 sorts before 89
it("sorts numerically, not alphabetically", async () => {
  await userEvent.click(screen.getByRole("button", { name: /price/i }));
  expect(prices).toEqual(["89", "129", "199", "449"]);
});

// 2. a falling refund rate is GOOD news
it("treats a fall as good when invertDelta is set", () => {
  render(<StatCard delta={-0.6} invertDelta />);
  expect(container.querySelector(".text-success-600")).toBeTruthy();
});`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The second one is the exception to the rule above — it does assert on a class, because the
          colour <em>is</em> the behaviour being tested and there is no accessible name for
          &ldquo;green&rdquo;. Worth being honest about when a rule doesn&apos;t fit.
        </p>
      </Section>

      <Section
        title="jsdom needs three stubs"
        note="Without these, tests fail for reasons that have nothing to do with your code. Every project using charts or animation hits the first one."
        code={`// src/test/setup.js

// recharts' ResponsiveContainer needs this to believe it has a size.
// Without it, charts render 0×0 and every assertion about them fails.
global.ResizeObserver = class {
  observe() {} unobserve() {} disconnect() {}
};

// framer-motion's useReducedMotion calls matchMedia
window.matchMedia = window.matchMedia || (query => ({
  matches: false, media: query,
  addEventListener() {}, removeEventListener() {}
}));

// unmount between tests, or the next query sees the previous test's DOM
afterEach(() => { cleanup(); vi.clearAllMocks(); });`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The <code className="font-mono text-xs">cleanup()</code> in{" "}
          <code className="font-mono text-xs">afterEach</code> is the one that produces the most
          confusing failures when missing — <code className="font-mono text-xs">getByRole</code>{" "}
          starts complaining about multiple matches for no apparent reason.
        </p>
      </Section>

      <Section
        title="Silencing expected console noise"
        note="The ErrorBoundary tests throw on purpose, and React logs every caught error. Spying on console.error keeps the output readable without hiding genuine problems."
        code={`beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();     // restore, or the mock leaks into other files
});`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <code className="font-mono text-xs">restoreAllMocks</code> matters more than it looks —
          without it, a real error in a later test file is silently swallowed.
        </p>
      </Section>

      <Section
        title="The production build"
        note="Two things to check every time: that no warning appears, and that the chunk list looks the way task 8 intended."
        code={`$ npm run build

dist/assets/react-[hash].js      ~180 kB   shared by every page
dist/assets/charts-[hash].js     ~380 kB   only fetched by /charts
dist/assets/motion-[hash].js     ~110 kB   only fetched by /framer-motion
dist/assets/Page-[hash].js       2–14 kB   one per lazy route
dist/assets/index-[hash].css      ~30 kB   the whole stylesheet`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            [
              "No warnings",
              "A chunk size warning means a lazy boundary is missing. Fix it, don't raise the limit."
            ],
            [
              "Preview before deploying",
              "npm run preview serves the built files. Routing and lazy loading behave differently there than in dev."
            ],
            [
              "Check the chunk list",
              "If everything landed in one file, an import somewhere is defeating the split."
            ],
            ["Console clean in preview", "Dev-only warnings disappear; anything left is real."]
          ].map(([title, body]) => (
            <Card key={title}>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Warnings actually fixed in this project"
        code={`1. "Each child in a list should have a unique key"
   → every .map() in the project keys on a stable id, never on the index

2. eslint: '__dirname' is not defined
   → vite.config.js uses import.meta.dirname, and eslint.config.js gives
     config files Node globals rather than browser ones

3. "Warning: An update to X inside a test was not wrapped in act(...)"
   → userEvent already wraps its actions; the fix was awaiting every
     interaction instead of firing it synchronously

4. Chunk size warning on the initial bundle
   → the manualChunks split in task 8, not a raised warning limit`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Point 4 is the one worth resisting. Raising{" "}
          <code className="font-mono text-xs">chunkSizeWarningLimit</code> makes the warning go away
          and leaves the problem in place.
        </p>
      </Section>

      <Section title="What isn't tested, and why that's a choice">
        <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <li>
            <strong className="text-slate-700 dark:text-slate-200">The charts.</strong> An SVG
            rendered by recharts is awkward to assert on and the library is already tested.
            Asserting that the data passed in is correct is the useful part.
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-200">
              Framer Motion animations.
            </strong>{" "}
            Testing that an element ends up at opacity 1 tests the library. Testing that{" "}
            <code className="font-mono text-xs">useReducedMotion</code> is respected would be worth
            it.
          </li>
          <li>
            <strong className="text-slate-700 dark:text-slate-200">The shell layout.</strong> Grid
            behaviour at breakpoints is a visual concern — Playwright screenshots would catch
            regressions there, jsdom cannot.
          </li>
        </ul>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Coverage percentage is a weak target. Five files covering the components that hold real
          logic beats fifty asserting that a div renders.
        </p>
      </Section>
    </>
  );
}
