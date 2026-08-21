import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const here = import.meta.dirname;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(here, "./src"),
      "@shared": path.resolve(here, "./src/shared"),
      "@tasks": path.resolve(here, "./src/tasks"),
      "@layout": path.resolve(here, "./src/tasks/task-03-shared-layouts/layout"),
      "@services": path.resolve(here, "./src/tasks/task-09-api-service-layer/services"),
      "@hooks": path.resolve(here, "./src/tasks/task-11-custom-hooks/hooks")
    }
  },
  server: { port: 3000, open: true },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: true
  }
});
