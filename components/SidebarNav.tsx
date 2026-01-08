"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/components/shell.module.css";
import {
  HeartIcon,
  HomeIcon,
  CaregiversIcon,
  ClientsIcon,
  ClipboardIcon,
  ListIcon,
  LogoutIcon,
} from "@/components/icons";
import LogoutNavButton from "@/components/LogoutNavButton";

const NAV = [
  { href: "/home", label: "Dashboard", icon: HomeIcon },
  { href: "/caregivers", label: "Caregivers", icon: CaregiversIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/daily-log", label: "Daily Log", icon: ClipboardIcon },
  { href: "/logs", label: "Daily Logs", icon: ListIcon },
];

export default function SidebarNav() {
  const path = usePathname();

  return (
    <>
      {/* App mark */}
      <div className={styles.brandDot} title="CareFull IQ">
        <HeartIcon width={26} height={26} />
      </div>

      {/* Primary navigation */}
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

      {/* Logout (directly under Daily Logs) */}
      <LogoutNavButton />

      {/* Spacer pushes utility buttons to bottom */}
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
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </a>
    </>
  );
}
