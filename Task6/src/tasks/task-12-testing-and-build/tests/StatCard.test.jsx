import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatCard, { StatCardSkeleton } from "@tasks/task-04-stats-and-kpi-cards/components/StatCard";

describe("StatCard", () => {
  it("renders the label, formatted value and delta", () => {
    render(<StatCard label="Revenue" value={48290} prefix="$" delta={12.4} spark={[1, 2, 3]} />);

    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$48290")).toBeInTheDocument();
    expect(screen.getByText("12.4%")).toBeInTheDocument();
  });

  it("applies a format function when given one", () => {
    render(
      <StatCard label="Orders" value={1284} delta={8} format={value => value.toLocaleString()} />
    );
    expect(screen.getByText("1,284")).toBeInTheDocument();
  });

  it("hides the delta row entirely when there is no delta", () => {
    render(<StatCard label="Flat" value={10} />);
    expect(screen.queryByText(/vs last month/)).not.toBeInTheDocument();
  });

  it("treats a fall as good when invertDelta is set", () => {
    const { container } = render(
      <StatCard label="Refund rate" value={2.8} suffix="%" delta={-0.6} invertDelta />
    );

    // A falling refund rate is good news, so the delta reads as success
    expect(container.querySelector(".text-success-600")).toBeTruthy();
    expect(container.querySelector(".text-danger-600")).toBeFalsy();
  });

  it("treats a fall as bad without invertDelta", () => {
    const { container } = render(<StatCard label="Revenue" value={100} delta={-4} />);
    expect(container.querySelector(".text-danger-600")).toBeTruthy();
  });

  it("renders a skeleton with no data", () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.querySelectorAll(".shimmer")).toHaveLength(3);
  });
});
