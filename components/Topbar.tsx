"use client";
import { useEffect, useState } from "react";
import styles from "@/components/shell.module.css";
import Image from "next/image";

export default function Topbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const readTheme = () => {
      try {
        const stored = window.localStorage.getItem("carefulliq_theme");
        if (stored === "dark" || stored === "light") return stored;
      } catch {}
      const bodyTheme = document.body.getAttribute("data-theme");
      return bodyTheme === "dark" ? "dark" : "light";
    };

    setTheme(readTheme());

    const onThemeChange = (e: Event) => {
      const ce = e as CustomEvent<{ theme?: "light" | "dark" }>;
      if (ce?.detail?.theme === "dark" || ce?.detail?.theme === "light") {
        setTheme(ce.detail.theme);
      } else {
        setTheme(readTheme());
      }
    };

    window.addEventListener("carefulliq_themechange", onThemeChange);
    return () => window.removeEventListener("carefulliq_themechange", onThemeChange);
  }, []);

  return (
    <div className={styles.topbar}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Image src="/careFullIQ.png" alt="CareFull IQ" width={140} height={36} style={{ height: 36, width: "auto" }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
       <button
  type="button"
  className={`${styles.btn} ${styles.btnSecondary}`}
  style={{ borderRadius: 999, padding: "10px 12px", fontWeight: 900 }}
  onClick={() => {
  const next = theme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  try {
    window.localStorage.setItem("carefulliq_theme", next);
  } catch {}

  setTheme(next);

  // keep your existing listener pattern working
  window.dispatchEvent(new CustomEvent("carefulliq_themechange", { detail: { theme: next } }));
}}

>
  {theme === "dark" ? "Light mode" : "Dark mode"}
</button>



        <div className={styles.pill} title="Workflow">
          <div className={styles.pillDot} />
          <span className={styles.pillText}>Daily Logs • Clients • Caregivers</span>
        </div>

        <div className={styles.dbchip} title="Mock database">
          <div className={styles.dbDot} aria-hidden="true" />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
            <span className={styles.dbLabel}>DB: Local (mock)</span>
            <span className={styles.dbHint}>No external database</span>
          </div>
        </div>
      </div>
    </div>
  );
}
