// Polyfill for Node.js global object used by some libraries (like Google Generative AI)
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
