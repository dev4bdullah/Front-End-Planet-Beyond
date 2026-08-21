import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Card } from "@ui";
import { kpis } from "@shared/data";
import { FadeUp, StaggerList, AnimatedModal, HoverCard, CountUp } from "./components/motion-parts";

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [panel, setPanel] = useState("overview");
  const [items, setItems] = useState([
    { id: 1, label: "Fix nav overlap" },
    { id: 2, label: "Ship the data table" },
    { id: 3, label: "Review Lighthouse score" }
  ]);
  const [nextId, setNextId] = useState(4);
  const [replay, setReplay] = useState(0);
  const reduce = useReducedMotion();

  return (
    <>
      <PageHeader
        number={11}
        title="Framer Motion"
        brief="Add page transitions, modal transitions, hover animations, and subtle dashboard micro-interactions"
        lead="Motion that earns its place: it explains what changed. Everything here respects prefers-reduced-motion."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setReplay(value => value + 1)}>
            Replay animations
          </Button>
        }
      />

      {reduce && (
        <Card className="border-warning-500/40 bg-warning-50 dark:bg-warning-500/10">
          <p className="text-sm font-semibold">Reduced motion is on in your OS</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Every animation on this page has been disabled automatically —{" "}
            <code className="text-2xs font-mono">useReducedMotion()</code> returned true.
            That&apos;s the correct behaviour, not a broken page.
          </p>
        </Card>
      )}

      <Section
        title="Entrance — staggered, not all at once"
        note="Eight elements appearing simultaneously reads as a flicker. Staggering them by 55ms reads as one deliberate movement. The parent orchestrates with staggerChildren; children only declare their own variants."
        code={`const listVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  shown:  { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

<motion.div variants={listVariants} initial="hidden" animate="shown">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>{...}</motion.div>
  ))}
</motion.div>`}
      >
        <div key={replay}>
          <StaggerList
            items={kpis}
            renderItem={kpi => (
              <Card>
                <p className="text-2xs font-bold tracking-wide text-slate-500 uppercase">
                  {kpi.label}
                </p>
                <p className="mt-1.5 text-xl font-bold">
                  <CountUp value={kpi.value} prefix={kpi.prefix ?? ""} suffix={kpi.suffix ?? ""} />
                </p>
              </Card>
            )}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The numbers count up as the cards arrive. Text content can&apos;t be animated by CSS, so
          that one interpolates state with <code className="font-mono">requestAnimationFrame</code>{" "}
          — and cancels the frame on unmount.
        </p>
      </Section>

      <Section
        title="Modal — the exit is the hard part"
        note="AnimatePresence keeps a component mounted long enough to play its exit animation. Without it the modal vanishes instantly on close, which is the single most common motion bug in React."
        code={`<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{    opacity: 0, scale: 0.97, y: 8  }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    />
  )}
</AnimatePresence>`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Watch the close, not the open — that&apos;s what AnimatePresence buys you.
          </span>
        </div>

        <AnimatedModal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm export">
          The backdrop fades and the panel scales down on exit. Remove{" "}
          <code className="text-2xs font-mono">AnimatePresence</code> and both would disappear
          instantly.
        </AnimatedModal>
      </Section>

      <Section
        title="Panel transitions"
        note="mode='wait' makes the outgoing panel finish before the incoming one starts. Without it they overlap and the height jumps. The key is what tells AnimatePresence a swap happened."
        code={`<AnimatePresence mode="wait">
  <motion.div
    key={panel}                          {/* the key IS the trigger */}
    initial={{ opacity: 0, x: 12 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -12 }}
    transition={{ duration: 0.2 }}
  >
    {content[panel]}
  </motion.div>
</AnimatePresence>`}
      >
        <div className="space-y-3">
          <div className="flex gap-1.5">
            {["overview", "revenue", "customers"].map(id => (
              <Button
                key={id}
                size="sm"
                variant={panel === id ? "primary" : "outline"}
                onClick={() => setPanel(id)}
              >
                {id}
              </Button>
            ))}
          </div>

          <div className="min-h-[110px] overflow-hidden rounded-xl border p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={panel}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm font-semibold capitalize">{panel}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {panel === "overview" &&
                    "Every panel swap slides the old one out before the new one arrives."}
                  {panel === "revenue" && "$48,290 this month, 12.4% above last."}
                  {panel === "customers" && "3,412 total, down 2.3% — worth investigating."}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Section>

      <Section
        title="List add and remove"
        note="Items animate out of the list on removal, and the rest reflow rather than snapping upward. layout on each item is what does the reflow — no measuring, no manual heights."
        code={`<AnimatePresence initial={false}>
  {items.map(item => (
    <motion.div
      key={item.id}
      layout                                {/* neighbours slide, not snap */}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    >
      …
    </motion.div>
  ))}
</AnimatePresence>`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                setItems(list => [...list, { id: nextId, label: `New task ${nextId}` }]);
                setNextId(value => value + 1);
              }}
            >
              Add item
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setItems([
                  { id: 1, label: "Fix nav overlap" },
                  { id: 2, label: "Ship the data table" },
                  { id: 3, label: "Review Lighthouse score" }
                ])
              }
            >
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="bg-surface dark:bg-surface-dark flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <span className="flex-1 truncate">{item.label}</span>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setItems(list => list.filter(row => row.id !== item.id))}
                    >
                      Remove
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">All removed — press Reset.</p>
          )}
        </div>
      </Section>

      <Section
        title="Micro-interactions"
        note="whileHover and whileTap need no state and no class toggling, and they clean up after themselves. A spring transition feels physical in a way a duration never does."
        code={`<motion.div
  whileHover={{ y: -4 }}
  whileTap={{ scale: 0.985 }}
  transition={{ type: "spring", stiffness: 380, damping: 26 }}
/>`}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <HoverCard title="Lifts on hover" body="whileHover — no state involved" />
          <HoverCard title="Presses on tap" body="whileTap — works with touch too" />
          <HoverCard title="Spring, not duration" body="stiffness 380, damping 26" />
        </div>
      </Section>

      <Section
        title="Where the route transition lives"
        note="Page transitions belong in the shell, not in each page. Wrapping the Outlet means all thirteen pages animate without any of them knowing about motion."
        code={`// how you'd add it to DashboardShell
import { AnimatePresence, motion } from "framer-motion";
const { pathname } = useLocation();

<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>`}
      >
        <FadeUp>
          <Card className="border-brand-200 bg-brand-50 dark:border-brand-600/40 dark:bg-brand-600/10">
            <p className="text-sm font-semibold">This card used FadeUp on mount</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The same wrapper applied around{" "}
              <code className="text-2xs font-mono">&lt;Outlet /&gt;</code> gives every route the
              same entrance.
            </p>
          </Card>
        </FadeUp>
      </Section>

      <Section
        title="Three rules"
        code={`// 1. Respect the OS setting. Non-negotiable.
const reduce = useReducedMotion();
initial={reduce ? false : { opacity: 0, y: 12 }}

// 2. Animate transform and opacity. Both are GPU-composited.
//    Animating width, height, top or left forces layout on every frame.
✅ { x, y, scale, opacity }        ❌ { width, height, top, left }

// 3. Keep it short. 150–300ms for UI. Anything over 400ms feels sluggish
//    on the fiftieth use, however nice it looked on the first.`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">transform + opacity</Badge>
          <Badge tone="success">150–300ms</Badge>
          <Badge tone="success">useReducedMotion</Badge>
          <Badge tone="danger">animating height</Badge>
          <Badge tone="danger">600ms flourishes</Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rule 2 has one honest exception, used above: the list removal animates{" "}
          <code className="font-mono text-xs">height</code>, because there is no transform that
          collapses a row and reflows its neighbours. Framer&apos;s{" "}
          <code className="font-mono text-xs">layout</code> prop makes that as cheap as it can be.
        </p>
      </Section>
    </>
  );
}
