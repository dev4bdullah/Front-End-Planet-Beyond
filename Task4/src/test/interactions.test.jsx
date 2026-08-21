import { describe, expect, it, beforeEach, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderAt, stubFetch } from "./helpers";

beforeEach(() => {
  global.fetch = stubFetch();
});

describe("task 6 — URL search params", () => {
  it("reads its initial state entirely from the URL", async () => {
    renderAt("/url-search-params?search=monitor&sort=price-asc&category=displays");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    expect(screen.getByLabelText("Search")).toHaveValue("monitor");
    expect(screen.getByLabelText("Sort")).toHaveValue("price-asc");
    expect(screen.getByLabelText("Category")).toHaveValue("displays");
  });

  it("writes a control change into the query string", async () => {
    const { router } = renderAt("/url-search-params");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    await userEvent.selectOptions(screen.getByLabelText("Sort"), "rating");

    await waitFor(() => expect(router.state.location.search).toContain("sort=rating"));
  });

  it("drops defaults instead of writing sort=default", async () => {
    const { router } = renderAt("/url-search-params?sort=rating");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    await userEvent.selectOptions(screen.getByLabelText("Sort"), "default");

    await waitFor(() => expect(router.state.location.search).not.toContain("sort"));
  });

  it("filters the visible products", async () => {
    renderAt("/url-search-params?category=audio");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    expect(screen.getByText("Studio headphones")).toBeInTheDocument();
    expect(screen.queryByText("Desk lamp")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderAt("/url-search-params?search=zzzzz");
    await waitFor(() => expect(screen.getByText("Nothing matches")).toBeInTheDocument());
  });

  it("clamps an out-of-range page instead of showing a blank grid", async () => {
    renderAt("/url-search-params?page=999&limit=3");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    // Falls back to the last real page rather than rendering nothing
    expect(screen.queryByText("Nothing matches")).not.toBeInTheDocument();
    expect(screen.getByText(/page 4 of 4/)).toBeInTheDocument();
  });

  it("resets to page 1 when a filter changes", async () => {
    const { router } = renderAt("/url-search-params?page=2&limit=3");
    await waitFor(() => screen.getByText("Day 4 · Task 6"));

    await userEvent.selectOptions(screen.getByLabelText("Category"), "audio");

    await waitFor(() => expect(router.state.location.search).not.toContain("page"));
  });
});

describe("task 7 — outlet context", () => {
  it("lets a page write into the layout's state", async () => {
    renderAt("/outlet-context");
    await waitFor(() => screen.getByText("Day 4 · Task 7"));

    expect(document.documentElement).not.toHaveClass("theme-dark");

    await userEvent.selectOptions(screen.getByLabelText("Theme"), "dark");

    // The change reached MainLayout, which owns the effect that applies it
    await waitFor(() => expect(document.documentElement).toHaveClass("theme-dark"));
  });

  it("reaches a component that received no props", async () => {
    renderAt("/outlet-context");
    await waitFor(() => screen.getByText("Day 4 · Task 7"));

    // Scope the query to the nested card — the name also appears in the JSON dump
    const card = screen.getByText(/A component nested inside this page/).closest(".card");
    expect(within(card).getByText(/Syed Abdullah Ayaz/)).toBeInTheDocument();
    expect(within(card).getByText(/light|dark/)).toBeInTheDocument();
  });
});

describe("task 8 — navigation UX", () => {
  it("builds breadcrumbs from the pathname", async () => {
    renderAt("/nested-routes/users/3");
    await waitFor(() => screen.getByText("Day 4 · Task 4"));

    const crumbs = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(crumbs).getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(within(crumbs).getByRole("link", { name: "Nested Routes" })).toBeInTheDocument();
    // The last crumb is not a link — linking to the current page is a real bug
    expect(within(crumbs).getByText("3")).toHaveAttribute("aria-current", "page");
  });

  it("sets the document title, and restores it on unmount", async () => {
    const before = document.title;
    const { unmount } = renderAt("/navigation-ux");

    await waitFor(() => expect(document.title).toBe("Navigation UX · Router Shop"));

    unmount();
    expect(document.title).toBe(before);
  });
});

describe("task 9 — API service layer", () => {
  it("calls through the service and renders the rows", async () => {
    renderAt("/api-service-layer");
    await waitFor(() => screen.getByText("Day 4 · Task 9"));

    await userEvent.click(screen.getByRole("button", { name: "products" }));

    await waitFor(() => expect(screen.getByText("Test Product 1")).toBeInTheDocument());
    expect(global.fetch).toHaveBeenCalled();
    expect(String(global.fetch.mock.calls[0][0])).toContain("dummyjson.com/products");
  });

  it("surfaces a bad status with the status code attached", async () => {
    renderAt("/api-service-layer");
    await waitFor(() => screen.getByText("Day 4 · Task 9"));

    await userEvent.click(screen.getByRole("button", { name: "broken" }));

    await waitFor(() => expect(screen.getByText("Request failed")).toBeInTheDocument());

    // The status is shown as its own line, distinct from the message text
    const panel = screen.getByText("Request failed").closest(".state");
    expect(within(panel).getByText("404")).toBeInTheDocument();
  });

  it("distinguishes a network failure, which has no status", async () => {
    global.fetch = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    renderAt("/api-service-layer");
    await waitFor(() => screen.getByText("Day 4 · Task 9"));

    await userEvent.click(screen.getByRole("button", { name: "products" }));

    await waitFor(() => expect(screen.getByText(/never reached a server/)).toBeInTheDocument());
  });

  it("offers a retry that fires another request", async () => {
    renderAt("/api-service-layer");
    await waitFor(() => screen.getByText("Day 4 · Task 9"));

    await userEvent.click(screen.getByRole("button", { name: "broken" }));
    await waitFor(() => screen.getByText("Request failed"));

    const callsBefore = global.fetch.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(global.fetch.mock.calls.length).toBeGreaterThan(callsBefore));
  });
});

describe("task 11 — custom hooks", () => {
  it("useFetch drives loading then success", async () => {
    renderAt("/custom-hooks");

    await waitFor(() => expect(screen.getByText("Test Product 1")).toBeInTheDocument());
  });

  it("useLocalStorage survives across renders", async () => {
    renderAt("/custom-hooks");
    await waitFor(() => screen.getByText("Test Product 1"));

    await userEvent.click(screen.getAllByRole("button", { name: /Save/ })[0]);

    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("day4.favourites"))).toContain("products-1")
    );
  });

  it("useDocumentTitle set the tab title", async () => {
    renderAt("/custom-hooks");
    await waitFor(() => expect(document.title).toBe("Custom Hooks · Router Shop"));
  });

  it("useFetch refetches when a dependency changes", async () => {
    renderAt("/custom-hooks");
    await waitFor(() => screen.getByText("Test Product 1"));

    const before = global.fetch.mock.calls.length;
    await userEvent.click(screen.getByRole("button", { name: "users" }));

    await waitFor(() => expect(screen.getByText("Test User")).toBeInTheDocument());
    expect(global.fetch.mock.calls.length).toBeGreaterThan(before);
  });
});

describe("task 12 — the deliverable", () => {
  it("lists products from the service", async () => {
    renderAt("/deliverable");
    await waitFor(() => expect(screen.getByText("Test Product 1")).toBeInTheDocument());
  });

  it("shows a detail route and preserves the list's filters", async () => {
    renderAt("/deliverable/7?category=laptops&sort=rating");
    await waitFor(() => expect(screen.getByText("Test Product 7")).toBeInTheDocument());

    const back = screen.getByRole("link", { name: /All products/ });
    expect(back.getAttribute("href")).toContain("category=laptops");
    expect(back.getAttribute("href")).toContain("sort=rating");
  });

  it("renders an error state with a retry when the API fails", async () => {
    global.fetch = stubFetch({ fail: true });

    renderAt("/deliverable");
    await waitFor(() =>
      expect(screen.getByText("Couldn't load the catalogue")).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("distinguishes an empty catalogue from a filtered-out one", async () => {
    global.fetch = stubFetch({ empty: true });

    renderAt("/deliverable");
    await waitFor(() => expect(screen.getByText("No products")).toBeInTheDocument());

    // and with a filter applied, the message and the action change
    global.fetch = stubFetch({ empty: true });
    renderAt("/deliverable?search=zzz");
    await waitFor(() => expect(screen.getByText("Nothing matches")).toBeInTheDocument());
  });
});
