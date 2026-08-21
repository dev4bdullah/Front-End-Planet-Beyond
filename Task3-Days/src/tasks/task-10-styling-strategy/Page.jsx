import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card } from "@ui";
import { Switch } from "@interactive";
import { cx } from "@shared/cx";

const tokens = [
  ["--brand", "primary actions, focus rings, active states"],
  ["--surface", "cards, modals, inputs — anything raised off the page"],
  ["--sunk", "wells and flat cards — anything pressed into the page"],
  ["--line", "every border on the page"],
  ["--muted", "secondary text, labels, hints"],
  ["--space-sm", "the base spacing step; md, lg and xl derive from it"],
  ["--radius", "the default corner; sm and lg sit either side"]
];

export default function Page({ theme, onThemeChange }) {
  return (
    <>
      <PageHeader
        number={10}
        title="Styling Strategy"
        brief="Use one consistent styling approach: CSS Modules, plain CSS utilities, or Tailwind CSS"
        lead="One approach, chosen deliberately: plain CSS with custom properties and BEM naming. The choice matters more than which one you pick."
      />

      <Section
        title="The decision"
        note="Every option below works. What doesn't work is using three of them in the same codebase, which is what happens by accident when nobody decides up front."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Approach</th>
              <th>Good at</th>
              <th>Costs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Plain CSS + custom properties</strong> <Badge tone="ok">used here</Badge>
              </td>
              <td className="muted">no build step, themes for free, transferable knowledge</td>
              <td className="muted">naming discipline is on you</td>
            </tr>
            <tr>
              <td>
                <strong>CSS Modules</strong>
              </td>
              <td className="muted">scoped by default, no naming collisions possible</td>
              <td className="muted">a file per component, awkward for global themes</td>
            </tr>
            <tr>
              <td>
                <strong>Tailwind</strong>
              </td>
              <td className="muted">very fast to write, no naming at all, tiny output</td>
              <td className="muted">dense markup, a build step, a real learning curve</td>
            </tr>
            <tr>
              <td>
                <strong>CSS-in-JS</strong>
              </td>
              <td className="muted">props can drive styles directly</td>
              <td className="muted">runtime cost, and it fights React Server Components</td>
            </tr>
          </tbody>
        </table>

        <p className="section__note">
          Plain CSS was chosen here for one specific reason: the dark theme. It&apos;s a single
          class that overrides seven variables. In CSS Modules or CSS-in-JS the same feature needs a
          theme provider and prop threading.
        </p>
      </Section>

      <Section
        title="Design tokens"
        note="Every colour, space and radius is declared once on :root. Nothing in this project uses a raw hex value or a magic pixel number."
        code={`:root {
  --brand: #4f46e5;
  --surface: #ffffff;
  --space-sm: 0.7rem;
  --space-md: calc(var(--space-sm) * 1.5);   /* derived, stays proportional */
  --radius: 10px;
}

.card {
  background: var(--surface);
  padding: var(--space-sm);
  border-radius: var(--radius);
}`}
      >
        <table className="table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Used for</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map(([name, use]) => (
              <tr key={name}>
                <td>
                  <code>{name}</code>
                </td>
                <td className="muted">{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="The dark theme is one class"
        note="No second stylesheet, no duplicated rules, no prefers-color-scheme branches scattered through the file. One class on <body> redefines the tokens and every component follows."
        code={`.theme-dark {
  --bg: #0e1015;
  --surface: #181c25;
  --fg: #e6e8ee;
  --line: #29303e;
}

// in App.jsx
document.body.className = theme === "dark" ? "theme-dark" : "";`}
      >
        <div className="demo stack">
          <Switch
            checked={theme === "dark"}
            onChange={value => onThemeChange(value ? "dark" : "light")}
            label="Dark theme"
          />
          <p className="tiny muted">
            Flip it and watch every component on every page change at once. Not one of them contains
            a colour value.
          </p>
          <div className="grid">
            <Card variant="raised">
              <Card.Title>Raised surface</Card.Title>
              <Card.Body>Uses --surface and --shadow.</Card.Body>
            </Card>
            <Card variant="flat">
              <Card.Title>Flat surface</Card.Title>
              <Card.Body>Uses --sunk.</Card.Body>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        title="BEM naming"
        note="block__element--modifier. The point isn't the syntax — it's that a class name tells you where it belongs and what it modifies, so nothing needs nesting or !important to win a specificity fight."
        code={`.card             { }   /* block    — a standalone thing        */
.card__title      { }   /* element  — a part of the block       */
.card__footer     { }
.card--raised     { }   /* modifier — a variation of the block  */

/* every selector is one class, so specificity is always 0,1,0 */`}
      >
        <div className="demo">
          <pre className="code code--inline">{`.btn              base
.btn--secondary   variant
.btn--danger      variant
.btn--sm          size
.btn--block       layout
.btn--active      state

<Button variant="danger" size="sm" />
  →  class="btn btn--danger btn--sm"`}</pre>
          <div className="row" style={{ marginTop: "0.6rem" }}>
            <span className={cx("btn", "btn--sm")}>btn btn--sm</span>
            <span className={cx("btn", "btn--danger", "btn--sm")}>btn btn--danger btn--sm</span>
            <span className={cx("btn", "btn--ghost", "btn--sm")}>btn btn--ghost btn--sm</span>
          </div>
        </div>
      </Section>

      <Section
        title="Building the class list"
        note="cx() from task 3, used by every component. Falsy values drop out, so conditional classes never leave stray spaces or the literal word 'false' in the attribute."
        code={`className={cx(
  "btn",
  variant !== "primary" && \`btn--\${variant}\`,
  size !== "md" && \`btn--\${size}\`,
  block && "btn--block",
  className                       // caller can always add their own
)}`}
      >
        <p className="section__note">
          Notice the last line. Every component here accepts a <code>className</code> prop and
          appends it, so a caller can add a one-off tweak without the component needing a new prop.
        </p>
      </Section>

      <Section
        title="Rules this stylesheet follows"
        code={`/* ✅ one class, specificity 0,1,0 */
.card__title { font-weight: 700; }

/* ❌ nesting raises specificity and couples the two */
.card .title h3 { font-weight: 700; }

/* ❌ if you need this, something above is too specific */
.title { font-weight: 700 !important; }`}
      >
        <ul className="list">
          <li className="list__item">
            Every selector is a single class — no ids, no element selectors, no nesting
          </li>
          <li className="list__item">
            Not one <code>!important</code> in 1,000 lines
          </li>
          <li className="list__item">
            No hard-coded colours outside <code>:root</code>
          </li>
          <li className="list__item">
            Spacing comes from the scale, never from arbitrary pixel values
          </li>
          <li className="list__item">
            <code>prefers-reduced-motion</code> disables every animation at the bottom of the file
          </li>
        </ul>
      </Section>

      <Section title="If you were using Tailwind instead">
        <div className="grid">
          <div className="demo">
            <p className="tiny muted">This project</p>
            <pre className="code code--inline">{`<button className="btn btn--danger btn--sm">
  Delete
</button>

.btn--danger { background: var(--bad); }`}</pre>
          </div>
          <div className="demo">
            <p className="tiny muted">Tailwind</p>
            <pre className="code code--inline">{`<button className="px-3 py-1.5 text-sm
  font-semibold rounded-md bg-red-600
  text-white hover:bg-red-700">
  Delete
</button>`}</pre>
          </div>
        </div>
        <p className="section__note">
          Neither is wrong. Tailwind trades a stylesheet for denser markup and removes naming
          entirely; this approach keeps the markup readable and puts the discipline in the class
          names. Pick one and hold to it — the failure mode is doing both.
        </p>
      </Section>
    </>
  );
}
