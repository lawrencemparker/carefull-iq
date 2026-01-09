"use client";
import styles from "./adminUsers.module.css";


import { RequireAdmin } from "@/app/components/RequireAdmin";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminRow = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
  role: string;
};

export default function AdminUsersPage() {
  // Create Admin (existing)
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Manage Admins (new)
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);

  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

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
      if (!res.ok) throw new Error(json.error || "Failed");

      setStatus("Admin created successfully.");
      setEmail("");
      setFullName("");
      setTempPassword("");
      await refreshAdmins();
    } catch (e: any) {
      setStatus(e.message || "Error");
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

  async function resetPassword(email: string | null) {
    if (!email) {
      setAdminStatus("This admin has no email on file.");
      return;
    }
    setAdminStatus(null);
    try {
      // Supabase sends a reset email. This is the recommended approach.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/login`,
      });
      if (error) throw new Error(error.message);

      setAdminStatus(`Password reset email sent to ${email}.`);
    } catch (e: any) {
      setAdminStatus(e.message || "Failed to send reset email");
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
        </div>
      </section>

      {/* Manage Admins */}
      <section className={styles.panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className={styles.panelTitle}>Manage Admins</h2>
          <button onClick={loadAdmins}>Refresh</button>
        </div>

        <p className={styles.muted}>Edit admin details and send password reset emails.</p>

        {admins.map((a) => (
          <div key={a.user_id} className={styles.row}>
            <div>
              <div className={styles.rowTitle}>{a.full_name}</div>
              <div className={styles.rowMeta}>{a.email} • Active</div>
            </div>

            <div className={styles.actions}>
              <button>Edit</button>
              <button className={styles.danger} onClick={() => resetPassword(a.email)}>
                Reset Password
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  </RequireAdmin>
);

/* --- Styles (matches your current vibe) --- */

function card(): React.CSSProperties {
  return {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.65)",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
  };
}

function rowCard(): React.CSSProperties {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 12px 22px rgba(15,23,42,0.08)",
  };
}

function label(): React.CSSProperties {
  return { fontWeight: 800, color: "#0f172a" };
}

function primaryBtn(): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    border: "none",
    color: "white",
    background: "linear-gradient(135deg, #1e7dd7, #5fb4ff)",
    boxShadow: "0 16px 30px rgba(30,125,215,0.22)",
    cursor: "pointer",
  };
}

function secondaryBtn(): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.72)",
    color: "#0f172a",
    boxShadow: "0 12px 22px rgba(15,23,42,0.10)",
    cursor: "pointer",
  };
}

function dangerBtn(): React.CSSProperties {
  return {
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 900,
    border: "none",
    color: "white",
    background: "linear-gradient(135deg, #dc2626, #f87171)",
    boxShadow: "0 16px 30px rgba(220,38,38,0.20)",
    cursor: "pointer",
  };
}
