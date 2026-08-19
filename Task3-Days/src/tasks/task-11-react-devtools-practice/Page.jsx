import { memo, useState, useCallback, useMemo, useRef, useEffect } from "react";
import { PageHeader, Section } from "@shared/Section";
import { Badge, Button, Input, Card } from "@ui";

/* A counter that survives re-renders, so each child can report how many times
   it has rendered. Deliberately a ref — updating state here would cause the
   very re-render we're measuring. */
function useRenderCount() {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

/* ---------- the memo comparison ---------- */

function PlainChild({ label }) {
  const renders = useRenderCount();
  return (
    <Card variant="flat">
      <Card.Title>Not memoised</Card.Title>
      <Card.Body>
        {label} · rendered <strong>{renders}</strong> times
      </Card.Body>
    </Card>
  );
}

const MemoChild = memo(function MemoChild({ label }) {
  const renders = useRenderCount();
  return (
    <Card variant="flat">
      <Card.Title>
        Memoised <Badge tone="ok">memo</Badge>
      </Card.Title>
      <Card.Body>
        {label} · rendered <strong>{renders}</strong> times
      </Card.Body>
    </Card>
  );
});

/* Same memo, but receiving a prop that changes identity every render */
const MemoWithObject = memo(function MemoWithObject({ config }) {
  const renders = useRenderCount();
  return (
    <Card variant="flat">
      <Card.Title>
        Memoised, unstable prop <Badge tone="bad">broken</Badge>
      </Card.Title>
      <Card.Body>
        mode {config.mode} · rendered <strong>{renders}</strong> times
      </Card.Body>
    </Card>
  );
});

const MemoWithCallback = memo(function MemoWithCallback({ onPing }) {
  const renders = useRenderCount();
  return (
    <Card variant="flat">
      <Card.Title>
        Memoised, stable callback <Badge tone="ok">fixed</Badge>
      </Card.Title>
      <Card.Body>
        rendered <strong>{renders}</strong> times
        <div style={{ marginTop: "0.4rem" }}>
          <Button size="sm" variant="ghost" onClick={onPing}>
            Ping parent
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
});

/* ---------- effect logging ---------- */

function EffectDemo({ topic }) {
  const [log, setLog] = useState([]);

  useEffect(() => {
    setLog(previous => [`subscribed to "${topic}"`, ...previous].slice(0, 4));

    return () => {
      // Cleanup runs before the next effect and on unmount.
      // In StrictMode dev builds this fires an extra time on purpose.
      console.log(`[EffectDemo] cleanup for "${topic}"`);
    };
  }, [topic]);

  return (
    <div className="demo">
      <p className="tiny muted">Effect log (newest first)</p>
      {log.map((entry, index) => (
        <p className="small" key={index}>
          {entry}
        </p>
      ))}
    </div>
  );
}

export default function Page() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("tasks");

  const parentRenders = useRenderCount();

  // Unstable on purpose — a fresh object every render
  const unstableConfig = { mode: "compact" };

  // Stable — same reference until the deps change
  const stableCallback = useCallback(() => setCount(value => value + 1), []);

  const expensiveResult = useMemo(() => {
    let total = 0;
    for (let i = 0; i < 200_000; i++) total += i % 7;
    return total;
  }, []);

  return (
    <>
      <PageHeader
        number={11}
        title="React DevTools Practice"
        brief="Inspect component tree, props, state changes, and re-render behavior in React DevTools"
        lead="Install React Developer Tools first, then work through the five exercises. The render counters make the behaviour visible even without it."
      />

      <Section
        title="Before you start"
        note="Install the React Developer Tools extension for Chrome or Firefox. Two new panels appear in DevTools: Components and Profiler."
      >
        <ul className="list">
          <li className="list__item">
            <strong>Components</strong> — the tree, with props, state and hooks for whatever you
            select
          </li>
          <li className="list__item">
            <strong>Profiler</strong> — record an interaction and see which components re-rendered,
            why, and for how long
          </li>
        </ul>
        <p className="section__note">
          In the Components tab, open the settings gear → General → tick{" "}
          <strong>Highlight updates when components render</strong>. Every re-render then flashes an
          outline on screen. It is the fastest way to spot a component rendering when it
          shouldn&apos;t.
        </p>
      </Section>

      <Section
        title="Exercise 1 — memo, and why it usually doesn't help"
        note="Type in the box. It changes this page's state, so the page re-renders on every keystroke. Watch which children follow."
        code={`const MemoChild = memo(function MemoChild({ label }) { ... });

// ✅ memo works — label is a string, unchanged between renders
<MemoChild label="stable" />

// ❌ memo defeated — a new object literal every render
<MemoWithObject config={{ mode: "compact" }} />

// ✅ fixed — useCallback keeps the reference stable
const onPing = useCallback(() => setCount(c => c + 1), []);
<MemoWithCallback onPing={onPing} />`}
      >
        <div className="stack">
          <Input
            label="Type here to re-render this page"
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="every keystroke is a parent render"
          />

          <p className="small">
            Parent has rendered <strong>{parentRenders}</strong> times
          </p>

          <div className="grid">
            <PlainChild label="stable prop" />
            <MemoChild label="stable prop" />
            <MemoWithObject config={unstableConfig} />
            <MemoWithCallback onPing={stableCallback} />
          </div>

          <p className="tiny muted">
            The first card climbs with every keystroke. The second stays at 1 — memo doing its job.
            The third also climbs, because <code>{"{ mode: 'compact' }"}</code> is a brand-new
            object each render and memo compares by reference. The fourth stays put because{" "}
            <code>useCallback</code> keeps the function identity stable.
          </p>
        </div>
      </Section>

      <Section
        title="Exercise 2 — read state and props in the tree"
        note="Open Components, click this page in the tree, and watch the hooks list on the right as you press the buttons."
      >
        <div className="demo stack">
          <div className="row">
            <Button size="sm" onClick={() => setCount(value => value + 1)}>
              count: {count}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>
          <p className="tiny muted">
            In DevTools the hooks appear in declaration order: State (count), State (text), State
            (topic), then the memo and callback entries. You can edit a state value directly in the
            panel — double-click it and type. That&apos;s the fastest way to test a component in a
            state that&apos;s hard to reach by clicking.
          </p>
        </div>
      </Section>

      <Section
        title="Exercise 3 — the Profiler"
        note="Open Profiler, press record, type a few letters in the box above, then stop. The flamegraph shows exactly which components rendered and how long each took."
      >
        <ul className="list">
          <li className="list__item">Yellow and orange bars are the slower renders</li>
          <li className="list__item">Grey means the component did not re-render at all</li>
          <li className="list__item">
            Tick <strong>Record why each component rendered</strong> in Profiler settings — it names
            the exact prop or hook that caused it
          </li>
          <li className="list__item">
            Compare the two memoised cards above: one appears in every commit, the other
            doesn&apos;t
          </li>
        </ul>
      </Section>

      <Section
        title="Exercise 4 — useMemo for expensive work"
        note="The value below is a 200,000-iteration loop. It runs once at mount and never again, because useMemo has an empty dependency array."
        code={`const expensiveResult = useMemo(() => {
  let total = 0;
  for (let i = 0; i < 200_000; i++) total += i % 7;
  return total;
}, []);`}
      >
        <p className="section__note">
          Result: <strong>{expensiveResult.toLocaleString()}</strong>. Type in the box above — the
          page re-renders constantly and this loop has not run again. Remove the{" "}
          <code>useMemo</code> and it runs on every keystroke.
        </p>
        <p className="section__note">
          Worth being honest: most components don&apos;t need this. Measure in the Profiler first.
          Wrapping everything in <code>memo</code> and <code>useMemo</code> adds its own comparison
          cost and a lot of noise.
        </p>
      </Section>

      <Section
        title="Exercise 5 — effects and cleanup"
        note="Change the topic and watch the console. The cleanup for the old topic runs before the effect for the new one — that ordering is what stops subscriptions leaking."
        code={`useEffect(() => {
  subscribe(topic);
  return () => unsubscribe(topic);   // runs before the next effect, and on unmount
}, [topic]);`}
      >
        <div className="stack">
          <div className="row">
            {["tasks", "users", "products"].map(value => (
              <Button
                key={value}
                size="sm"
                variant={topic === value ? "primary" : "ghost"}
                onClick={() => setTopic(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <EffectDemo topic={topic} />
          <p className="tiny muted">
            In development you&apos;ll see each effect fire twice. That&apos;s StrictMode
            deliberately mounting, unmounting and remounting every component to surface missing
            cleanup. It does not happen in production builds — and if double-firing breaks your
            component, the cleanup is genuinely wrong.
          </p>
        </div>
      </Section>

      <Section title="What to look for in the tree">
        <table className="table">
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Where to look</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>a component re-renders constantly</td>
              <td className="muted">
                Profiler → &quot;why did this render&quot; → usually an unstable object or function
                prop
              </td>
            </tr>
            <tr>
              <td>state isn&apos;t updating</td>
              <td className="muted">
                Components → watch the hook value on click — often a mutation instead of a
                replacement
              </td>
            </tr>
            <tr>
              <td>a list flickers or loses input</td>
              <td className="muted">check the keys — task 9 demonstrates this exactly</td>
            </tr>
            <tr>
              <td>an effect fires too often</td>
              <td className="muted">
                check the dependency array for an object or function recreated each render
              </td>
            </tr>
            <tr>
              <td>props arriving undefined</td>
              <td className="muted">Components → select the child and read its props directly</td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );
}
