"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  // Always start light on server; hydrate with client value.
  if (typeof window === "undefined") return "light";
  const saved = window.localStorage.getItem("carefulliq_theme");
  if (saved === "dark" || saved === "light") return saved;
  // Respect OS preference
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme === "dark" ? "dark" : "");
    if (theme === "light") document.body.removeAttribute("data-theme");
    window.localStorage.setItem("carefulliq_theme", theme);

    // Broadcast theme changes so UI elements (like the topbar button label)
    // can update without re-wiring the component tree.
    try {
      window.dispatchEvent(new CustomEvent("carefulliq:theme", { detail: { theme } }));
    } catch {
      // no-op
    }
  }, [theme]);

  // Expose an imperative toggle for the header button.
  useEffect(() => {
    (window as any).__carefulliq_toggleTheme = () => {
      setTheme((t) => (t === "dark" ? "light" : "dark"));
    };

    (window as any).__carefulliq_getTheme = () => {
      return window.localStorage.getItem("carefulliq_theme") || "light";
    };
  }, []);

  return <>{children}</>;
}
