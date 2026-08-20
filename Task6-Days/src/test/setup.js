import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/* Unmount between tests, or the next test queries a DOM containing the
   previous test's components. */
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

/* jsdom implements neither of these, and recharts' ResponsiveContainer needs
   the first one to decide it has a size. Without the stub, charts render at
   0×0 and every assertion about them fails. */
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.matchMedia =
  window.matchMedia ||
  (query => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false
  }));

/* framer-motion reads this during layout animations */
Element.prototype.getBoundingClientRect ||= () => ({
  width: 800,
  height: 400,
  top: 0,
  left: 0,
  right: 800,
  bottom: 400
});
