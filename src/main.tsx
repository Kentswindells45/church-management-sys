/**
 * Entry point of the application
 * Sets up mock service worker for development
 * Renders the root component with necessary providers
 */
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Add debug logging
if (process.env.NODE_ENV === "development") {
  console.log("Starting application in development mode");
}

// Prepare mock service worker for development
async function prepare() {
  if (import.meta.env.MODE === "development") {
    const { worker } = await import("./mocks/browser");
    await worker.start();
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
