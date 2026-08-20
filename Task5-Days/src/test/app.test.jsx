import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NAV } from "@shared/navigation";
import { renderAt } from "./helpers";

beforeEach(() => localStorage.clear());

describe("every task route mounts", () => {
  it.each(NAV.map(item => [item.slug, item.title, item.num]))(
    "/%s renders task %s",
    async (slug, title, num) => {
      renderAt(`/${slug}`);

      await waitFor(() => expect(screen.getByText(`Day 5 · Task ${num}`)).toBeInTheDocument());
      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
      expect(screen.getByRole("navigation", { name: "Tasks" })).toBeInTheDocument();
    }
  );
});

describe("task 3 — create flow", () => {
  it("opens a modal with a focus trap and dialog semantics", async () => {
    renderAt("/create-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 3"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open the modal" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes on Escape", async () => {
    renderAt("/create-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 3"));

    await userEvent.click(screen.getByRole("button", { name: "Open the modal" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("blocks an invalid submit and reports the failing fields", async () => {
    renderAt("/create-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 3"));

    await userEvent.click(screen.getByRole("button", { name: "Show the inline form" }));
    await userEvent.click(screen.getByRole("button", { name: /Create product/i }));

    // Each field error also has role="alert", so target the summary explicitly
    expect(await screen.findByText(/fields need attention/)).toBeInTheDocument();
  });

  it("creates a record when the form is valid", async () => {
    renderAt("/create-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 3"));

    await userEvent.click(screen.getByRole("button", { name: "Show the inline form" }));

    await userEvent.type(screen.getByLabelText(/^Name/), "Test Keyboard");
    await userEvent.type(screen.getByLabelText(/^SKU/), "TK-9001");
    await userEvent.type(screen.getByLabelText(/^Price/), "55");
    await userEvent.type(screen.getByLabelText(/^Stock/), "10");

    await userEvent.click(screen.getByRole("button", { name: /Create product/i }));

    await waitFor(() => expect(screen.getByText("Test Keyboard")).toBeInTheDocument());
    // a toast confirmed it
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });
});

describe("task 5 — delete flow", () => {
  it("asks for confirmation before deleting", async () => {
    renderAt("/delete-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 5"));

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("cancelling leaves the record alone", async () => {
    renderAt("/delete-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 5"));

    const before = screen.getAllByRole("button", { name: "Delete" }).length;

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getAllByRole("button", { name: "Delete" })).toHaveLength(before);
  });

  it("confirming deletes and offers an undo that restores it", async () => {
    renderAt("/delete-flow");
    await waitFor(() => screen.getByText("Day 5 · Task 5"));

    const list = () => screen.getAllByRole("button", { name: "Delete" })[0].closest(".list");
    const titlesIn = node => [...node.querySelectorAll(".list__text")].map(n => n.textContent);

    const before = titlesIn(list());
    const target = before[0];

    await userEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Delete" })
    );

    await waitFor(() => expect(titlesIn(list())).not.toContain(target));
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    // Restored to its original index, not pushed to the top
    await waitFor(() => expect(titlesIn(list())).toEqual(before));
  });
});

describe("task 8 — toasts", () => {
  it("raises one toast per type", async () => {
    renderAt("/toast-notifications");
    await waitFor(() => screen.getByText("Day 5 · Task 8"));

    await userEvent.click(screen.getByRole("button", { name: "Success" }));
    expect(await screen.findByText(/Mechanical keyboard created/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^Error/ }));
    expect(await screen.findByText(/server returned 500/)).toBeInTheDocument();
  });

  it("caps the stack", async () => {
    renderAt("/toast-notifications");
    await waitFor(() => screen.getByText("Day 5 · Task 8"));

    await userEvent.click(screen.getByRole("button", { name: "Fire 8 at once" }));

    const viewport = await screen.findByRole("region", { name: "Notifications" });
    // max is 4, so the first four are dropped
    await waitFor(() =>
      expect(within(viewport).queryByText("Bulk message 1")).not.toBeInTheDocument()
    );
    expect(within(viewport).getByText("Bulk message 8")).toBeInTheDocument();
  });

  it("an undo action calls back", async () => {
    renderAt("/toast-notifications");
    await waitFor(() => screen.getByText("Day 5 · Task 8"));

    expect(screen.getByText("Undo pressed 0 times.")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Warning with Undo" }));
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));

    await waitFor(() => expect(screen.getByText("Undo pressed 1 times.")).toBeInTheDocument());
  });
});

describe("task 9 — context", () => {
  it("theme context writes a class onto <html> and persists", async () => {
    renderAt("/context-api");
    await waitFor(() => screen.getByText("Day 5 · Task 9"));

    expect(document.documentElement).not.toHaveClass("theme-dark");

    // The topbar has a toggle with the same accessible name — use the page's
    const main = document.querySelector(".app__main");
    await userEvent.click(within(main).getByRole("button", { name: /Switch to dark/ }));

    await waitFor(() => expect(document.documentElement).toHaveClass("theme-dark"));
    expect(JSON.parse(localStorage.getItem("day5.theme"))).toBe("dark");
  });

  it("permissions change with the role", async () => {
    renderAt("/context-api");
    await waitFor(() => screen.getByText("Day 5 · Task 9"));

    await userEvent.click(screen.getByRole("button", { name: "Viewer" }));

    const deleteStat = screen.getByText("delete").closest(".stat");
    await waitFor(() => expect(within(deleteStat).getByText("no")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Admin" }));
    await waitFor(() => expect(within(deleteStat).getByText("yes")).toBeInTheDocument());
  });

  it("reaches a component that received no props", async () => {
    renderAt("/context-api");
    await waitFor(() => screen.getByText("Day 5 · Task 9"));

    const card = screen.getByText(/A component nested inside this page/).closest(".card");
    expect(within(card).getByText(/Syed Abdullah Ayaz/)).toBeInTheDocument();
  });
});

describe("task 11 — persistence", () => {
  it("writes the store to localStorage", async () => {
    renderAt("/local-persistence");
    await waitFor(() => screen.getByText("Day 5 · Task 11"));

    await userEvent.click(screen.getByRole("button", { name: "Reset to seed data" }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("day5.crud"));
      expect(saved.__v).toBe(1);
      expect(saved.data.records.products.length).toBeGreaterThan(0);
    });
  });

  it("does not persist transient state", async () => {
    renderAt("/local-persistence");
    await waitFor(() => screen.getByText("Day 5 · Task 11"));

    await userEvent.click(screen.getByRole("button", { name: "Reset to seed data" }));

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem("day5.crud"));
      expect(saved.data).not.toHaveProperty("pending");
      expect(saved.data).not.toHaveProperty("selected");
      expect(saved.data).not.toHaveProperty("search");
    });
  });

  it("recovers from corrupted storage instead of crashing", async () => {
    localStorage.setItem("day5.crud", "{ this is not json");

    renderAt("/local-persistence");

    // The app still renders, from seed data
    await waitFor(() => expect(screen.getByText("Day 5 · Task 11")).toBeInTheDocument());
  });

  it("discards saved state from a different version", async () => {
    localStorage.setItem(
      "day5.crud",
      JSON.stringify({ __v: 99, data: { records: { products: [] } } })
    );

    renderAt("/read-views");
    await waitFor(() => screen.getByText("Day 5 · Task 2"));

    // Seed data, not the empty version-99 payload
    expect(screen.getByText("Mechanical keyboard")).toBeInTheDocument();
  });
});

describe("task 13 — the deliverable", () => {
  it("renders records and stats", async () => {
    renderAt("/deliverable");
    await waitFor(() => screen.getByText("Day 5 · Task 13"));

    expect(screen.getByText("Mechanical keyboard")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
  });

  it("switches entity and clears the search", async () => {
    renderAt("/deliverable");
    await waitFor(() => screen.getByText("Day 5 · Task 13"));

    await userEvent.type(screen.getByLabelText("Search"), "keyboard");
    await userEvent.click(screen.getByRole("button", { name: "Users" }));

    expect(screen.getByLabelText("Search")).toHaveValue("");
    await waitFor(() => expect(screen.getByText("Ayesha Raiz")).toBeInTheDocument());
  });

  it("shows a no-match empty state distinct from the no-records one", async () => {
    renderAt("/deliverable");
    await waitFor(() => screen.getByText("Day 5 · Task 13"));

    await userEvent.type(screen.getByLabelText("Search"), "zzzzz");

    await waitFor(() => expect(screen.getByText("Nothing matches")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("switches between card and table views", async () => {
    renderAt("/deliverable");
    await waitFor(() => screen.getByText("Day 5 · Task 13"));

    // The page also contains a documentation table, so count the record cards instead
    expect(document.querySelectorAll(".record").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole("button", { name: "table", pressed: false }));
    await waitFor(() => expect(document.querySelectorAll(".record")).toHaveLength(0));

    await userEvent.click(screen.getByRole("button", { name: "cards", pressed: false }));
    await waitFor(() => expect(document.querySelectorAll(".record").length).toBeGreaterThan(0));
  });
});
