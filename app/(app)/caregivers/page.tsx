"use client";

import { useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";

export default function CaregiversPage() {
  const { caregivers, addCaregiver, updateCaregiver, deleteCaregiver } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);

  const editing = useMemo(() => caregivers.find((c) => c.id === editingId) ?? null, [caregivers, editingId]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
  };

  const startEdit = (id: number) => {
    const c = caregivers.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = () => {
    if (!name.trim()) return alert("Caregiver name is required.");
    const payload = { name: name.trim(), email: email.trim(), phone: phone.trim() };
    if (editingId) updateCaregiver(editingId, payload);
    else addCaregiver(payload);
    reset();
  };

  return (
    <>
      <div className={`${styles.card} ${styles.cardStrong}`}>
        <p className={styles.sectionTitle}>Onboarding</p>
        <h2 style={{ margin: "0 0 12px" }}>{editing ? "Edit Caregiver" : "Add Caregiver"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 640 }}>
          <label>
            Caregiver Full Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Maria Thompson" />
          </label>
          <label>
            Email Address
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="e.g., maria@email.com" />
          </label>
          <label>
            Phone Number
            <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="e.g., (555) 123-4567" />
          </label>
        </div>

        <div className={styles.btnRow}>
          <button className={styles.btn} type="button" onClick={onSave}>
            {editing ? "Save Changes" : "Save Caregiver"}
          </button>
          {editing && (
            <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={reset}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.sectionTitle}>Directory</p>
        <h2 style={{ margin: "0 0 10px" }}>Manage Caregivers</h2>
        <p className={styles.muted} style={{ margin: "0 0 12px" }}>
          Update caregiver contact info or remove a caregiver from the list.
        </p>

        {caregivers.map((c) => (
          <div key={c.id} className={styles.row}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>{c.name}</h3>
              <div className={`${styles.muted} ${styles.rowSub}`}>
                {c.email} • {c.phone}
              </div>
            </div>
            <div className={styles.rowActions}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => startEdit(c.id)}>
                Edit
              </button>
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                type="button"
                onClick={() => {
                  if (confirm("Delete this caregiver? Logs will keep snapshot names.")) deleteCaregiver(c.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <div className={styles.muted} style={{ fontSize: 12 }}>
          Total caregivers: <b>{caregivers.length}</b>.
        </div>
      </div>
    </>
  );
}
