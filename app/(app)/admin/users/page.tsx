"use client";

import { RequireAdmin } from "@/app/components/RequireAdmin";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "@/components/shell.module.css";

type AdminRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: string;
};

export default function AdminUsersPage() {
  // Create Admin
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Manage Admins
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  // Edit Admin
  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );

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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load admins");

      setAdmins(json.admins || []);
    } catch (e: any) {
      setAdminStatus(e.message || "Failed to load admins");
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create admin");

      setStatus("Admin created successfully.");
      setEmail("");
      setFullName("");
      setTempPassword("");
      await refreshAdmins();
    } catch (e: any) {
      setStatus(e.message || "Error creating admin");
    } finally {
      setBusy(false);
    }
  }

  function openEdit(a: AdminRow) {
    setEditing(a);
    setEditName(a.full_name || "");
    setEditActive(!!a.is_active);
    setAdminStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update admin");

      setAdminStatus("Admin updated.");
      setEditing(null);
      await refreshAdmins();
    } catch (e: any) {
      setAdminStatus(e.message || "Failed to update admin");
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
      setAdminStatus(e.message || "Failed to send reset email");
    }
  }

  return (
    <RequireAdmin>
      <>
        {/* Add/Edit Admin (matches Add Caregiver card) */}
        <div className={`${styles.card} ${styles.cardStrong}`}>
          <p className={styles.sectionTitle}>Onboarding</p>
          <h2 style={{ margin: "0 0 12px" }}>
            {editing ? "Edit Admin" : "Add Admin"}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 10,
              maxWidth: 640,
            }}
          >
            <label>
              Full name
              <input
                value={editing ? editName : fullName}
                onChange={(e) =>
                  editing ? setEditName(e.target.value) : setFullName(e.target.value)
                }
                placeholder="Jane Admin"
              />
            </label>

            {!editing && (
              <>
                <label>
                  Email
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    type="email"
                  />
                </label>

                <label>
                  Temporary password (optional)
                  <input
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    placeholder="Optional"
                    type="password"
                  />
                </label>
              </>
            )}

            {editing && (
              <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                Active
              </label>
            )}
          </div>

          <div className={styles.btnRow}>
            {!editing ? (
              <button
                className={styles.btn}
                type="button"
                disabled={busy}
                onClick={createAdmin}
              >
                {busy ? "Creating..." : "Create Admin"}
              </button>
            ) : (
              <>
                <button className={styles.btn} type="button" onClick={saveEdit}>
                  Save Changes
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancel Edit
                </button>
              </>
            )}
          </div>

          {status && (
            <div className={styles.muted} style={{ marginTop: 10, fontWeight: 700 }}>
              {status}
            </div>
          )}
        </div>

        {/* Manage Admins (matches Manage Caregivers card) */}
        <div className={styles.card} style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div>
              <p className={styles.sectionTitle}>Directory</p>
              <h2 style={{ margin: "0 0 10px" }}>Manage Admins</h2>
            </div>

            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              type="button"
              onClick={refreshAdmins}
              disabled={loadingAdmins}
            >
              {loadingAdmins ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <p className={styles.muted} style={{ margin: "0 0 12px" }}>
            Edit admin details and send password reset emails.
          </p>

          {adminStatus && (
            <div className={styles.muted} style={{ margin: "0 0 12px", fontWeight: 700 }}>
              {adminStatus}
            </div>
          )}

          {admins.map((a) => (
            <div key={a.user_id} className={styles.row}>
              <div>
                <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>
                  {a.full_name || "(No name)"}
                </h3>
                <div className={`${styles.muted} ${styles.rowSub}`}>
                  {a.email || "(No email)"} • {a.is_active ? "Active" : "Inactive"}
                </div>
              </div>

              <div className={styles.rowActions}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  type="button"
                  onClick={() => openEdit(a)}
                >
                  Edit
                </button>

                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  type="button"
                  onClick={() => resetPassword(a.email)}
                >
                  Reset Password
                </button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 18 }}>
            <Link href="/home">← Back to Dashboard</Link>
          </div>
        </div>
      </>
    </RequireAdmin>
  );
}
