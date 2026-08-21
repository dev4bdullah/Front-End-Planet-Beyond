import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const here = import.meta.dirname;

export default defineConfig({
  // Tailwind v4 is a Vite plugin — no postcss.config.js, no tailwind.config.js
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(here, "./src"),
      "@shared": path.resolve(here, "./src/shared"),
      "@tasks": path.resolve(here, "./src/tasks"),
      "@ui": path.resolve(here, "./src/tasks/task-03-reusable-ui-system/ui"),
      "@layout": path.resolve(here, "./src/tasks/task-02-dashboard-shell/layout")
    }
  },

  server: { port: 3000, open: true },

  build: {
    // Task 8 — split the heavy libraries into their own chunks instead of one
    // 600kB bundle. Check the output of `npm run build` to see the difference.
    rollupOptions: {
      output: {
        // Vite 8 uses rolldown, which requires the function form rather than
        // the object map that older Vite accepted.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("framer-motion") || id.includes("motion-dom")) return "motion";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/") || id.includes("react-dom")) return "react";
          return "vendor";
        }
      }
    }
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: true
  }
});
