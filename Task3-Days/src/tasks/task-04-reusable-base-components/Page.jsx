import { useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Select,
  Skeleton,
  Spinner,
  Textarea
} from "@ui";

export default function Page() {
  const [value, setValue] = useState("");

  return (
    <>
      <PageHeader
        number={4}
        title="Reusable Base Components"
        brief="Build Button, Input, Card, Badge, Avatar, Loader, EmptyState, and ErrorState components"
        lead="Eleven components in one folder, each taking variant and size as props rather than existing as separate files."
      />

      <Section
        title="Button"
        note="Five variants, three sizes, plus block, active and loading — all props on one component. Splitting these into ButtonPrimary, ButtonSmall and ButtonPrimarySmall is how a codebase ends up with thirty near-identical files."
        code={`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button size="sm">Small</Button>
<Button block>Full width</Button>
<Button loading>Saving</Button>
<Button disabled>Disabled</Button>`}
      >
        <div className="demo stack">
          <div className="row">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="row">
            <Button size="sm">Small</Button>
            <Button>Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="row">
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
            <Button active>Active</Button>
          </div>
          <Button block variant="secondary">
            Block
          </Button>
        </div>
      </Section>

      <Section
        title="Input, Textarea, Select"
        note="Each wraps its own label, hint and error. useId generates a unique id so htmlFor and aria-describedby always match, even with several on the page."
        code={`<Input
  label="Email"
  required
  hint="We never share this"
  value={value}
  onChange={e => setValue(e.target.value)}
/>

<Input label="Broken" error="This field is required" />

<Select label="Priority" options={["High", "Medium", "Low"]} />`}
      >
        <div className="demo grid">
          <Input
            label="Email"
            required
            placeholder="you@example.com"
            hint="Used only for notifications"
            value={value}
            onChange={event => setValue(event.target.value)}
          />
          <Input label="With an error" defaultValue="ab" error="Use at least 3 characters." />
          <Select label="Priority" options={["High", "Medium", "Low"]} />
          <Select
            label="Status"
            error="Pick one"
            options={[
              { value: "active", label: "Active" },
              { value: "done", label: "Complete" }
            ]}
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <Textarea label="Notes" rows={3} placeholder="Anything worth recording..." />
          </div>
        </div>
      </Section>

      <Section
        title="Card"
        note="Composition over configuration. Card.Title, Card.Body and Card.Footer take children, so the card never has to know what goes inside it — no footerButtons or titleIcon props."
        code={`<Card variant="raised">
  <Card.Title>Deployment</Card.Title>
  <Card.Body>Last shipped 4 hours ago.</Card.Body>
  <Card.Footer>
    <Button size="sm">Redeploy</Button>
  </Card.Footer>
</Card>`}
      >
        <div className="grid">
          <Card>
            <Card.Title>Default</Card.Title>
            <Card.Body>A plain bordered surface.</Card.Body>
          </Card>
          <Card variant="raised">
            <Card.Title>Raised</Card.Title>
            <Card.Body>Same card, with a shadow.</Card.Body>
            <Card.Footer>
              <Button size="sm">Action</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </Card.Footer>
          </Card>
          <Card variant="flat">
            <Card.Title>Flat</Card.Title>
            <Card.Body>Sits back into the page.</Card.Body>
          </Card>
        </div>
      </Section>

      <Section
        title="Badge and Avatar"
        note="Avatar falls back to initials when there's no image — the common real-world case, and the one most component libraries forget."
        code={`<Badge tone="ok">Complete</Badge>
<Badge tone="bad" solid>Overdue</Badge>

<Avatar name="Syed Abdullah Ayaz" />   // renders SA
<Avatar name="Ayesha Raiz" size="lg" square />`}
      >
        <div className="demo stack">
          <div className="row">
            <Badge>Default</Badge>
            <Badge tone="ok">Complete</Badge>
            <Badge tone="warn">Pending</Badge>
            <Badge tone="bad">Overdue</Badge>
            <Badge tone="neutral">Archived</Badge>
            <Badge solid>Solid</Badge>
          </div>
          <div className="row">
            <Avatar name="Syed Abdullah Ayaz" size="sm" />
            <Avatar name="Ayesha Raiz" />
            <Avatar name="Sadiq Rehman" size="lg" />
            <Avatar name="Attique Ahmed" square />
            <span className="tiny muted">no image — initials generated from the name</span>
          </div>
        </div>
      </Section>

      <Section
        title="Spinner and Skeleton"
        note="Use a spinner when you don't know the shape of what's coming, and a skeleton when you do — a skeleton that matches the layout stops the page jumping when real content arrives."
        code={`<Spinner size="sm" />
<Skeleton height="2rem" />
<Skeleton count={3} />
<Skeleton width="60%" />`}
      >
        <div className="demo grid">
          <div className="row">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
          </div>
          <div>
            <Skeleton height="1.6rem" width="55%" />
            <div style={{ height: "0.5rem" }} />
            <Skeleton count={3} />
          </div>
        </div>
      </Section>

      <Section
        title="EmptyState and ErrorState"
        note="These are genuinely different states and deserve different components. 'No results' is a normal outcome; 'request failed' means something broke. Merging them tells a user their data is missing when it simply isn't there."
        code={`<EmptyState
  title="No tasks yet"
  message="Create one to get started."
  action={<Button size="sm">New task</Button>}
/>

<ErrorState message="Server responded with 500" onRetry={reload} />`}
      >
        <div className="grid">
          <EmptyState
            title="No tasks yet"
            message="Create your first one to get started."
            action={<Button size="sm">New task</Button>}
          />
          <ErrorState
            message="Server responded with 500."
            onRetry={() => alert("retry would refetch here")}
          />
        </div>
      </Section>

      <Section
        title="The three rules these all follow"
        code={`// 1. variant and size are props, never separate components
<Button variant="danger" size="sm" />

// 2. spread the rest, so any DOM prop passes through
function Button({ children, variant, ...rest }) {
  return <button {...rest}>{children}</button>;
}
<Button onClick={fn} aria-label="Close" data-testid="x" />  // all work

// 3. children over configuration props
<Card.Footer><Button /></Card.Footer>   // ✅
<Card footerButtons={[...]} />          // ❌ card now knows about buttons`}
      >
        <p className="section__note">
          The <code>...rest</code> spread is the one that saves the most time. Without it, every new
          need — an <code>aria-label</code>, a <code>data-testid</code>, an{" "}
          <code>onMouseEnter</code> — means editing the component. With it, the component never
          needs to change.
        </p>
      </Section>
    </>
  );
}
