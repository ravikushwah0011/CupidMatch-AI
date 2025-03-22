// Import polyfills first to ensure they're available before any other imports
import "./lib/browser-polyfills";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
