import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Button, Card } from "@ui";

/* Task 11 — the four kinds of motion a dashboard actually needs.
   Every one of them checks useReducedMotion, because animation that can't be
   turned off is an accessibility problem, not a flourish. */

export function FadeUp({ children, delay = 0 }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Staggering children reads as one intentional movement rather than eight
   separate ones. The parent orchestrates; children only declare their variants. */
const listVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.055 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
};

export function StaggerList({ items, renderItem }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      variants={listVariants}
      initial={reduce ? "shown" : "hidden"}
      animate="shown"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(item => (
        <motion.div key={item.id ?? item.label} variants={itemVariants}>
          {renderItem(item)}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function AnimatedModal({ open, onClose, title, children }) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="rounded-card bg-surface shadow-pop dark:bg-surface-dark relative w-[min(100%,420px)] border p-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">{title}</h3>
              <Button variant="ghost" size="xs" onClick={onClose} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">{children}</div>
            <div className="mt-4 flex justify-end">
              <Button size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* whileHover and whileTap are the cheapest win in the library — no state,
   no class toggling, and they clean up after themselves. */
export function HoverCard({ title, body }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <Card className="cursor-pointer">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{body}</p>
      </Card>
    </motion.div>
  );
}

/* Text content can't be animated by a CSS transition, so the number is
   interpolated in state with requestAnimationFrame. The cleanup cancels the
   frame — without it, a component that unmounts mid-count keeps calling
   setState on an unmounted tree. */
export function CountUp({ value, prefix = "", suffix = "", duration = 0.9 }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return undefined;
    }

    const start = performance.now();
    let frame;

    const tick = now => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      // easeOutCubic, so it decelerates instead of stopping dead
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduce]);

  return (
    <span className="tabular-nums">
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
