"use client";

import { RequireAdmin } from "@/app/components/RequireAdmin";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";

export default function AdminUsersPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createAdmin() {
    setBusy(true);
    setStatus(null);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setStatus("You are not logged in.");
        return;
      }

      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    } catch (err: any) {
      setStatus(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireAdmin>
      <div style={{ padding: 24, maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontWeight: 900 }}>User Management</h1>

        <p style={{ color: "#64748b", marginTop: 8 }}>
          Add new admins without using the Supabase dashboard.
        </p>

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          <label style={{ fontWeight: 800 }}>Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Admin"
          />

          <label style={{ fontWeight: 800 }}>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
          />

          <label style={{ fontWeight: 800 }}>
            Temporary password (optional)
          </label>
          <input
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            placeholder="Leave blank to invite/reset later"
          />

          <button
            disabled={busy}
            onClick={createAdmin}
            style={{ marginTop: 8 }}
          >
            {busy ? "Creating..." : "Create Admin"}
          </button>

          {status && (
            <div style={{ marginTop: 8, fontWeight: 700 }}>
              {status}
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <Link href="/home">← Back to Dashboard</Link>
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}
