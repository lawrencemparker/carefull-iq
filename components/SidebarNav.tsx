"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/components/shell.module.css";
import {
  HeartIcon,
  HomeIcon,
  CaregiversIcon,
  ClientsIcon,
  ClipboardIcon,
  ListIcon,
  AdminShieldIcon,
} from "@/components/icons";
import { supabase } from "@/app/lib/supabaseClient";

const NAV = [
  { href: "/home", label: "Dashboard", icon: HomeIcon },
  { href: "/caregivers", label: "Caregivers", icon: CaregiversIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/daily-log", label: "Daily Log", icon: ClipboardIcon },
  { href: "/logs", label: "Daily Logs", icon: ListIcon },
];

export default function SidebarNav() {
  const path = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadRole() {
      try {
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;

        if (!userId) {
          if (alive) setIsAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) {
          if (alive) setIsAdmin(false);
          return;
        }

        if (alive) setIsAdmin(profile?.role === "admin");
      } catch {
        if (alive) setIsAdmin(false);
      }
    }

    loadRole();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className={styles.brandDot} title="CareFull IQ">
        <HeartIcon width={26} height={26} />
      </div>

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

      {/* Admin-only: User Management */}
      {isAdmin && (
        <Link
          href="/admin/users"
          className={`${styles.navbtn} ${path === "/admin/users" ? styles.navbtnActive : ""}`}
          aria-label="Admin Users"
          title="Admin Users"
        >
          <AdminShieldIcon width={22} height={22} />
        </Link>
      )}

      <div style={{ flex: 1 }} />

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
