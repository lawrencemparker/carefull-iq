"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";
import { useRouter, useSearchParams } from "next/navigation";

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export default function DailyLogPage() {
  const { caregivers, clients, logs, addLog, updateLog } = useStore();
  const router = useRouter();
  const sp = useSearchParams();
  const editId = sp.get("edit") ? Number(sp.get("edit")) : null;

  const editing = useMemo(() => (editId ? logs.find((l) => l.id === editId) ?? null : null), [editId, logs]);

  const [caregiverId, setCaregiverId] = useState<number | null>(caregivers[0]?.id ?? null);
  const [clientId, setClientId] = useState<number | null>(clients[0]?.id ?? null);
  const [date, setDate] = useState(todayISO());
  const [bp, setBp] = useState("");
  const [b, setB] = useState<"Yes" | "No">("Yes");
  const [l, setL] = useState<"Yes" | "No">("Yes");
  const [d, setD] = useState<"Yes" | "No">("No");
  const [ot, setOt] = useState<"Yes" | "No">("No");
  const [pt, setPt] = useState<"Yes" | "No">("No");
  const [n, setN] = useState<"Yes" | "No">("No");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!editing) return;
    setCaregiverId(editing.caregiverId);
    setClientId(editing.clientId);
    setDate(editing.date);
    setBp(editing.bp);
    setB(editing.meals.b);
    setL(editing.meals.l);
    setD(editing.meals.d);
    setOt(editing.visits.ot);
    setPt(editing.visits.pt);
    setN(editing.visits.n);
    setNotes(editing.notes);
  }, [editing]);

  const onSubmit = () => {
    if (!caregiverId) return alert("Select a caregiver.");
    if (!clientId) return alert("Select a client.");
    const payload = {
      caregiverId,
      clientId,
      date,
      bp,
      meals: { b, l, d },
      visits: { ot, pt, n },
      notes,
    };

    if (editing) {
      updateLog(editing.id, payload);
      router.replace("/logs");
      return;
    }

    addLog(payload);
    router.push("/logs");
  };

  const onCancelEdit = () => router.replace("/daily-log");

  return (
    <div className={`${styles.card} ${styles.cardStrong}`}>
      <p className={styles.sectionTitle}>Documentation</p>
      <h2 style={{ margin: "0 0 12px" }}>{editing ? `Edit Log #${editing.id}` : "Daily Log"}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 640 }}>
        <label>
          Caregiver
          <select value={caregiverId ?? ""} onChange={(e) => setCaregiverId(Number(e.target.value))}>
            {caregivers.map((cg) => (
              <option key={cg.id} value={cg.id}>
                {cg.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Client
          <select value={clientId ?? ""} onChange={(e) => setClientId(Number(e.target.value))}>
            {clients.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label style={{ maxWidth: 640 }}>
        Blood Pressure
        <input value={bp} onChange={(e) => setBp(e.target.value)} placeholder="e.g., 120/80" />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 640, marginTop: 6 }}>
        <div className={styles.card} style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
          <p className={styles.sectionTitle} style={{ marginBottom: 6 }}>
            Meals
          </p>
          <label>
            Breakfast
            <select value={b} onChange={(e) => setB(e.target.value as any)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label>
            Lunch
            <select value={l} onChange={(e) => setL(e.target.value as any)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label>
            Dinner
            <select value={d} onChange={(e) => setD(e.target.value as any)}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
        </div>

        <div className={styles.card} style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
          <p className={styles.sectionTitle} style={{ marginBottom: 6 }}>
            Visits
          </p>
          <label>
            Occupational Therapy
            <select value={ot} onChange={(e) => setOt(e.target.value as any)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
          <label>
            Physical Therapy
            <select value={pt} onChange={(e) => setPt(e.target.value as any)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
          <label>
            Nurse Visit
            <select value={n} onChange={(e) => setN(e.target.value as any)}>
              <option>No</option>
              <option>Yes</option>
            </select>
          </label>
        </div>
      </div>

      <label style={{ maxWidth: 640 }}>
        Notes
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations, mood, mobility, concerns" />
      </label>

      <div className={styles.btnRow}>
        <button className={styles.btn} type="button" onClick={onSubmit}>
          {editing ? "Save Log" : "Submit Log"}
        </button>
        {editing && (
          <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={onCancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>
    </div>
  );
}
