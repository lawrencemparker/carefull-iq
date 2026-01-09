"use client";

import { RequireAdmin } from "@/app/components/RequireAdmin";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./adminUsers.module.css";

type AdminRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: string;
};

export default function AdminUsersPage() {
  // Add Admin
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Manage Admins
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  // Edit modal-ish state (simple inline edit)
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const origin = useMemo(() => {
    return typeof window !== "undefined" ? window.location.origin : "";
  }, []);

  async function getJwt(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function refreshAdmins() {
    setLoadingAdmins(true);
    setAdminStatus(null);
    try {
      const jwt = await getJwt();
      if (!jwt) {
        setAdminStatus("You are not logged in.");
        return;
      }

      const res = await fetch("/api/admin/users/list", {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      // If an API route returns HTML (like a 404 page), res.json() will throw.
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          "Admin list API did not return JSON. Confirm /api/admin/users/list exists on Vercel and is deployed."
        );
      }

      if (!res.ok) throw new Error(json.error || "Failed to load admins");
      setAdmins(Array.isArray(json.admins) ? json.admins : []);
    } catch (e: any) {
      setAdminStatus(e?.message || "Failed to load admins");
    } finally {
      setLoadingAdmins(false);
    }
  }

  useEffect(() => {
    refreshAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createAdmin() {
    setBusy(true);
    setStatus(null);
    try {
      const jwt = await getJwt();
      if (!jwt) {
        setStatus("You are not logged in.");
        return;
      }

      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          temp_password: tempPassword || undefined,
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          "Create admin API did not return JSON. Confirm /api/admin/users/create exists and is deployed."
        );
      }

      if (!res.ok) throw new Error(json.error || "Failed to create admin");

      setStatus("Admin created successfully.");
      setEmail("");
      setFullName("");
      setTempPassword("");
      await refreshAdmins();
    } catch (e: any) {
      setStatus(e?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(a: AdminRow) {
    setEditing(a);
    setEditName(a.full_name || "");
    setEditActive(!!a.is_active);
    setAdminStatus(null);
  }

  function cancelEdit() {
    setEditing(null);
    setEditName("");
    setEditActive(true);
  }

  async function saveEdit() {
    if (!editing) return;

    setAdminStatus(null);
    try {
      const jwt = await getJwt();
      if (!jwt) {
        setAdminStatus("You are not logged in.");
        return;
      }

      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          user_id: editing.user_id,
          full_name: editName,
          is_active: editActive,
        }),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(
          "Update admin API did not return JSON. Confirm /api/admin/users/update exists and is deployed."
        );
      }

      if (!res.ok) throw new Error(json.error || "Failed to update admin");

      setAdminStatus("Admin updated.");
      setEditing(null);
      await refreshAdmins();
    } catch (e: any) {
      setAdminStatus(e?.message || "Failed to update admin");
    }
  }

  async function resetPassword(emailAddr: string | null) {
    if (!emailAddr) {
      setAdminStatus("This admin has no email on file.");
      return;
    }

    setAdminStatus(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailAddr, {
        redirectTo: `${origin}/login`,
      });
      if (error) throw new Error(error.message);

      setAdminStatus(`Password reset email sent to ${emailAddr}.`);
    } catch (e: any) {
      setAdminStatus(e?.message || "Failed to send reset email");
    }
  }

  return (
    <RequireAdmin>
      <div className={styles.page}>
        <h1 style={{ margin: 0, fontWeight: 900 }}>User Management</h1>
        <p className={styles.subtitle}>
          Add and manage admins without using the Supabase dashboard.
        </p>

        {/* Add Admin */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Add Admin</h2>

          <div className={styles.formGrid}>
            <label className={styles.label}>Full name</label>
            <input
              className={styles.input}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Admin"
            />

            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />

            <label className={styles.label}>Temporary password (optional)</label>
            <input
              className={styles.input}
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Optional"
            />

            <button disabled={busy} onClick={createAdmin} style={{ marginTop: 8 }}>
              {busy ? "Creating..." : "Create Admin"}
            </button>

            {status && <div style={{ marginTop: 8, fontWeight: 700 }}>{status}</div>}
          </div>
        </section>

        {/* Manage Admins */}
        <section className={styles.panel}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 10,
            }}
          >
            <h2 className={styles.panelTitle} style={{ margin: 0 }}>
              Manage Admins
            </h2>
            <button onClick={refreshAdmins} disabled={loadingAdmins}>
              {loadingAdmins ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <p className={styles.muted}>Edit admin details and send password reset emails.</p>

          {adminStatus && <div style={{ marginTop: 8, fontWeight: 700 }}>{adminStatus}</div>}

          {admins.length === 0 ? (
            <div style={{ marginTop: 10, opacity: 0.85 }}>No admins found.</div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {admins.map((a) => {
                const isEditing = editing?.user_id === a.user_id;

                return (
                  <div key={a.user_id} className={styles.row}>
                    <div style={{ minWidth: 0 }}>
                      {isEditing ? (
                        <>
                          <div style={{ display: "grid", gap: 8 }}>
                            <input
                              className={styles.input}
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Full name"
                            />

                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <input
                                type="checkbox"
                                checked={editActive}
                                onChange={(e) => setEditActive(e.target.checked)}
                              />
                              <span className={styles.label} style={{ fontWeight: 800 }}>
                                Active
                              </span>
                            </label>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.rowTitle}>{a.full_name || "Unnamed admin"}</div>
                          <div className={styles.rowMeta}>
                            {a.email || "No email"} • {a.is_active ? "Active" : "Inactive"}
                          </div>
                        </>
                      )}
                    </div>

                    <div className={styles.actions}>
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => openEdit(a)}>Edit</button>
                          <button className={styles.danger} onClick={() => resetPassword(a.email)}>
                            Reset Password
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <Link href="/home">← Back to Dashboard</Link>
          </div>
        </section>
      </div>
    </RequireAdmin>
  );
}
