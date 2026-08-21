import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NAV } from "@layout/navigation";
import { renderAt, stubFetch } from "./helpers";

beforeEach(() => {
  global.fetch = stubFetch();
});

describe("every task route mounts inside the layout", () => {
  it.each(NAV.map(item => [item.slug, item.title, item.num]))(
    "/%s renders task %s",
    async (slug, title, num) => {
      renderAt(`/${slug}`);

      await waitFor(() => expect(screen.getByText(`Day 4 · Task ${num}`)).toBeInTheDocument());

      expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
      // The shared layout survived — the sidebar is still there
      expect(screen.getByRole("navigation", { name: "Tasks" })).toBeInTheDocument();
    }
  );
});

describe("the shared layout", () => {
  it("marks the current page in the sidebar", async () => {
    renderAt("/url-search-params");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    const sidebar = screen.getByRole("navigation", { name: "Tasks" });
    const link = within(sidebar).getByRole("link", { name: /URL Search Params/ });
    expect(link).toHaveClass("is-active");
  });

  it("shows the task number and full title in the topbar", async () => {
    renderAt("/custom-hooks");
    await waitFor(() => expect(screen.getByText("11 · Custom Hooks")).toBeInTheDocument());
  });

  it("toggles the theme class on <html> and persists it", async () => {
    renderAt("/shared-layouts");
    await waitFor(() => screen.getByText("Day 4 · Task 3"));

    expect(document.documentElement).not.toHaveClass("theme-dark");
    await userEvent.click(screen.getByRole("button", { name: /switch to dark theme/i }));

    expect(document.documentElement).toHaveClass("theme-dark");
    expect(JSON.parse(localStorage.getItem("day4.settings")).theme).toBe("dark");
  });
});

describe("404 and redirects", () => {
  it("renders the not-found page inside the layout, so navigation still works", () => {
    renderAt("/definitely-not-a-route");

    expect(screen.getByText("404 — no route matches")).toBeInTheDocument();
    expect(screen.getByText("/definitely-not-a-route")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Tasks" })).toBeInTheDocument();
  });

  it("redirects /shop to the deliverable", async () => {
    renderAt("/shop");
    await waitFor(() => expect(screen.getByText("Day 4 · Task 12")).toBeInTheDocument());
  });
});

describe("nested routes (task 4)", () => {
  it("renders the index route at the parent path", async () => {
    renderAt("/nested-routes");
    await waitFor(() => screen.getByText("Day 4 · Task 4"));

    expect(screen.getByText("In stock")).toBeInTheDocument();
    const overview = screen.getByRole("link", { name: "Overview" });
    expect(overview).toHaveClass("is-active");
  });

  it("renders a child route three levels deep", async () => {
    renderAt("/nested-routes/users/3");
    await waitFor(() => screen.getByText("Day 4 · Task 4"));

    // MainLayout → NestedRoutesPage → DashboardLayout → UserDetail
    expect(screen.getByRole("navigation", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Syed Abdullah Ayaz" })).toBeInTheDocument();
  });

  it("keeps Overview inactive on a child route, thanks to `end`", async () => {
    renderAt("/nested-routes/profile");
    await waitFor(() => screen.getByRole("heading", { name: "Profile" }));

    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveClass("is-active");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveClass("is-active");
  });

  it("forwards outlet context two layers down", async () => {
    renderAt("/nested-routes/profile");
    await waitFor(() => screen.getByRole("heading", { name: "Profile" }));

    // The user object came from MainLayout, through DashboardLayout, to here
    expect(screen.getByText("Frontend Intern")).toBeInTheDocument();
  });
});

describe("dynamic routes (task 5)", () => {
  it("reads the id from the URL", async () => {
    renderAt("/dynamic-routes/4");
    await waitFor(() => screen.getByText("Day 4 · Task 5"));

    expect(screen.getByRole("heading", { name: "Studio headphones" })).toBeInTheDocument();
    expect(screen.getByText('{"id":"4"}')).toBeInTheDocument();
  });

  it("handles a matched route with no matching record", async () => {
    renderAt("/dynamic-routes/99999");
    await waitFor(() => expect(screen.getByText("No product with id 99999")).toBeInTheDocument());
  });

  it("shows the list at the parent path", async () => {
    renderAt("/dynamic-routes");
    await waitFor(() => screen.getByText("Day 4 · Task 5"));
    expect(screen.getByText("Pick a product")).toBeInTheDocument();
  });
});
