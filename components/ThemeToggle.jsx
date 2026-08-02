"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = ["light", "dark", "system"];

function applyTheme(t) {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
  } else if (t === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("system");

  useEffect(() => {
    const saved = localStorage.getItem("billing-theme") || "system";
    setTheme(saved);
    applyTheme(saved);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("billing-theme") || "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function cycle() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    localStorage.setItem("billing-theme", next);
    applyTheme(next);
  }

  const icons = { light: Sun, dark: Moon, system: Monitor };
  const Icon = icons[theme];
  const labels = { light: "Light mode", dark: "Dark mode", system: "System default" };

  return (
    <button
      type="button"
      onClick={cycle}
      title={labels[theme]}
      aria-label={`Current theme: ${labels[theme]}. Click to change.`}
      className="p-2 rounded-lg transition-colors shrink-0"
      style={{ color: "var(--sidebar-text)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sidebar-item-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={16} />
    </button>
  );
}
