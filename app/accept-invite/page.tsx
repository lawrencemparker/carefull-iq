"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

function isValidPassword(pw: string) {
  // Keep it simple; you can tighten later.
  return pw.length >= 8;
}

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useSearchParams();

  const code = useMemo(() => params.get("code"), [params]);

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);

      try {
        // Supabase email links typically include ?code=...
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) throw exErr;
        } else {
          // Some clients may already have a session if the link was handled differently.
          const { data } = await supabase.auth.getSession();
          if (!data.session) {
            throw new Error("Invite link is missing a code. Please request a new invite.");
          }
        }

        setReady(true);
      } catch (e: any) {
        setError(e?.message || "Failed to accept invite.");
        setReady(true);
      }
    })();
  }, [code]);

  const onSetPassword = async () => {
    setSaving(true);
    setError(null);

    try {
      if (!isValidPassword(password)) {
        throw new Error("Password must be at least 8 characters.");
      }

      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;

      router.replace("/home");
    } catch (e: any) {
      setError(e?.message || "Failed to set password.");
    } finally {
      setSaving(false);
    }
  };

  if (!ready) return <div style={{ padding: 24 }}>Preparing your account…</div>;

  return (
    <div style={{ maxWidth: 440, margin: "48px auto", padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Set your password</h1>

      {error ? (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          {error}
          <div style={{ marginTop: 10, color: "#666" }}>
            Ask your admin to re-send the invite.
          </div>
        </div>
      ) : (
        <p style={{ marginBottom: 16 }}>
          Your invitation is accepted. Please set a password to finish onboarding.
        </p>
      )}

      <label style={{ display: "block", marginBottom: 8 }}>New password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 12 }}
        disabled={saving || !!error}
      />

      <button
        onClick={onSetPassword}
        disabled={saving || !!error || !isValidPassword(password)}
        style={{ width: "100%", padding: 12, fontWeight: 800 }}
      >
        {saving ? "Saving…" : "Set password & continue"}
      </button>
    </div>
  );
}
