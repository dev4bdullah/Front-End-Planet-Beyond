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
      "@providers": path.resolve(here, "./src/providers"),
      "@model": path.resolve(here, "./src/tasks/task-01-crud-data-model"),
      "@store": path.resolve(here, "./src/tasks/task-10-usereducer-crud-logic/lib"),
      "@hooks": path.resolve(here, "./src/tasks/task-11-local-persistence/hooks")
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
