"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/components/shell.module.css";

type ThemeMode = "light" | "dark";

function readTheme(): ThemeMode {
  try {
    const v = window.localStorage.getItem("carefulliq_theme");
    if (v === "dark" || v === "light") return v;
  } catch {}
  return "light";
}

function applyTheme(next: ThemeMode) {
  try {
    document.documentElement.setAttribute("data-theme", next);
    document.body.setAttribute("data-theme", next);
  } catch {}
}

export default function Topbar() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  // Initialize theme on first mount
  useEffect(() => {
    const t = readTheme();
    setTheme(t);
    applyTheme(t);
  }, []);

  const nextTheme = useMemo<ThemeMode>(() => (theme === "light" ? "dark" : "light"), [theme]);

  const toggleTheme = () => {
    const next = nextTheme;
    setTheme(next);
    applyTheme(next);
    try {
      window.localStorage.setItem("carefulliq_theme", next);
    } catch {}
  };

  return (
    <header
      className={styles.topbar}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--cf-card)",
        borderBottom: "1px solid rgba(15,23,42,0.10)",
        padding: "12px 16px",
      }}
    >
      <div
        className={styles.topbarInner}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #1e7dd7, #5fb4ff)",
              boxShadow: "0 16px 30px rgba(30,125,215,0.22)",
              color: "white",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            CF
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>CareFull IQ</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Caregiver CRM</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={toggleTheme}
            className={styles.iconBtn}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "rgba(255,255,255,0.70)",
              fontWeight: 800,
              cursor: "pointer",
            }}
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            <span style={{ width: 20, height: 20, display: "inline-flex" }}>
              {theme === "light" ? <MoonIcon /> : <SunIcon />}
            </span>
            <span style={{ fontSize: 13 }}>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* --- Icons --- */

function SunIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon({ width = 20, height = 20 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8 8 0 0 1 9.5 3 6.5 6.5 0 1 0 21 14.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
