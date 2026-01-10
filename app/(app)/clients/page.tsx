"use client";

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { supabase } from "@/app/lib/supabaseClient";

type ClientRow = {
  id: string; // uuid
  full_name: string;
  dob: string | null;
  medications: string | null;
  insurance_company: string | null;
  policy_number: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  reason: string | null;
  is_active: boolean;
  created_at: string;
};

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated.");
  return token;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
  return json as T;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = useMemo(() => clients.find((c) => c.id === editingId) ?? null, [clients, editingId]);

  // Form fields (match your current UI) :contentReference[oaicite:3]{index=3}
=======
import { useMemo, useState } from "react";
import styles from "@/components/shell.module.css";
import { useStore } from "@/components/store";

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useStore();
  const [editingId, setEditingId] = useState<number | null>(null);
  const editing = useMemo(() => clients.find((c) => c.id === editingId) ?? null, [clients, editingId]);

>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
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
<<<<<<< HEAD
    setError(null);
  };

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ clients: ClientRow[] }>("/api/admin/clients/list", { method: "GET" });
      setClients(data.clients || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (id: string) => {
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.full_name || "");
    setDob(c.dob || "");
    setMedications(c.medications || "");
    setInsuranceCompany(c.insurance_company || "");
    setPolicyNumber(c.policy_number || "");
    setAllergies(c.allergies || "");
    setEmName(c.emergency_contact_name || "");
    setEmPhone(c.emergency_contact_phone || "");
    setReason(c.reason || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = async () => {
    setError(null);
    if (!name.trim()) return alert("Client name is required.");

    const payload = {
      full_name: name.trim(),
      dob: dob || null,
      medications: medications || null,
      insurance_company: insuranceCompany || null,
      policy_number: policyNumber || null,
      allergies: allergies || null,
      emergency_contact_name: emName || null,
      emergency_contact_phone: emPhone || null,
      reason: reason || null,
    };

    setBusy(true);
    try {
      if (editingId) {
        await apiFetch("/api/admin/clients/update", {
          method: "PATCH",
          body: JSON.stringify({ client_id: editingId, ...payload }),
        });
      } else {
        await apiFetch("/api/admin/clients/create", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      await loadClients();
      reset();
    } catch (e: any) {
      setError(e?.message || "Failed to save client.");
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (clientId: string, is_active: boolean) => {
    setError(null);
    setBusy(true);
    try {
      await apiFetch("/api/admin/clients/update", {
        method: "PATCH",
        body: JSON.stringify({ client_id: clientId, is_active }),
      });
      await loadClients();
      if (editingId === clientId && !is_active) reset();
    } catch (e: any) {
      setError(e?.message || "Failed to update client status.");
    } finally {
      setBusy(false);
    }
=======
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
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
  };

  return (
    <>
      <div className={`${styles.card} ${styles.cardStrong}`}>
        <p className={styles.sectionTitle}>Onboarding</p>
        <h2 style={{ margin: "0 0 12px" }}>{editing ? "Edit Client" : "Add Client"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 640 }}>
          <label>
            Client Full Name <small>First and last name is required.</small>
<<<<<<< HEAD
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lola Smith" disabled={busy} />
          </label>

          <label>
            Birthdate
            <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" disabled={busy} />
          </label>

          <label>
            Medications
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="List meds (e.g., Amlodipine 5mg daily)"
              disabled={busy}
            />
=======
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Lola Smith" />
          </label>
          <label>
            Birthdate
            <input value={dob} onChange={(e) => setDob(e.target.value)} type="date" />
          </label>
          <label>
            Medications
            <textarea value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="List meds (e.g., Amlodipine 5mg daily)"/>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Insurance Company
<<<<<<< HEAD
              <input value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} placeholder="e.g., Blue Cross Blue Shield" disabled={busy} />
            </label>
            <label>
              Policy #
              <input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g., ABC123456" disabled={busy} />
=======
              <input value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} placeholder="e.g., Blue Cross Blue Shield" />
            </label>
            <label>
              Policy #
              <input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} placeholder="e.g., ABC123456" />
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
            </label>
          </div>

          <label>
            Allergies
<<<<<<< HEAD
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g., Penicillin" disabled={busy} />
=======
            <input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g., Penicillin" />
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <label>
              Emergency Contact Name
<<<<<<< HEAD
              <input value={emName} onChange={(e) => setEmName(e.target.value)} placeholder="e.g., Jordan Smith" disabled={busy} />
            </label>
            <label>
              Emergency Contact Phone
              <input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} type="tel" placeholder="e.g., (555) 222-3333" disabled={busy} />
=======
              <input value={emName} onChange={(e) => setEmName(e.target.value)} placeholder="e.g., Jordan Smith" />
            </label>
            <label>
              Emergency Contact Phone
              <input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} type="tel" placeholder="e.g., (555) 222-3333" />
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
            </label>
          </div>

          <label>
            Reason for Caregiving Needs
<<<<<<< HEAD
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., post-surgery recovery, dementia support, mobility assistance"
              disabled={busy}
            />
          </label>
        </div>

        {error && (
          <p className={styles.muted} style={{ marginTop: 10, color: "crimson" }}>
            {error}
          </p>
        )}

        <div className={styles.btnRow}>
          <button className={styles.btn} type="button" onClick={onSave} disabled={busy}>
            {busy ? "Saving..." : editing ? "Save Changes" : "Save Client"}
          </button>
          {editing && (
            <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={reset} disabled={busy}>
=======
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., post-surgery recovery, dementia support, mobility assistance" />
          </label>
        </div>

        <div className={styles.btnRow}>
          <button className={styles.btn} type="button" onClick={onSave}>
            {editing ? "Save Changes" : "Save Client"}
          </button>
          {editing && (
            <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={reset}>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
<<<<<<< HEAD
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <p className={styles.sectionTitle}>Directory</p>
            <h2 style={{ margin: "0 0 10px" }}>Manage Clients</h2>
            <p className={styles.muted} style={{ margin: "0 0 12px" }}>
              Update client profile details or deactivate a client from the list.
            </p>
          </div>

          <div className={styles.btnRow} style={{ marginTop: 0 }}>
            <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={loadClients} disabled={loading || busy}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {clients.map((c) => (
          <div key={c.id} className={styles.row} style={{ opacity: c.is_active ? 1 : 0.65 }}>
            <div style={{ maxWidth: 520 }}>
              <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>
                {c.full_name}
                {!c.is_active ? " (Inactive)" : ""}
              </h3>
=======
        <p className={styles.sectionTitle}>Directory</p>
        <h2 style={{ margin: "0 0 10px" }}>Manage Clients</h2>
        <p className={styles.muted} style={{ margin: "0 0 12px" }}>
          Update client profile details or remove a client from the list.
        </p>

        {clients.map((c) => (
          <div key={c.id} className={styles.row}>
            <div style={{ maxWidth: 520 }}>
              <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>{c.name}</h3>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
              <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
                DOB: {c.dob || "—"} • Allergies: {c.allergies || "—"}
              </div>
              <div className={styles.muted} style={{ fontSize: 12, marginTop: 4 }}>
<<<<<<< HEAD
                Emergency: {c.emergency_contact_name || "—"} • {c.emergency_contact_phone || "—"}
              </div>
            </div>

            <div className={styles.rowActions}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={() => startEdit(c.id)} disabled={busy}>
                Edit
              </button>

              {c.is_active ? (
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Deactivate this client? Logs and history will remain.")) setActive(c.id, false);
                  }}
                >
                  Deactivate
                </button>
              ) : (
                <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" disabled={busy} onClick={() => setActive(c.id, true)}>
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}

        <div className={styles.muted} style={{ fontSize: 12 }}>
          Total clients: <b>{clients.length}</b>. {loading ? "Loading..." : ""}
=======
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
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
        </div>
      </div>
    </>
  );
}
