import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@styles/index.css";

/* StrictMode double-invokes effects in development on purpose, to surface
   missing cleanup. Task 11 explains what you'll see in the console. */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
