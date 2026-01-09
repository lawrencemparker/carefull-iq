"use client";

import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";

export default function KPIRail() {
  const { clients, caregivers, logs } = useStore();

  return (
    <div className={styles.card} style={{ minHeight: 260 }}>
      <p className={styles.sectionTitle}>At-a-glance</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <div className={`${styles.card} ${styles.cardStrong}`} style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
          <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
            Clients
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>{clients.length}</div>
          <div className={styles.muted} style={{ fontSize: 12 }}>
            Active client profiles
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardStrong}`} style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
          <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
            Caregivers
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>{caregivers.length}</div>
          <div className={styles.muted} style={{ fontSize: 12 }}>
            Onboarded caregivers
          </div>
        </div>

        <div className={`${styles.card} ${styles.cardStrong}`} style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
          <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
            Logs
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>{logs.length}</div>
          <div className={styles.muted} style={{ fontSize: 12 }}>
            Recorded daily logs
          </div>
        </div>
      </div>
    </div>
  );
}
