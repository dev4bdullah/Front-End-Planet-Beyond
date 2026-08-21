import { useEffect, useRef, useState } from "react";
import { PageHeader, Section } from "@shared/Section";
import { getProducts } from "@services";
import { formatPrice } from "@shared/data";

/* Two panels loading the same data — one with cleanup, one without —
   so the difference is visible rather than theoretical. */

function WithoutCleanup({ productId, onLog }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // No AbortController, no active flag. Every switch fires a request, and
    // whichever RESPONSE arrives last wins — not whichever request was newest.
    getProducts({ limit: 1, skip: productId })
      .then(data => {
        setProduct(data.products?.[0] ?? null);
        setLoading(false);
        onLog(`no-cleanup: response for skip=${productId} applied`);
      })
      .catch(() => setLoading(false));
  }, [productId, onLog]);

  return (
    <div className="card card--flat">
      <p className="tiny muted">Without cleanup</p>
      {loading ? (
        <div className="skeleton" style={{ height: "2.2rem" }} />
      ) : (
        <p className="small">
          <strong>{product?.title ?? "—"}</strong>
          {product && <span className="muted"> · {formatPrice(product.price)}</span>}
        </p>
      )}
    </div>
  );
}

function WithCleanup({ productId, onLog }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);

    getProducts({ limit: 1, skip: productId }, { signal: controller.signal })
      .then(data => {
        if (!active) return;
        setProduct(data.products?.[0] ?? null);
        setLoading(false);
        onLog(`cleanup: response for skip=${productId} applied`);
      })
      .catch(error => {
        if (error.name === "AbortError") {
          onLog(`cleanup: request for skip=${productId} aborted`);
          return;
        }
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId, onLog]);

  return (
    <div className="card card--flat">
      <p className="tiny muted">With cleanup</p>
      {loading ? (
        <div className="skeleton" style={{ height: "2.2rem" }} />
      ) : (
        <p className="small">
          <strong>{product?.title ?? "—"}</strong>
          {product && <span className="muted"> · {formatPrice(product.price)}</span>}
        </p>
      )}
    </div>
  );
}

/* An interval that keeps running after unmount if you forget to clear it. */
function Ticker({ onLog }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    onLog("ticker: interval started");
    const id = setInterval(() => setSeconds(value => value + 1), 1000);

    return () => {
      clearInterval(id);
      onLog("ticker: interval cleared");
    };
  }, [onLog]);

  return (
    <div className="card card--flat">
      <p className="tiny muted">Interval with cleanup</p>
      <p className="small">
        Running for <strong>{seconds}s</strong>
      </p>
    </div>
  );
}

export default function Page() {
  const [productId, setProductId] = useState(0);
  const [showTicker, setShowTicker] = useState(true);
  const [log, setLog] = useState([]);

  // Stable identity, so passing it into the effects above doesn't retrigger them
  const logRef = useRef(null);
  if (!logRef.current) {
    logRef.current = message =>
      setLog(list => [`${new Date().toLocaleTimeString()} — ${message}`, ...list].slice(0, 8));
  }

  return (
    <>
      <PageHeader
        number={10}
        title="useEffect & Cleanup"
        brief="Fetch route-based data with useEffect and AbortController cleanup to avoid stale updates"
        lead="The bug this prevents is invisible on a fast connection and constant on a slow one."
        actions={
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setLog([])}>
            Clear log
          </button>
        }
      />

      <Section
        title="Switch quickly and watch the log"
        note="Press the buttons in fast succession. The cleanup panel aborts each superseded request; the other one lets every response land, so the last to ARRIVE wins rather than the last you asked for."
      >
        <div className="row">
          {[0, 3, 6, 9].map(id => (
            <button
              key={id}
              type="button"
              className={`btn btn--sm ${productId === id ? "" : "btn--ghost"}`}
              onClick={() => setProductId(id)}
            >
              Product {id + 1}
            </button>
          ))}
        </div>

        <div className="grid">
          <WithCleanup productId={productId} onLog={logRef.current} />
          <WithoutCleanup productId={productId} onLog={logRef.current} />
        </div>

        <p className="tiny muted">
          Both panels need the network. If the API is unreachable both stay blank — the log still
          shows the aborts, which is the part that matters.
        </p>
      </Section>

      <Section
        title="The pattern"
        note="Two guards, not one. AbortController stops the request; the `active` flag stops a response that already resolved from writing state after unmount."
        code={`useEffect(() => {
  const controller = new AbortController();
  let active = true;

  getProduct(id, { signal: controller.signal })
    .then(data => { if (active) setProduct(data); })
    .catch(error => {
      if (error.name === "AbortError") return;   // not a failure
      if (active) setError(error.message);
    });

  return () => {
    active = false;          // stop any late .then from writing
    controller.abort();      // stop the request itself
  };
}, [id]);                    // ← re-runs when the route param changes`}
      >
        <p className="section__note">
          The dependency array is doing the routing work here. Task 5 showed that changing{" "}
          <code>:id</code> re-renders rather than remounts, so <code>[id]</code> is what makes the
          page refetch at all. An empty <code>[]</code> gives you a detail page permanently stuck on
          the first product.
        </p>
      </Section>

      <Section
        title="Every effect that needs cleanup"
        code={`// timers
useEffect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);

// event listeners
useEffect(() => {
  const onKey = e => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}, []);

// subscriptions
useEffect(() => { const sub = socket.subscribe(topic); return () => sub.unsubscribe(); }, [topic]);

// observers
useEffect(() => { const ro = new ResizeObserver(fn); ro.observe(el); return () => ro.disconnect(); }, []);

// object URLs
useEffect(() => { const url = URL.createObjectURL(file); return () => URL.revokeObjectURL(url); }, [file]);`}
      >
        <div className="stack">
          <div className="row">
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => setShowTicker(value => !value)}
            >
              {showTicker ? "Unmount the ticker" : "Mount the ticker"}
            </button>
            <span className="tiny muted">
              Unmount it and the log shows the interval being cleared — without that line it would
              keep firing forever.
            </span>
          </div>
          {showTicker && <Ticker onLog={logRef.current} />}
        </div>
      </Section>

      <Section title="Event log">
        <pre className="code">
          {log.length ? log.map(line => `> ${line}`).join("\n") : "> nothing yet"}
        </pre>
      </Section>

      <Section
        title="Why the race is worse than it looks"
        note="It isn't only about a flicker. A slow request for product 1 can land after a fast one for product 4, leaving product 1's data on screen while the URL says 4 — and everything downstream reads the wrong record."
        code={`// timeline without cleanup
t=0    click product 1  → request A sent
t=50   click product 4  → request B sent
t=200  response B arrives → shows product 4  ✅
t=900  response A arrives → shows product 1  ❌ URL still says /products/4`}
      >
        <p className="section__note">
          You will almost never see this in development on localhost. It shows up immediately on 3G,
          which is why testing with throttling on is worth the habit.
        </p>
      </Section>

      <Section
        title="StrictMode fires every effect twice"
        note="In development React deliberately mounts, unmounts and remounts each component, so a missing cleanup surfaces immediately. It does not happen in a production build."
        code={`<StrictMode>       // effect runs → cleanup runs → effect runs again
  <App />
</StrictMode>

// If double-firing breaks your component, the cleanup is genuinely wrong.
// Deleting StrictMode to "fix" it hides a real bug.`}
      >
        <p className="section__note">
          This is exactly why the panel above aborts twice on first load — that&apos;s StrictMode
          proving the cleanup works.
        </p>
      </Section>
    </>
  );
}
