"use client";

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
      <div style={{ padding: 24, maxWidth: 880 }}>
        <h1 style={{ margin: 0, fontWeight: 900 }}>User Management</h1>
        <p style={{ color: "#64748b", marginTop: 8 }}>
          Add and manage admins without using the Supabase dashboard.
        </p>

        {/* Create Admin */}
        <section style={card()}>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Add Admin</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label style={label()}>Full name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Admin" />

            <label style={label()}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />

            <label style={label()}>Temporary password (optional)</label>
            <input
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              placeholder="Optional"
            />

            <button disabled={busy} onClick={createAdmin} style={primaryBtn()}>
              {busy ? "Creating..." : "Create Admin"}
            </button>

            {status && <div style={{ marginTop: 6, fontWeight: 700 }}>{status}</div>}
          </div>
        </section>

        {/* Manage Admins */}
        <section style={{ ...card(), marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontWeight: 900 }}>Manage Admins</h2>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Edit admin details and send password reset emails.
              </p>
            </div>

            <button onClick={refreshAdmins} disabled={loadingAdmins} style={secondaryBtn()}>
              {loadingAdmins ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {adminStatus && <div style={{ marginTop: 10, fontWeight: 700 }}>{adminStatus}</div>}

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {admins.map((a) => (
              <div key={a.user_id} style={rowCard()}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: 16, color: "#0f172a" }}>
                    {a.full_name || "Unnamed Admin"}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                    {a.email || "No email"} • {a.is_active ? "Active" : "Inactive"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => openEdit(a)} style={secondaryBtn()}>
                    Edit
                  </button>
                  <button
                    onClick={() => resetPassword(a.email)}
                    style={dangerBtn()}
                    title="Send a password reset email"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            ))}

            {!loadingAdmins && admins.length === 0 && (
              <div style={{ color: "#64748b", marginTop: 6 }}>No admins found.</div>
            )}
          </div>
        </section>

        {/* Edit modal (simple inline panel) */}
        {editing && (
          <section style={{ ...card(), marginTop: 14 }}>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Edit Admin</h2>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Updating: <b>{editing.email || editing.user_id}</b>
            </p>

            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
              <label style={label()}>Full name</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} />

              <label style={label()}>Active</label>
              <select value={editActive ? "true" : "false"} onChange={(e) => setEditActive(e.target.value === "true")}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button onClick={saveEdit} style={primaryBtn()}>
                  Save
                </button>
                <button onClick={() => setEditing(null)} style={secondaryBtn()}>
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <div style={{ marginTop: 18 }}>
          <Link href="/home">← Back to Dashboard</Link>
        </div>
      </div>
    </RequireAdmin>
  );
}

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
