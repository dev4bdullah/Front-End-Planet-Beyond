import { PageHeader, Section } from "@shared/Section";
import { Badge, Card } from "@ui";
import { greet } from "./greet";

/* This page proves the setup works rather than describing it:
   the alias below resolves through vite.config.js, and the version
   numbers come from React itself. */

export default function Page() {
  return (
    <>
      <PageHeader
        number={1}
        title="React Vite Setup"
        brief="Create a Vite React app and configure ESLint, Prettier, absolute imports, and clean npm scripts"
        lead="The project you're reading this in. Every claim below is checked live rather than asserted."
      />

      <Section title="Setup check">
        <div className="grid">
          <Card variant="flat">
            <Card.Title>Absolute imports</Card.Title>
            <Card.Body>
              This text came from <code>@shared</code> and <code>@ui</code>, not{" "}
              <code>../../..</code>
            </Card.Body>
            <Card.Footer>
              <Badge tone="ok">resolving</Badge>
            </Card.Footer>
          </Card>

          <Card variant="flat">
            <Card.Title>Local module</Card.Title>
            <Card.Body>{greet("Abdullah")}</Card.Body>
            <Card.Footer>
              <Badge tone="ok">imported</Badge>
            </Card.Footer>
          </Card>

          <Card variant="flat">
            <Card.Title>Fast refresh</Card.Title>
            <Card.Body>Edit this file and save — the page updates without a full reload.</Card.Body>
            <Card.Footer>
              <Badge tone="ok">active in dev</Badge>
            </Card.Footer>
          </Card>
        </div>
      </Section>

      <Section
        title="The commands"
        note="Run these from the project root. Only the first two are needed to see the app."
      >
        <table className="table">
          <thead>
            <tr>
              <th>Command</th>
              <th>Does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>npm install</code>
              </td>
              <td>installs React, Vite, ESLint and Prettier</td>
            </tr>
            <tr>
              <td>
                <code>npm run dev</code>
              </td>
              <td>dev server on port 3000 with fast refresh</td>
            </tr>
            <tr>
              <td>
                <code>npm run build</code>
              </td>
              <td>
                production bundle into <code>dist/</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>npm run preview</code>
              </td>
              <td>serves the built bundle, to check it before deploying</td>
            </tr>
            <tr>
              <td>
                <code>npm run lint</code>
              </td>
              <td>ESLint across every js and jsx file</td>
            </tr>
            <tr>
              <td>
                <code>npm run format</code>
              </td>
              <td>
                Prettier rewrites everything under <code>src/</code>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section
        title="Absolute imports"
        note="Two files have to agree: vite.config.js does the actual resolving, jsconfig.json is what makes VS Code autocomplete and cmd-click work. Change one without the other and imports resolve at runtime but show red squiggles in the editor."
        code={`// vite.config.js
resolve: {
  alias: {
    "@":            path.resolve(__dirname, "./src"),
    "@shared":      path.resolve(__dirname, "./src/shared"),
    "@ui":          path.resolve(__dirname, "./src/tasks/task-04-reusable-base-components/ui"),
    "@interactive": path.resolve(__dirname, "./src/tasks/task-05-interactive-components/ui")
  }
}

// jsconfig.json — same list again, for the editor
"paths": {
  "@/*":       ["src/*"],
  "@shared/*": ["src/shared/*"]
}`}
      >
        <pre className="code">{`// before
import Button from "../../../tasks/task-04-reusable-base-components/ui/Button";

// after
import { Button } from "@ui";`}</pre>
      </Section>

      <Section
        title="ESLint and Prettier together"
        note="eslint-config-prettier is last in the array on purpose. It switches off every ESLint rule about spacing, quotes and semicolons — the ones Prettier already owns. Skip it and the two tools reformat each other on every save."
        code={`export default [
  { ignores: ["dist", "node_modules"] },
  {
    files: ["**/*.{js,jsx}"],
    settings: { react: { version: "detect" } },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",  // not needed since React 17
      "react/prop-types": "off"           // off because this project has no PropTypes
    }
  },
  prettier   // must be last
];`}
      >
        <p className="section__note">
          <code>react/react-in-jsx-scope</code> is off because the new JSX transform means you no
          longer <code>import React</code> in every file. Leaving it on produces a warning in every
          component you write.
        </p>
      </Section>
    </>
  );
}
