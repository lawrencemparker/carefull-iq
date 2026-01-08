"use client";

import { useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = useMemo(() => clients.find((c) => c.id === editingId) ?? null, [clients, editingId]);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [medications, setMedications] = useState("");
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [reason, setReason] = useState("");

  const reset = () => {
    setEditingId(null);
    setName("");
    setDob("");
    setMedications("");
    setInsuranceCompany("");
    setPolicyNumber("");
    setAllergies("");
    setEmName("");
    setEmPhone("");
    setReason("");
  };

  const startEdit = (id: number) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.name);
    setDob(c.dob);
    setMedications(c.medications);
    setInsuranceCompany(c.insuranceCompany);
    setPolicyNumber(c.policyNumber);
    setAllergies(c.allergies);
    setEmName(c.emergencyContactName);
    setEmPhone(c.emergencyContactPhone);
    setReason(c.reason);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = () => {
    if (!name.trim()) return alert("Client name is required.");
    const payload = {
      name: name.trim(),
      dob,
      medications,
      insuranceCompany,
      policyNumber,
      allergies,
      emergencyContactName: emName,
      emergencyContactPhone: emPhone,
      reason,
    };
    if (editingId) updateClient(editingId, payload);
    else addClient(payload);
    reset();
  };

  return (
    <>
      <div className={`${styles.card} ${styles.cardStrong}`}>
        <p className={styles.sectionTitle}>Onboarding</p>
        <h2 style={{ margin: "0 0 12px" }}>{editing ? "Edit Client" : "Add Client"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 640 }}>
          <label>
            Client Full Name <small>First and last name is required.</small>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lola Smith" />
          </label>
          <label>
            Birthdate
            <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
          </label>
          <label>
            Medications
            <textarea value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="List meds (e.g., Amlodipine 5mg daily)"/>
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Insurance Company
              <input value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} placeholder="e.g., Blue Cross Blue Shield" />
            </label>
            <label>
              Policy #
              <input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g., ABC123456" />
            </label>
          </div>

          <label>
            Allergies
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g., Penicillin" />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Emergency Contact Name
              <input value={emName} onChange={(e) => setEmName(e.target.value)} placeholder="e.g., Jordan Smith" />
            </label>
            <label>
              Emergency Contact Phone
              <input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} type="tel" placeholder="e.g., (555) 222-3333" />
            </label>
          </div>

          <label>
            Reason for Caregiving Needs
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., post-surgery recovery, dementia support, mobility assistance" />
          </label>
        </div>

        <div className={styles.btnRow}>
          <button className={styles.btn} type="button" onClick={onSave}>
            {editing ? "Save Changes" : "Save Client"}
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
        <h2 style={{ margin: "0 0 10px" }}>Manage Clients</h2>
        <p className={styles.muted} style={{ margin: "0 0 12px" }}>
          Update client profile details or remove a client from the list.
        </p>

        {clients.map((c) => (
          <div key={c.id} className={styles.row}>
            <div style={{ maxWidth: 520 }}>
              <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>{c.name}</h3>
              <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                DOB: {c.dob || "—"} • Allergies: {c.allergies || "—"}
              </div>
              <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                Emergency: {c.emergencyContactName || "—"} • {c.emergencyContactPhone || "—"}
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
                  if (confirm("Delete this client? Logs will keep snapshot names.")) deleteClient(c.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <div className={styles.muted} style={{ fontSize: 12 }}>
          Total clients: <b>{clients.length}</b>.
        </div>
      </div>
    </>
  );
}
