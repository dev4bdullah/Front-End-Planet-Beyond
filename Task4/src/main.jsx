import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

/* Task 1 — one router, mounted once, at the root.

   StrictMode double-invokes every effect in development on purpose, so a
   missing cleanup surfaces immediately. Task 10 explains what you'll see. */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
