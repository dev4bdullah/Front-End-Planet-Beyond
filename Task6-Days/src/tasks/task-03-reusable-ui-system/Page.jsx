import { useState } from "react";
import { Search, Plus, Trash2, Package } from "lucide-react";
import { PageHeader, Section } from "@shared/Section";
import { Avatar, Badge, Button, Card, EmptyState, Input, Select, Skeleton, Table } from "@ui";

export default function Page() {
  const [value, setValue] = useState("");

  return (
    <>
      <PageHeader
        number={3}
        title="Reusable UI System"
        brief="Create consistent variants for buttons, cards, badges, inputs, tables, and empty states"
        lead="Nine components, every variant rendered. The rule throughout: variants are data, not ternaries."
      />

      <Section
        title="Button — 6 variants × 4 sizes"
        note="Variants live in a lookup object. Adding one is a single line and every consumer gets it; chaining ternaries inside className is what makes a component impossible to extend."
        code={`const VARIANTS = {
  primary:   "bg-brand-600 text-white hover:bg-brand-700 border-transparent",
  secondary: "bg-sunk text-slate-800 hover:bg-hairline border-hairline",
  outline:   "bg-transparent text-slate-700 hover:bg-sunk border-hairline",
  ghost:     "bg-transparent text-slate-600 hover:bg-sunk border-transparent",
  danger:    "bg-danger-600 text-white hover:bg-danger-700 border-transparent",
  success:   "bg-success-600 text-white hover:bg-success-700 border-transparent"
};

const SIZES = { xs: "h-7 px-2 text-2xs", sm: "h-8 px-2.5 text-xs",
                md: "h-9 px-3.5 text-sm", lg: "h-11 px-5 text-sm" };

className={cx("inline-flex items-center rounded-lg border font-semibold",
              VARIANTS[variant], SIZES[size], block && "w-full")}`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {["primary", "secondary", "outline", "ghost", "danger", "success"].map(variant => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {["xs", "sm", "md", "lg"].map(size => (
              <Button key={size} size={size} variant="secondary">
                size {size}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button icon={Plus}>With icon</Button>
            <Button icon={Trash2} variant="danger">
              Delete
            </Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>

          <div className="max-w-xs">
            <Button block variant="outline">
              block
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Card — composed, not configured"
        note="Card.Header takes an actions slot rather than a headerButtons array. The card never needs to know what goes in it, which is why it hasn't needed a new prop since it was written."
        code={`<Card>
  <Card.Header
    title="Inventory"
    subtitle="8 products"
    actions={<Button size="xs">Add</Button>}
  />
  <Card.Body>…</Card.Body>
  <Card.Footer><Button size="sm">Save</Button></Card.Footer>
</Card>`}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <Card.Header
              title="Inventory"
              subtitle="8 products tracked"
              actions={
                <Button size="xs" icon={Plus}>
                  Add
                </Button>
              }
            />
            <Card.Body className="text-sm text-slate-500 dark:text-slate-400">
              A header with a subtitle and an action slot.
            </Card.Body>
            <Card.Footer>
              <Button size="sm">Save</Button>
              <Button size="sm" variant="ghost">
                Cancel
              </Button>
            </Card.Footer>
          </Card>

          <Card className="border-brand-200 bg-brand-50 dark:border-brand-600/40 dark:bg-brand-600/10">
            <Card.Header title="With an override" subtitle="className is appended, not replaced" />
            <Card.Body className="text-sm text-slate-600 dark:text-slate-300">
              Every component here takes <code className="font-mono text-xs">className</code> last,
              so a caller can make a one-off tweak without the component growing a new prop.
            </Card.Body>
          </Card>
        </div>
      </Section>

      <Section
        title="Badge — five tones"
        note="Tones are named for meaning, not colour. STATUS_TONE maps a domain value to a tone once, so the same order status is never green in one table and grey in another."
        code={`// shared/data.js — one mapping, used everywhere
export const STATUS_TONE = {
  paid: "success", shipped: "brand", pending: "warning",
  refunded: "neutral", failed: "danger"
};

<Badge tone={STATUS_TONE[order.status]}>{order.status}</Badge>`}
      >
        <div className="flex flex-wrap gap-2">
          {["brand", "success", "warning", "danger", "neutral"].map(tone => (
            <Badge key={tone} tone={tone}>
              {tone}
            </Badge>
          ))}
          {["brand", "success", "warning", "danger"].map(tone => (
            <Badge key={`${tone}-dot`} tone={tone} dot>
              with dot
            </Badge>
          ))}
        </div>
      </Section>

      <Section
        title="Input and Select"
        note="useId ties the label, the hint and the error together, so several instances on one page can never share an id. The error replaces the hint rather than stacking below it."
        code={`<Input label="Search" icon={Search} placeholder="Type…" />
<Input label="Email" hint="We never share this" />
<Input label="Email" error="That domain looks wrong" />`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Search"
            icon={Search}
            placeholder="Type to filter…"
            value={value}
            onChange={event => setValue(event.target.value)}
          />
          <Input label="Email" type="email" hint="Used for order receipts" />
          <Input label="Email" defaultValue="abdullah@nope" error="That domain looks wrong" />
          <Select
            label="Status"
            placeholder="All statuses"
            options={["Paid", "Pending", "Shipped"]}
          />
          <Select
            label="Category"
            options={[
              { value: "peripherals", label: "Peripherals" },
              { value: "displays", label: "Displays" }
            ]}
          />
          <Input label="Disabled" disabled defaultValue="Read only" />
        </div>
      </Section>

      <Section
        title="Table primitives"
        note="These are presentation only — no sorting, no filtering, no pagination. That logic belongs to task 5's DataTable, which composes these. Keeping them dumb is what lets any table reuse them."
        code={`<Table>
  <Table.Head>
    <Table.HeadCell>Product</Table.HeadCell>
    <Table.HeadCell className="text-right">Price</Table.HeadCell>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Keyboard</Table.Cell>
      <Table.Cell className="text-right tabular-nums">$89</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>`}
      >
        <Card padded={false}>
          <Table>
            <Table.Head>
              <Table.HeadCell>Person</Table.HeadCell>
              <Table.HeadCell>Role</Table.HeadCell>
              <Table.HeadCell className="text-right">Orders</Table.HeadCell>
            </Table.Head>
            <Table.Body>
              {[
                ["Ayesha Raiz", "Frontend", 12],
                ["Sadiq Rehman", "Backend", 8],
                ["Syed Abdullah Ayaz", "Frontend", 15]
              ].map(([name, role, count]) => (
                <Table.Row key={name}>
                  <Table.Cell>
                    <span className="flex items-center gap-2">
                      <Avatar name={name} size="sm" />
                      {name}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-slate-500 dark:text-slate-400">{role}</Table.Cell>
                  <Table.Cell className="text-right tabular-nums">{count}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card>
      </Section>

      <Section
        title="Skeleton, EmptyState, Avatar"
        note="Avatar picks its colour from a hash of the name, so the same person is always the same colour without storing one. Skeleton is aria-hidden — a screen reader shouldn't announce placeholder boxes."
        code={`// deterministic colour, no stored value
const hash = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
className={PALETTE[hash % PALETTE.length]}

<Skeleton className="h-4 w-32" count={3} />
<EmptyState icon={Package} title="No products" action={<Button>Add one</Button>} />`}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <Card>
            <Card.Header title="Skeleton" subtitle="Matches the shape it replaces" />
            <Card.Body className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-full" count={2} />
            </Card.Body>
          </Card>

          <EmptyState
            icon={Package}
            title="No products yet"
            message="Add your first product to see it here."
            action={
              <Button size="sm" icon={Plus}>
                Add product
              </Button>
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["Ayesha Raiz", "Sadiq Rehman", "Syed Abdullah Ayaz", "Attique Ahmed", ""].map(
            (name, index) => (
              <Avatar key={index} name={name} size={index === 2 ? "lg" : "md"} />
            )
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            the last one has no name — falls back to a neutral placeholder
          </span>
        </div>
      </Section>

      <Section
        title="Three rules the whole system follows"
        code={`// 1. variants and sizes are lookup objects
VARIANTS[variant]     // not: variant === "danger" ? "..." : variant === "ghost" ? "..." : "..."

// 2. spread the rest, so any DOM prop works without editing the component
function Button({ children, variant, ...rest }) {
  return <button {...rest}>{children}</button>;
}

// 3. className is appended LAST, so a caller can always override
className={cx("base classes", VARIANTS[variant], className)}`}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rule 3 is the one that matters for Tailwind specifically: later classes in the string win
          for equal specificity, so appending the caller&apos;s{" "}
          <code className="font-mono text-xs">className</code> last is what makes the override
          actually take effect.
        </p>
      </Section>
    </>
  );
}
