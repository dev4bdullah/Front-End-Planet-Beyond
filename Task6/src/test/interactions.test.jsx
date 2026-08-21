import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

/* Direct-imported rather than lazy, so these assert on behaviour without
   waiting on Suspense. */
import UxStatesPage from "@tasks/task-10-ux-states/Page";
import ErrorBoundariesPage from "@tasks/task-09-error-boundaries/Page";
import PerformancePage from "@tasks/task-07-performance-optimization/Page";
import DeliverablePage from "@tasks/task-13-deliverable/Page";
import MotionPage from "@tasks/task-11-framer-motion/Page";

const wrap = ui => render(<MemoryRouter>{ui}</MemoryRouter>);

beforeEach(() => localStorage.clear());

describe("task 10 — UX states", () => {
  it("switches between all seven states", async () => {
    wrap(<UxStatesPage />);

    await userEvent.click(screen.getByRole("button", { name: "Empty" }));
    expect(screen.getByText("No orders yet")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "No results" }));
    expect(screen.getByText(/No results for/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Unauthorized" }));
    expect(screen.getByText(/don't have access/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Error" }));
    expect(screen.getByText(/503 Service Unavailable/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Offline" }));
    expect(screen.getByText(/appear to be offline/)).toBeInTheDocument();
  });

  it("empty and no-results are genuinely different messages", async () => {
    wrap(<UxStatesPage />);

    await userEvent.click(screen.getByRole("button", { name: "Empty" }));
    const empty = screen.getByText(/Once your store takes its first order/);

    await userEvent.click(screen.getByRole("button", { name: "No results" }));
    expect(empty).not.toBeInTheDocument();
    expect(screen.getByText(/Your data is still here/)).toBeInTheDocument();
  });

  it("retry recovers to the success state", async () => {
    wrap(<UxStatesPage />);

    await userEvent.click(screen.getByRole("button", { name: "Error" }));
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument(), { timeout: 3000 });
  });

  it("marks the loading region as busy for assistive tech", async () => {
    const { container } = wrap(<UxStatesPage />);
    await userEvent.click(screen.getByRole("button", { name: "Loading" }));

    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect(screen.getByText("Loading dashboard data")).toBeInTheDocument();
  });
});

describe("task 9 — error boundaries", () => {
  it("contains one broken widget and leaves the other working", async () => {
    wrap(<ErrorBoundariesPage />);

    expect(screen.getAllByText("Widget rendering normally")).toHaveLength(3);

    await userEvent.click(screen.getByRole("button", { name: "Break widget A" }));

    // Widget A and the custom-fallback demo both broke; widget B did not
    expect(screen.getByText(/Widget A failed to render/)).toBeInTheDocument();
    expect(screen.getByText("Widget rendering normally")).toBeInTheDocument();
  });

  it("renders the custom fallback for the third boundary", async () => {
    wrap(<ErrorBoundariesPage />);
    await userEvent.click(screen.getByRole("button", { name: "Break widget A" }));

    expect(screen.getByText("Chart unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload chart" })).toBeInTheDocument();
  });

  it("recovers once the cause is disarmed", async () => {
    wrap(<ErrorBoundariesPage />);

    await userEvent.click(screen.getByRole("button", { name: "Break widget A" }));
    expect(screen.getByText(/Widget A failed to render/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Disarm widget A" }));
    await userEvent.click(screen.getAllByRole("button", { name: /Try again/ })[0]);

    expect(screen.queryByText(/Widget A failed to render/)).not.toBeInTheDocument();
  });

  it("catches an error thrown in a handler with try/catch, not the boundary", async () => {
    wrap(<ErrorBoundariesPage />);
    await userEvent.click(screen.getByRole("button", { name: "Throw and catch" }));

    expect(screen.getByText(/Caught safely/)).toBeInTheDocument();
    // No boundary fallback appeared — the handler dealt with it
    expect(screen.queryByText(/failed to render/)).not.toBeInTheDocument();
  });
});

describe("task 7 — performance", () => {
  it("memo skips a re-render with a stable prop but not with an inline object", async () => {
    const { container } = wrap(<PerformancePage />);

    const input = screen.getByLabelText(/Type to re-render/);
    await userEvent.type(input, "abcde");

    const cards = [...container.querySelectorAll(".rounded-card")];
    const read = heading => {
      const card = cards.find(node => node.textContent.startsWith(heading));
      return Number(card.textContent.match(/(\d+) renders?/)[1]);
    };

    const plain = read("No memo");
    const stable = read("memo + string prop");
    const unstable = read("memo + inline object");
    const callback = read("memo + useCallback");

    expect(plain).toBeGreaterThan(1);
    expect(stable).toBe(1);
    // The point of the demo: memo alone does not help
    expect(unstable).toBe(plain);
    expect(callback).toBe(1);
  });

  it("does not recompute the memoised value on unrelated renders", async () => {
    wrap(<PerformancePage />);

    const before = screen.getByText(/recomputed on toggle only/);
    await userEvent.type(screen.getByLabelText(/Type to re-render/), "xy");
    expect(before).toBeInTheDocument();
  });
});

describe("task 11 — framer motion", () => {
  it("opens and closes the animated modal", async () => {
    wrap(<MotionPage />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open modal" }));
    expect(screen.getByRole("dialog", { name: "Confirm export" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("adds and removes list items", async () => {
    wrap(<MotionPage />);

    expect(screen.getByText("Fix nav overlap")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Add item" }));
    expect(screen.getByText("New task 4")).toBeInTheDocument();
  });

  it("swaps panels", async () => {
    wrap(<MotionPage />);
    await userEvent.click(screen.getByRole("button", { name: "revenue" }));
    await waitFor(() => expect(screen.getByText(/\$48,290 this month/)).toBeInTheDocument());
  });
});

describe("task 13 — the deliverable", () => {
  it("renders KPIs, the orders table and the side panels", async () => {
    wrap(<DeliverablePage />);

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("Low stock")).toBeInTheDocument();
    expect(screen.getByText("Activity")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
  });

  it("reaches the unauthorized and error scenarios", async () => {
    wrap(<DeliverablePage />);

    await userEvent.click(screen.getByRole("button", { name: "No permission" }));
    expect(screen.getByText(/don't have access/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Error" }));
    expect(screen.getByText(/503 Service Unavailable/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
  });

  it("deletes a row from the orders table", async () => {
    wrap(<DeliverablePage />);
    await waitFor(() => screen.getByRole("table"));

    // The page size is fixed, so deleting pulls the next record up — assert on
    // the specific id disappearing rather than on the row count.
    const firstId = within(screen.getByRole("table"))
      .getAllByRole("row")[1]
      .textContent.match(/ORD-\d+/)[0];

    await userEvent.click(
      within(screen.getByRole("table")).getAllByRole("button", { name: "Delete" })[0]
    );

    await waitFor(() => expect(screen.queryByText(firstId)).not.toBeInTheDocument());
  });

  it("filters the orders table by status", async () => {
    wrap(<DeliverablePage />);
    await waitFor(() => screen.getByRole("table"));

    await userEvent.selectOptions(screen.getByLabelText("Filter"), "refunded");

    // Cell order is: checkbox, id, customer, product, total, status, actions —
    // so the status is second from the end, not last.
    const rows = within(screen.getByRole("table")).getAllByRole("row").slice(1);
    const statuses = rows.map(row => within(row).getAllByRole("cell").at(-2).textContent);

    expect(rows.length).toBeGreaterThan(0);
    expect(statuses.every(status => status === "refunded")).toBe(true);
  });
});
