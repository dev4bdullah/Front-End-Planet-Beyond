import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { routes } from "@/router/routes";

/* Renders the real route tree at any path, using a memory router — so tests
   exercise the same routes the app ships with rather than a parallel copy. */
export function renderAt(path) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return { ...render(<RouterProvider router={router} />), router };
}

/* A fetch stub shaped like the dummyjson responses the services expect. */
export function stubFetch({ fail = false, empty = false } = {}) {
  return vi.fn(async url => {
    const target = String(url);

    if (fail || target.includes("does-not-exist") || target.includes("no-such-host")) {
      return {
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: "not found" })
      };
    }

    if (target.includes("/products/categories")) {
      return { ok: true, status: 200, json: async () => ["beauty", "laptops"] };
    }

    // a single product: /products/7  (but not /products?limit=…)
    const single = target.match(/\/products\/(\d+)/);
    if (single) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          id: Number(single[1]),
          title: `Test Product ${single[1]}`,
          price: 42,
          category: "laptops",
          brand: "Testco",
          stock: 25,
          rating: 4.5,
          discountPercentage: 10,
          description: "A product used in tests."
        })
      };
    }

    if (target.includes("/products")) {
      const products = empty
        ? []
        : [
            {
              id: 1,
              title: "Test Product 1",
              price: 42,
              category: "laptops",
              stock: 25,
              rating: 4.5
            },
            { id: 2, title: "Test Product 2", price: 99, category: "beauty", stock: 4, rating: 4.9 }
          ];
      return { ok: true, status: 200, json: async () => ({ products, total: products.length }) };
    }

    if (target.includes("/users")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          users: [{ id: 1, firstName: "Test", lastName: "User", email: "t@example.com" }],
          total: 1
        })
      };
    }

    return { ok: true, status: 200, json: async () => ({}) };
  });
}
