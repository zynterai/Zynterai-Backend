import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const savedTheme = localStorage.getItem("zentrov_theme") || "dark";
const resolvedTheme =
  savedTheme === "system"
    ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : savedTheme;

document.documentElement.classList.remove("dark", "light");
document.documentElement.classList.add(resolvedTheme);
document.documentElement.style.colorScheme = resolvedTheme;

createRoot(document.getElementById("root")!).render(<App />);
