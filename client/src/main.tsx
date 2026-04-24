import type { DehydratedState } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

declare global {
  interface Window {
    __REACT_QUERY_STATE__?: DehydratedState;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

const app = <App dehydratedState={window.__REACT_QUERY_STATE__} />;

createRoot(rootElement).render(app);
