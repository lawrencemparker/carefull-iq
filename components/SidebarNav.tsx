"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import styles from "@/components/shell.module.css";

=======
import { useEffect, useState } from "react";
import styles from "@/components/shell.module.css";
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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

<<<<<<< HEAD
function ShieldIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
=======
function ShieldIcon({ width = 22, height = 22 }) {
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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

<<<<<<< HEAD
function LogoutIcon({ width = 22, height = 22 }: { width?: number; height?: number }) {
=======
function LogoutIcon({ width = 22, height = 22 }) {
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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
<<<<<<< HEAD

  const [role, setRole] = useState<string>("caregiver");
=======
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase.rpc("current_profile");
      if (error || !mounted) return;

      const row = (Array.isArray(data) ? data[0] : null) as ProfileRow | null;
<<<<<<< HEAD
      const nextRole = row?.role ?? "caregiver";

      setRole(nextRole);
      setIsAdmin(nextRole === "admin" && row?.is_active === true);
=======
      setIsAdmin(!!row && row.role === "admin" && row.is_active === true);
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

<<<<<<< HEAD
  const visibleNav = useMemo(() => {
    return NAV.filter((n) => {
      // Caregivers can NOT access caregiver management
      if (role !== "admin" && n.href === "/caregivers") return false;
      return true;
    });
  }, [role]);

  async function handleLogout() {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.setAttribute("data-theme", "light");

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
=======
  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
  }

  return (
    <>
      {/* Brand */}
      <div className={styles.brandDot} title="CareFull IQ">
        <HeartIcon width={26} height={26} />
      </div>

      {/* Main nav */}
<<<<<<< HEAD
      {visibleNav.map((n) => {
        const active = path === n.href;
        const Icon = n.icon;

=======
      {NAV.map((n) => {
        const active = path === n.href;
        const Icon = n.icon;
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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

<<<<<<< HEAD
      {/* Logout — directly under Daily Logs */}
      <button
        type="button"
        onClick={handleLogout}
        className={styles.navbtn}
        aria-label="Log out"
        title="Log out"
      >
        <LogoutIcon />
      </button>

      {/* Admin section */}
      {isAdmin && (
        <Link
          href="/admin/users"
          className={`${styles.navbtn} ${path === "/admin/users" ? styles.navbtnActive : ""}`}
          aria-label="Admin Users"
          title="Admin Users"
        >
          <ShieldIcon />
        </Link>
      )}

      {/* Spacer to keep original vertical rhythm */}
=======
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

>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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
