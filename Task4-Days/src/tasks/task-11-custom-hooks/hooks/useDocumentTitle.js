import { useEffect } from "react";

/* Nothing updates the tab title in a single-page app, so every tab says the
   same thing and browser history becomes useless. The cleanup restores the
   previous title rather than assuming a default. */

export function useDocumentTitle(title, suffix = "Router Shop") {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${suffix}` : suffix;

    return () => {
      document.title = previous;
    };
  }, [title, suffix]);
}
