import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/* Unmount between tests, or the next query sees the previous test's DOM and
   getByRole starts complaining about multiple matches for no obvious reason. */
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
  document.documentElement.classList.remove("theme-dark");
});

/* jsdom doesn't implement scrollTo, and MainLayout calls it on every navigation. */
window.scrollTo = window.scrollTo ?? (() => {});

window.matchMedia =
  window.matchMedia ||
  (query => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false
  }));
