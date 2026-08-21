import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppState } from "react-native";

/* Task 10 — foreground/background, and the transition that matters.

   Four states exist but only three are real:
     active     — on screen and receiving input
     background — not visible
     inactive   — iOS only, a brief in-between during a call, the app
                  switcher, or a system dialog. NOT the same as background.

   Treating `inactive` as `background` makes an app pause every time a
   notification banner slides down, which users notice. */

export function useAppState({ onForeground, onBackground } = {}) {
  const [state, setState] = useState(AppState.currentState);
  const previous = useRef(AppState.currentState);
  const [counts, setCounts] = useState({ foregrounded: 0, backgrounded: 0 });

  /* Callbacks in refs, so passing an inline arrow doesn't resubscribe on
     every render. */
  const onForegroundRef = useRef(onForeground);
  const onBackgroundRef = useRef(onBackground);

  // Written from a layout effect — assigning a ref during render isn't
  // allowed, and layout effects run before the subscription effect below.
  useLayoutEffect(() => {
    onForegroundRef.current = onForeground;
    onBackgroundRef.current = onBackground;
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", next => {
      const wasBackground = previous.current.match(/inactive|background/);

      if (wasBackground && next === "active") {
        setCounts(current => ({ ...current, foregrounded: current.foregrounded + 1 }));
        onForegroundRef.current?.();
      } else if (previous.current === "active" && next.match(/inactive|background/)) {
        setCounts(current => ({ ...current, backgrounded: current.backgrounded + 1 }));
        onBackgroundRef.current?.();
      }

      previous.current = next;
      setState(next);
    });

    // remove(), not removeEventListener — the old API was removed in RN 0.65+
    return () => subscription.remove();
  }, []);

  // `previous` deliberately isn't returned — reading a ref during render
  // is what the transition logic above exists to avoid.
  return { state, counts };
}
