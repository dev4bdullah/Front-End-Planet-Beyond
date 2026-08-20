import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@ui";

/* Error boundaries have to be class components — there is still no hook
   equivalent of componentDidCatch.

   What they catch: errors thrown while rendering, in lifecycle methods, and in
   constructors of the tree below them.
   What they do NOT catch: event handlers, setTimeout callbacks, async code, and
   errors thrown in the boundary itself. Those need try/catch. */

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, count: 0 };
  }

  // Runs during render — return the new state, no side effects allowed here
  static getDerivedStateFromError(error) {
    return { error };
  }

  // Runs after the commit — the place for logging
  componentDidCatch(error, info) {
    console.error(`[ErrorBoundary${this.props.name ? `: ${this.props.name}` : ""}]`, error);
    console.error("Component stack:", info.componentStack);
    this.props.onError?.(error, info);
  }

  reset = () => {
    this.setState(previous => ({ error: null, count: previous.count + 1 }));
  };

  render() {
    const { error } = this.state;
    const { children, fallback, name, level = "section" } = this.props;

    if (!error) {
      // The key forces a fresh subtree on reset, so a component that crashed
      // during mount gets a genuine second attempt rather than its broken state.
      return <div key={this.state.count}>{children}</div>;
    }

    if (fallback) return fallback({ error, reset: this.reset });

    const isPage = level === "page";

    return (
      <div
        role="alert"
        className={`rounded-card border-danger-500/40 bg-danger-50 dark:bg-danger-500/10 border p-4 ${
          isPage ? "py-10 text-center" : ""
        }`}
      >
        <div className={`flex gap-3 ${isPage ? "flex-col items-center" : "items-start"}`}>
          <span className="bg-danger-500/15 text-danger-600 grid size-9 shrink-0 place-items-center rounded-full">
            <AlertTriangle className="size-4.5" aria-hidden="true" />
          </span>

          <div className={isPage ? "space-y-1" : "min-w-0 space-y-1"}>
            <p className="text-danger-700 dark:text-danger-500 text-sm font-bold">
              {isPage ? "This page failed to load" : `${name ?? "This section"} failed to render`}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isPage
                ? "The rest of the dashboard is still working — use the sidebar to go elsewhere."
                : "Everything else on this page is unaffected."}
            </p>
            <p className="text-2xs font-mono break-words text-slate-500 dark:text-slate-400">
              {error.message}
            </p>

            <div className="pt-1.5">
              <Button size="sm" variant="danger" icon={RefreshCw} onClick={this.reset}>
                Try again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
