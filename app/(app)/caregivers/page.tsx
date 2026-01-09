"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/components/shell.module.css";
import { supabase } from "@/app/lib/supabaseClient";

type Caregiver = {
  id: string; // uuid
  user_id: string; // uuid
  full_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
};

type ProfileRow = {
  role: string;
  is_active: boolean;
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
  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}

export default function CaregiversPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null); // null = checking
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);

  const editing = useMemo(
    () => caregivers.find((c) => c.id === editingId) ?? null,
    [caregivers, editingId]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const reset = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setError(null);
  };

  const loadCaregivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ caregivers: Caregiver[] }>("/api/admin/caregivers/list", {
        method: "GET",
      });
      setCaregivers(data.caregivers || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load caregivers.");
    } finally {
      setLoading(false);
    }
  };

  // Admin gate: caregivers cannot access this page at all
  useEffect(() => {
    let mounted = true;

    async function gate() {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase.rpc("current_profile");
        if (error) {
          router.replace("/home");
          return;
        }

        const row = (Array.isArray(data) ? data[0] : null) as ProfileRow | null;
        const isAdmin = !!row && row.role === "admin" && row.is_active === true;

        if (!mounted) return;

        if (!isAdmin) {
          setAuthorized(false);
          router.replace("/home");
          return;
        }

        setAuthorized(true);
      } catch {
        router.replace("/home");
      }
    }

    gate();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Only load caregivers AFTER admin gate passes
  useEffect(() => {
    if (authorized !== true) return;
    loadCaregivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  const startEdit = (id: string) => {
    const c = caregivers.find((x) => x.id === id);
    if (!c) return;
    setEditingId(id);
    setName(c.full_name || "");
    setEmail(c.email || "");
    setPhone(c.phone || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = async () => {
    setError(null);

    if (!name.trim()) return alert("Caregiver name is required.");

    // Create = Invite (caregivers must have logins)
    if (!editingId) {
      if (!email.trim()) return alert("Email address is required to invite a caregiver.");
      setBusy(true);
      try {
        await apiFetch<{ ok: boolean; invited_user_id: string; redirectTo: string }>(
          "/api/admin/caregivers/invite",
          {
            method: "POST",
            body: JSON.stringify({
              email: email.trim().toLowerCase(),
              full_name: name.trim(),
              phone: phone.trim(),
            }),
          }
        );
        await loadCaregivers();
        reset();
        alert("Invite sent. The caregiver will receive an email to set their password.");
      } catch (e: any) {
        setError(e?.message || "Failed to invite caregiver.");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Edit = Update caregiver row (name/phone, optionally deactivate/reactivate)
    setBusy(true);
    try {
      await apiFetch<{ caregiver: Caregiver }>("/api/admin/caregivers/update", {
        method: "PATCH",
        body: JSON.stringify({
          caregiver_id: editingId,
          full_name: name.trim(),
          phone: phone.trim(),
        }),
      });
      await loadCaregivers();
      reset();
    } catch (e: any) {
      setError(e?.message || "Failed to update caregiver.");
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (caregiverId: string, is_active: boolean) => {
    setError(null);
    setBusy(true);
    try {
      await apiFetch<{ caregiver: Caregiver }>("/api/admin/caregivers/update", {
        method: "PATCH",
        body: JSON.stringify({ caregiver_id: caregiverId, is_active }),
      });
      await loadCaregivers();
      // If you deactivated the one you're editing, exit edit mode
      if (editingId === caregiverId && !is_active) reset();
    } catch (e: any) {
      setError(e?.message || "Failed to update caregiver status.");
    } finally {
      setBusy(false);
    }
  };

  // While checking authorization, render nothing (avoids flicker)
  if (authorized === null) return null;

  // If not authorized, we redirect; render nothing
  if (authorized === false) return null;

  return (
    <>
      <div className={`${styles.card} ${styles.cardStrong}`}>
        <p className={styles.sectionTitle}>Onboarding</p>
        <h2 style={{ margin: "0 0 12px" }}>{editing ? "Edit Caregiver" : "Invite Caregiver"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, maxWidth: 640 }}>
          <label>
            Caregiver Full Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Maria Thompson"
              disabled={busy}
            />
          </label>
          <label>
            Email Address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="e.g., maria@email.com"
              disabled={busy || !!editing} // email should not be edited here; reinvite via new invite if needed
            />
          </label>
          <label>
            Phone Number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="e.g., (555) 123-4567"
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
            {busy ? "Saving..." : editing ? "Save Changes" : "Send Invite"}
          </button>
          {editing && (
            <button className={`${styles.btn} ${styles.btnSecondary}`} type="button" onClick={reset} disabled={busy}>
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p className={styles.sectionTitle}>Directory</p>
            <h2 style={{ margin: "0 0 10px" }}>Manage Caregivers</h2>
            <p className={styles.muted} style={{ margin: "0 0 12px" }}>
              Update caregiver contact info or deactivate a caregiver.
            </p>
          </div>
          <div className={styles.btnRow} style={{ marginTop: 0 }}>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              type="button"
              onClick={loadCaregivers}
              disabled={loading || busy}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {caregivers.map((c) => (
          <div key={c.id} className={styles.row} style={{ opacity: c.is_active ? 1 : 0.65 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, letterSpacing: "-0.01em" }}>
                {c.full_name}
                {!c.is_active ? " (Inactive)" : ""}
              </h3>
              <div className={`${styles.muted} ${styles.rowSub}`}>
                {(c.email || "—")} • {(c.phone || "—")}
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
                    if (confirm("Deactivate this caregiver? They will lose access.")) setActive(c.id, false);
                  }}
                >
                  Deactivate
                </button>
              ) : (
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  type="button"
                  disabled={busy}
                  onClick={() => setActive(c.id, true)}
                >
                  Reactivate
                </button>
              )}
            </div>
          </div>
        ))}

        <div className={styles.muted} style={{ fontSize: 12 }}>
          Total caregivers: <b>{caregivers.length}</b>. {loading ? "Loading..." : ""}
        </div>
      </div>
    </>
  );
}
