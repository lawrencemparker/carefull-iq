"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/components/shell.module.css";
import {
  HeartIcon,
  HomeIcon,
  CaregiversIcon,
  ClientsIcon,
  ClipboardIcon,
  ListIcon,
} from "@/components/icons";
import { supabase } from "@/app/lib/supabaseClient";

type ProfileRow = {
  role: string;
  is_active: boolean;
};

const NAV = [
  { href: "/home", label: "Dashboard", icon: HomeIcon },
  { href: "/caregivers", label: "Caregivers", icon: CaregiversIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/daily-log", label: "Daily Log", icon: ClipboardIcon },
  { href: "/logs", label: "Daily Logs", icon: ListIcon },
];

/* --- Icons --- */

function ShieldIcon({ width = 22, height = 22 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LogoutIcon({ width = 22, height = 22 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function SidebarNav() {
  const path = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase.rpc("current_profile");
      if (error || !mounted) return;

      const row = (Array.isArray(data) ? data[0] : null) as ProfileRow | null;
      setIsAdmin(!!row && row.role === "admin" && row.is_active === true);
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      {/* Brand */}
      <div className={styles.brandDot} title="CareFull IQ">
        <HeartIcon width={26} height={26} />
      </div>

      {/* Main nav */}
      {NAV.map((n) => {
        const active = path === n.href;
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`${styles.navbtn} ${active ? styles.navbtnActive : ""}`}
            aria-label={n.label}
            title={n.label}
          >
            <Icon width={22} height={22} />
          </Link>
        );
      })}

      {/* Admin section */}
      {isAdmin && (
        <>
          <Link
            href="/admin/users"
            className={`${styles.navbtn} ${
              path === "/admin/users" ? styles.navbtnActive : ""
            }`}
            aria-label="Admin Users"
            title="Admin Users"
          >
            <ShieldIcon />
          </Link>

          {/* Logout button — directly under shield */}
          <button
            type="button"
            onClick={handleLogout}
            className={styles.navbtn}
            aria-label="Log out"
            title="Log out"
          >
            <LogoutIcon />
          </button>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Scroll to top */}
      <a
        href="#top"
        className={styles.navbtn}
        aria-label="Scroll to top"
        title="Top"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </a>
    </>
  );
}
