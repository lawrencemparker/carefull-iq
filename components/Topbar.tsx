"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/shell.module.css";
import Image from "next/image";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Theme = "light" | "dark";

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  document.body.setAttribute("data-theme", next);

  try {
    window.localStorage.setItem("carefulliq_theme", next);
  } catch {}

  window.dispatchEvent(new CustomEvent("carefulliq_themechange", { detail: { theme: next } }));
}

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem("carefulliq_theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {}

  const htmlTheme = document.documentElement.getAttribute("data-theme");
  if (htmlTheme === "dark" || htmlTheme === "light") return htmlTheme;

  const bodyTheme = document.body.getAttribute("data-theme");
  return bodyTheme === "dark" ? "dark" : "light";
}

function initialsFromName(fullName?: string | null) {
  const name = (fullName ?? "").trim();
  if (!name) return "U";
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

type DbStatus = "checking" | "connected" | "auth_required" | "rls_blocked" | "error";

function formatChecked(ts: number | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function Topbar() {
  const router = useRouter();

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return readTheme();
  });

  const [fullName, setFullName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>(""); // from Supabase Auth
  const [phone, setPhone] = useState<string>(""); // from profiles

  const userInitials = useMemo(() => initialsFromName(fullName), [fullName]);

  const [dbStatus, setDbStatus] = useState<DbStatus>("checking");
  const [dbHint, setDbHint] = useState<string>("Checking connection…");
  const [dbLastChecked, setDbLastChecked] = useState<number | null>(null);
  const [dbProjectHost, setDbProjectHost] = useState<string>("");

  // Menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef<HTMLDivElement | null>(null);

  // Profile modal state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Editable fields in modal
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Apply stored theme on mount
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDb = useCallback(async () => {
    setDbStatus("checking");
    setDbHint("Checking connection…");

    // Show project host (helps users trust the connection)
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const host = url ? new URL(url).host : "";
      setDbProjectHost(host);
    } catch {
      setDbProjectHost("");
    }

    // quick offline check
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setDbStatus("error");
      setDbHint("Offline — check your internet connection.");
      setDbLastChecked(Date.now());
      return;
    }

    // 1) env sanity check
    const urlOk = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonOk = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!urlOk || !anonOk) {
      setDbStatus("error");
      setDbHint("Missing Supabase env vars (URL or ANON KEY).");
      setDbLastChecked(Date.now());
      return;
    }

    try {
      // 2) auth session check
      const { data: sess, error: sessErr } = await supabase.auth.getSession();
      if (sessErr) throw sessErr;

      if (!sess?.session) {
        setDbStatus("auth_required");
        setDbHint("Supabase reachable — sign in required to verify DB/RLS.");
        setDbLastChecked(Date.now());
        return;
      }

      // 3) DB + RLS check (RPC used across the app)
      const { error: rpcErr } = await supabase.rpc("current_profile");
      if (rpcErr) {
        const msg = (rpcErr.message || "").toLowerCase();
        if (msg.includes("permission") || msg.includes("rls") || msg.includes("not allowed") || msg.includes("denied")) {
          setDbStatus("rls_blocked");
          setDbHint("Connected — blocked by RLS/policies for this user.");
          setDbLastChecked(Date.now());
          return;
        }

        setDbStatus("error");
        setDbHint(rpcErr.message || "DB check failed.");
        setDbLastChecked(Date.now());
        return;
      }

      setDbStatus("connected");
      setDbHint("Connected — Auth OK • DB OK • RLS OK");
      setDbLastChecked(Date.now());
    } catch (e: any) {
      setDbStatus("error");
      setDbHint(e?.message || "Unable to reach Supabase.");
      setDbLastChecked(Date.now());
    }
  }, []);

  // Run DB check on mount, and whenever auth changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) return;
      await checkDb();
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      checkDb();
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [checkDb]);

  // Listen for theme changes
  useEffect(() => {
    const onThemeChange = (e: Event) => {
      const ce = e as CustomEvent<{ theme?: Theme }>;
      const next =
        ce?.detail?.theme === "dark" || ce?.detail?.theme === "light" ? ce.detail.theme : readTheme();

      setTheme(next);

      document.documentElement.setAttribute("data-theme", next);
      document.body.setAttribute("data-theme", next);
      try {
        window.localStorage.setItem("carefulliq_theme", next);
      } catch {}
    };

    window.addEventListener("carefulliq_themechange", onThemeChange);
    return () => window.removeEventListener("carefulliq_themechange", onThemeChange);
  }, []);

  // Load logged-in user's profile + auth email
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user || !mounted) return;

      setAuthEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setFullName("");
        setRole("");
        setPhone("");
        return;
      }

      setFullName(data?.full_name ?? "");
      setRole(data?.role ?? "");
      setPhone((data as any)?.phone ?? "");
    }

    loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = (e: MouseEvent) => {
      const el = menuWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setMenuOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close profile modal on Escape
  useEffect(() => {
    if (!profileOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [profileOpen]);

  async function handleLogout() {
    setMenuOpen(false);

    // Ensure login always renders light
    document.documentElement.setAttribute("data-theme", "light");
    document.body.setAttribute("data-theme", "light");

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  function openProfileModal() {
    setMenuOpen(false);
    setProfileError(null);
    setProfileSuccess(null);
    setEditPhone(phone ?? "");
    setEditEmail(authEmail ?? "");
    setProfileOpen(true);
  }

  async function saveProfile() {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileBusy(true);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;
      if (!user) {
        setProfileError("Your session expired. Please sign in again.");
        return;
      }

      const nextPhone = editPhone.trim();
      const nextEmail = editEmail.trim();

      const { error: profileErr } = await supabase.from("profiles").update({ phone: nextPhone }).eq("user_id", user.id);

      if (profileErr) {
        setProfileError(profileErr.message);
        return;
      }

      if (nextEmail && nextEmail !== (authEmail ?? "")) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: nextEmail });
        if (emailErr) {
          setProfileError(emailErr.message);
          return;
        }

        setProfileSuccess("Saved. If prompted, confirm your email change via the message sent to your inbox.");
      } else {
        setProfileSuccess("Saved.");
      }

      setPhone(nextPhone);

      const { data: u } = await supabase.auth.getUser();
      const refreshedEmail = u?.user?.email ?? nextEmail;
      setAuthEmail(refreshedEmail);
      setEditEmail(refreshedEmail);
    } finally {
      setProfileBusy(false);
    }
  }

  const roleLabel = role ? (role === "admin" ? "Admin" : "Caregiver") : "";

  // Theme-aware dropdown palette
  const menuBg = theme === "dark" ? "rgba(12, 14, 18, 0.92)" : "rgba(255, 255, 255, 0.96)";
  const menuBorder = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(10, 20, 35, 0.12)";
  const menuText = theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(10, 20, 35, 0.92)";
  const menuHover = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(10, 20, 35, 0.06)";
  const menuDivider = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(10, 20, 35, 0.10)";

  // Modal palette
  const overlayBg = theme === "dark" ? "rgba(0,0,0,0.55)" : "rgba(10,20,35,0.25)";
  const modalBg = theme === "dark" ? "rgba(12, 14, 18, 0.94)" : "rgba(255,255,255,0.98)";
  const modalBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(10, 20, 35, 0.14)";
  const modalText = theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(10, 20, 35, 0.92)";
  const fieldBg = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(10,20,35,0.05)";
  const fieldBorder = theme === "dark" ? "rgba(255,255,255,0.14)" : "rgba(10,20,35,0.12)";

  const checkedLabel = formatChecked(dbLastChecked);
  const dbTitle = [
    dbHint,
    dbProjectHost ? `Project: ${dbProjectHost}` : "",
    checkedLabel ? `Last checked: ${checkedLabel}` : "",
    "Click to re-check.",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <div className={styles.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/careFullIQ.png" alt="CareFull IQ" width={140} height={36} style={{ height: 36, width: "auto" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ borderRadius: 999, padding: "10px 12px", fontWeight: 900 }}
            onClick={() => {
              const next: Theme = theme === "dark" ? "light" : "dark";
              applyTheme(next);
              setTheme(next);
            }}
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

         

          {/* DB indicator (clickable to re-check) */}
          <div
            className={styles.dbchip}
            title={dbTitle}
            role="button"
            tabIndex={0}
            onClick={() => checkDb()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") checkDb();
            }}
            style={{ cursor: "pointer" }}
          >
            <div
              className={styles.dbDot}
              aria-hidden="true"
              style={{
                background:
                  dbStatus === "connected"
                    ? "rgba(34,197,94,0.95)"
                    : dbStatus === "checking"
                    ? "rgba(148,163,184,0.95)"
                    : "rgba(239,68,68,0.95)",
                boxShadow:
                  dbStatus === "connected"
                    ? "0 0 0 4px rgba(34,197,94,0.18)"
                    : dbStatus === "checking"
                    ? "0 0 0 4px rgba(148,163,184,0.14)"
                    : "0 0 0 4px rgba(239,68,68,0.14)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span className={styles.dbLabel}>
                DB:{" "}
                {dbStatus === "connected"
                  ? "Connected"
                  : dbStatus === "checking"
                  ? "Checking…"
                  : dbStatus === "auth_required"
                  ? "Sign in required"
                  : dbStatus === "rls_blocked"
                  ? "Connected (RLS blocked)"
                  : "Not connected"}
              </span>
              <span className={styles.dbHint}>
                {dbProjectHost ? dbProjectHost : "Supabase"}{checkedLabel ? ` • ${checkedLabel}` : ""}
              </span>
            </div>
          </div>

          {/* Logged-in user chip + menu */}
          <div ref={menuWrapRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              title={fullName ? `Signed in as ${fullName}` : "Signed in"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 999,
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(10, 20, 35, 0.12)",
                background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.60)",
                cursor: "pointer",
                color: theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(10, 20, 35, 0.92)",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 12,
                  border: theme === "dark" ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(10, 20, 35, 0.14)",
                  background: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(10, 20, 35, 0.06)",
                  letterSpacing: 0.5,
                }}
              >
                {userInitials}
              </div>

              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05, textAlign: "left" }}>
                <div style={{ fontWeight: 900, fontSize: 12 }}>{fullName || "Signed in"}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{roleLabel}</div>
              </div>

              <svg
                aria-hidden="true"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.75 }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {menuOpen && (
              <div
                role="menu"
                aria-label="User menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  minWidth: 180,
                  borderRadius: 14,
                  border: `1px solid ${menuBorder}`,
                  background: menuBg,
                  color: menuText,
                  boxShadow: theme === "dark" ? "0 12px 30px rgba(0,0,0,0.35)" : "0 12px 30px rgba(0,0,0,0.18)",
                  overflow: "hidden",
                  zIndex: 50,
                  backdropFilter: "blur(10px)",
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={openProfileModal}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    color: menuText,
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = menuHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Profile
                </button>

                <div style={{ height: 1, background: menuDivider }} />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "none",
                    color: menuText,
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = menuHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile modal */}
      {profileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Profile"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setProfileOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: overlayBg,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "min(560px, 100%)",
              borderRadius: 18,
              border: `1px solid ${modalBorder}`,
              background: modalBg,
              color: modalText,
              boxShadow: theme === "dark" ? "0 18px 50px rgba(0,0,0,0.45)" : "0 18px 50px rgba(0,0,0,0.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(10,20,35,0.10)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
                <div style={{ fontSize: 14, fontWeight: 950 }}>Profile</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Update your contact details</div>
              </div>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close"
                title="Close"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: `1px solid ${fieldBorder}`,
                  background: fieldBg,
                  color: modalText,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 16, display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Name</div>
                <input
                  value={fullName}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: `1px solid ${fieldBorder}`,
                    background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(10,20,35,0.04)",
                    color: modalText,
                    opacity: 0.85,
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Phone</div>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: `1px solid ${fieldBorder}`,
                    background: fieldBg,
                    color: modalText,
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>Email</div>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    border: `1px solid ${fieldBorder}`,
                    background: fieldBg,
                    color: modalText,
                    outline: "none",
                    fontWeight: 800,
                  }}
                />
                <div style={{ fontSize: 11, opacity: 0.7 }}>
                  Changing email may require confirmation via a message sent to your inbox.
                </div>
              </div>

              {profileError && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: "10px 12px",
                    border: "1px solid rgba(239,68,68,0.35)",
                    background: "rgba(239,68,68,0.10)",
                    color: "rgb(239,68,68)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div
                  style={{
                    borderRadius: 14,
                    padding: "10px 12px",
                    border: theme === "dark" ? "1px solid rgba(34,197,94,0.28)" : "1px solid rgba(34,197,94,0.35)",
                    background: theme === "dark" ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.08)",
                    color: theme === "dark" ? "rgba(220,255,235,0.95)" : "rgba(10,70,30,0.95)",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {profileSuccess}
                </div>
              )}
            </div>

            <div
              style={{
                padding: 16,
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                borderTop: theme === "dark" ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(10,20,35,0.10)",
              }}
            >
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                style={{
                  borderRadius: 14,
                  padding: "10px 12px",
                  border: `1px solid ${fieldBorder}`,
                  background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.70)",
                  color: modalText,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={profileBusy}
                style={{
                  borderRadius: 14,
                  padding: "10px 12px",
                  border: "1px solid rgba(59,130,246,0.35)",
                  background: "rgba(59,130,246,0.18)",
                  color: modalText,
                  fontWeight: 950,
                  cursor: profileBusy ? "not-allowed" : "pointer",
                  opacity: profileBusy ? 0.7 : 1,
                }}
              >
                {profileBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
