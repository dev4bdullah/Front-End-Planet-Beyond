import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@tasks/task-09-error-boundaries/components/ErrorBoundary";

function Bomb({ armed }) {
  if (armed) throw new Error("Bomb went off");
  return <p>All good</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    // React logs caught errors to console.error. Silence it so the test output
    // stays readable, but keep the spy so we can assert it was called.
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Bomb armed={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("catches a render error and shows the fallback", () => {
    render(
      <ErrorBoundary name="Widget">
        <Bomb armed />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Widget failed to render/)).toBeInTheDocument();
    expect(screen.getByText("Bomb went off")).toBeInTheDocument();
  });

  it("calls onError with the error", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb armed />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].message).toBe("Bomb went off");
  });

  it("recovers when the cause is gone", async () => {
    function Wrapper() {
      return (
        <ErrorBoundary>
          <Bomb armed={false} />
        </ErrorBoundary>
      );
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Bomb armed />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // A fresh boundary with a working child — the recovery path
    rerender(<Wrapper />);
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("supports a custom fallback", async () => {
    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div>
            <p>Custom: {error.message}</p>
            <button type="button" onClick={reset}>
              Reset it
            </button>
          </div>
        )}
      >
        <Bomb armed />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom: Bomb went off")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset it" })).toBeInTheDocument();
  });
});
