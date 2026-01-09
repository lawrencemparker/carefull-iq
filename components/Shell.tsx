import React from "react";
import styles from "@/components/shell.module.css";
import SidebarNav from "@/components/SidebarNav";
import Topbar from "@/components/Topbar";
import LogoutButton from "@/app/components/LogoutButton";


export default function Shell({
  children,
  rightRail,
}: {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
}) {
  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar} aria-label="Primary">
        <SidebarNav />
      </aside>

      <main className={styles.shell} role="main">
        <Topbar />
        <div className={styles.content}>
          <div className={styles.layoutGrid}>
            <section>{children}</section>
            <aside>{rightRail}</aside>
          </div>
        </div>
      </main>
    </div>
  );
}
