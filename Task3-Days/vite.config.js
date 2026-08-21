import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Task 1 — absolute imports. Every alias below has a twin in jsconfig.json,
// which is what makes VS Code autocomplete them.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@tasks": path.resolve(__dirname, "./src/tasks"),
      "@ui": path.resolve(__dirname, "./src/tasks/task-04-reusable-base-components/ui"),
      "@interactive": path.resolve(__dirname, "./src/tasks/task-05-interactive-components/ui")
    }
  },
  server: { port: 3000, open: true }
});
