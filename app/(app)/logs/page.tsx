"use client";

import { useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";
import Link from "next/link";

function statusChip(label: string, ok: boolean) {
  const bg = ok ? "rgba(209,250,229,0.70)" : "rgba(254,226,226,0.75)";
  const color = ok ? "var(--ok-ink)" : "var(--warn-ink)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        marginRight: 8,
        border: "1px solid rgba(15,23,42,0.06)",
        background: bg,
        color,
      }}
    >
      {label}
    </span>
  );
}

export default function LogsPage() {
  const { clients, logs } = useStore();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filterClient, setFilterClient] = useState<string>("All");

  const filtered = useMemo(() => {
    if (filterClient === "All") return logs.slice().sort((a, b) => b.id - a.id);
    const id = Number(filterClient);
    return logs.filter((l) => l.clientId === id).slice().sort((a, b) => b.id - a.id);
  }, [filterClient, logs]);

  return (
    <div className={`${styles.card} ${styles.cardStrong}`}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <p className={styles.sectionTitle}>Review</p>
          <h2 style={{ margin: 0 }}>Daily Logs</h2>
          <p className={styles.muted} style={{ margin: "8px 0 0" }}>
            Click a log card to expand details. Use the filter to narrow results. Click “Edit Log” to update it.
          </p>
        </div>
        <div className={styles.btnRow} style={{ marginTop: 0 }}>
          <Link className={`${styles.btn} ${styles.btnSecondary}`} href="/daily-log">
            New Daily Log
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 14, maxWidth: 360 }}>
        <label style={{ margin: 0 }}>
          Filter by Client
          <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
            <option value="All">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        {filtered.map((log) => {
          const isOpen = expanded === log.id;
          const mealsOk = log.meals.b === "Yes" && log.meals.l === "Yes" && log.meals.d === "Yes";
          const visitsOk = log.visits.ot === "No" && log.visits.pt === "No" && log.visits.n === "No";

          return (
            <div
              key={log.id}
              onClick={() => setExpanded((v) => (v === log.id ? null : log.id))}
              style={{
                cursor: "pointer",
                userSelect: "none",
                marginBottom: 14,
                borderRadius: "var(--radius-xl)",
                border: "1px solid rgba(255,255,255,0.65)",
                background: "var(--card)",
                boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
                padding: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 950, letterSpacing: "-0.01em" }}>
                    {log.clientName} • {log.date}
                  </div>
                  <div className={styles.muted} style={{ fontSize: 12, marginTop: 6 }}>
                    Caregiver: {log.caregiverName} • BP: {log.bp || "—"}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {statusChip("Meals", mealsOk)}
                    {statusChip("Visits", visitsOk)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <Link
                    href={`/daily-log?edit=${log.id}`}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Edit Log
                  </Link>
                </div>
              </div>

              {isOpen && (
                <div style={{ marginTop: 12, color: "var(--ink)" }}>
                  <div className={styles.muted} style={{ fontSize: 12, marginBottom: 8 }}>
                    Details
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 640 }}>
                    <div>
                      <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
                        Meals
                      </div>
                      <div style={{ fontSize: 13 }}>Breakfast: {log.meals.b}</div>
                      <div style={{ fontSize: 13 }}>Lunch: {log.meals.l}</div>
                      <div style={{ fontSize: 13 }}>Dinner: {log.meals.d}</div>
                    </div>
                    <div>
                      <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
                        Visits
                      </div>
                      <div style={{ fontSize: 13 }}>OT: {log.visits.ot}</div>
                      <div style={{ fontSize: 13 }}>PT: {log.visits.pt}</div>
                      <div style={{ fontSize: 13 }}>Nurse: {log.visits.n}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <div className={styles.muted} style={{ fontSize: 12, fontWeight: 800 }}>
                      Notes
                    </div>
                    <div style={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{log.notes || "—"}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className={styles.muted} style={{ fontSize: 12 }}>
          Showing <b>{filtered.length}</b> logs.
        </div>
      </div>
    </div>
  );
}
