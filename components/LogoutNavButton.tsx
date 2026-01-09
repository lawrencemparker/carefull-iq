"use client";

import { useRouter } from "next/navigation";
import styles from "@/components/shell.module.css";
import { supabase } from "@/app/lib/supabaseClient";

 // adjust if your export name differs

export default function LogoutNavButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.navbtn}
      title="Log out"
      aria-label="Log out"
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      {/* Logout icon: arrow exiting a door */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 17l-1 0a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1" />
        <path d="M15 12H9" />
        <path d="M15 12l-2-2" />
        <path d="M15 12l-2 2" />
        <path d="M17 7h2v10h-2" />
      </svg>
    </button>
  );
}
