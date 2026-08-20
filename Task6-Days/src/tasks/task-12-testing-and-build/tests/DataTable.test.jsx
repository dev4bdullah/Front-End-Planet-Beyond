import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DataTable from "@tasks/task-05-professional-data-table/components/DataTable";

const rows = [
  { id: "A-1", name: "Keyboard", price: 89, status: "paid" },
  { id: "A-2", name: "Monitor", price: 449, status: "pending" },
  { id: "A-3", name: "Dock", price: 129, status: "paid" },
  { id: "A-4", name: "Headphones", price: 199, status: "refunded" }
];

const columns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "price", label: "Price", numeric: true, align: "right" },
  { key: "status", label: "Status" }
];

const setup = (props = {}) =>
  render(
    <DataTable
      rows={rows}
      columns={columns}
      searchKeys={["id", "name"]}
      filterKey="status"
      filterOptions={[
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "refunded", label: "Refunded" }
      ]}
      pageSize={3}
      {...props}
    />
  );

const bodyRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);

describe("DataTable", () => {
  it("renders one page of rows, not all of them", () => {
    setup();
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByText(/of/)).toHaveTextContent("4");
  });

  it("filters as you search", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Search records"), "monitor");

    expect(bodyRows()).toHaveLength(1);
    expect(screen.getByText("Monitor")).toBeInTheDocument();
  });

  it("shows a no-results state that is distinct from the empty state", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Search records"), "zzzzz");

    expect(screen.getByText("No matching records")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("shows the empty state when there is genuinely no data", () => {
    setup({ rows: [], emptyTitle: "No orders yet" });
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(screen.queryByText("No matching records")).not.toBeInTheDocument();
  });

  it("filters by status", async () => {
    setup();
    await userEvent.selectOptions(screen.getByLabelText("Filter"), "paid");
    expect(bodyRows()).toHaveLength(2);
  });

  it("sorts numerically, not alphabetically", async () => {
    setup({ pageSize: 10 });
    await userEvent.click(screen.getByRole("button", { name: /price/i }));

    const prices = bodyRows().map(row => within(row).getAllByRole("cell")[3].textContent);
    // Alphabetical order would put 129 before 89
    expect(prices).toEqual(["89", "129", "199", "449"]);
  });

  it("reverses the sort on a second click", async () => {
    setup({ pageSize: 10 });
    const header = screen.getByRole("button", { name: /price/i });

    await userEvent.click(header);
    await userEvent.click(header);

    const prices = bodyRows().map(row => within(row).getAllByRole("cell")[3].textContent);
    expect(prices).toEqual(["449", "199", "129", "89"]);
  });

  it("paginates", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: "2" }));
    expect(bodyRows()).toHaveLength(1);
  });

  it("reports selection and fires a bulk action", async () => {
    const onRowAction = vi.fn();
    setup({ onRowAction });

    await userEvent.click(screen.getByLabelText("Select A-1"));
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Export" }));
    expect(onRowAction).toHaveBeenCalledWith("export", ["A-1"]);
  });

  it("selects every row on the current page at once", async () => {
    setup();
    await userEvent.click(screen.getByLabelText("Select all rows on this page"));
    expect(screen.getByText("3 selected")).toBeInTheDocument();
  });

  it("renders a loading state instead of rows", () => {
    setup({ loading: true });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
