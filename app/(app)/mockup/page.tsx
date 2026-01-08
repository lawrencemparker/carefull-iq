import styles from "@/components/shell.module.css";

export default function MockupPage() {
  return (
    <div className={styles.card}>
      <p className={styles.sectionTitle}>Reference</p>
      <h2 style={{ margin: "0 0 10px" }}>Mockup</h2>
      <p className={styles.muted} style={{ margin: 0 }}>
        Phase 2 is implemented as real routes (/home, /caregivers, /clients, /daily-log, /logs). If you want the original
        single-file HTML mockup as a static reference, place it at <b>public/mockup.html</b> and open <b>/mockup.html</b>.
      </p>
    </div>
  );
}
