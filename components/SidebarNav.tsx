"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import styles from "@/components/shell.module.css";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function SidebarNav() {
  const pathname = usePathname();

  const items: NavItem[] = useMemo(
    () => [
      { href: "/home", label: "Home", icon: <HomeIcon /> },
      { href: "/clients", label: "Clients", icon: <UsersIcon /> },
      { href: "/caregivers", label: "Caregivers", icon: <ShieldIcon /> },
      { href: "/daily-log", label: "Daily Log", icon: <PencilIcon /> },
      { href: "/logs", label: "Logs", icon: <ListIcon /> },
    ],
    []
  );

  return (
    <nav
      className={styles.sidebar}
      style={{
        width: 260,
        padding: 16,
        borderRight: "1px solid rgba(15,23,42,0.10)",
        minHeight: "100vh",
        background: "var(--cf-card)",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            aria-hidden
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #1e7dd7, #5fb4ff)",
              boxShadow: "0 16px 30px rgba(30,125,215,0.22)",
              color: "white",
              fontWeight: 900,
            }}
          >
            CF
          </div>

          <div>
            <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>CareFull IQ</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Dashboard</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={styles.sidebarLink}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 14,
                textDecoration: "none",
                fontWeight: 800,
                color: "var(--cf-text)",
                background: active ? "rgba(30,125,215,0.12)" : "transparent",
                border: active ? "1px solid rgba(30,125,215,0.25)" : "1px solid transparent",
              }}
            >
              <span style={{ width: 22, height: 22, display: "inline-flex" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(15,23,42,0.10)" }}>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>
          Tip: Use the top right button to sign out.
        </p>
      </div>
    </nav>
  );
}

/* --- Icons (simple inline SVGs) --- */

function ShieldIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HomeIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UsersIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PencilIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ListIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 6h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 12h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 18h13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 6h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 12h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M3 18h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
