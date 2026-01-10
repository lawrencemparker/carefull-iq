"use client";

<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
=======
import { useMemo, useState } from "react";
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
  // Force login page to always render in light mode
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    document.body.setAttribute("data-theme", "light");
  }, []);

=======
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.trim().length > 0 && !busy;
  }, [email, password, busy]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.replace("/home");
    } finally {
      setBusy(false);
    }
  }

  return (
<<<<<<< HEAD
    <main
      className="min-h-screen"
      style={{ display: "grid", placeItems: "center", padding: 16 }}
    >
=======
    <main className="min-h-screen" style={{ display: "grid", placeItems: "center", padding: 16 }}>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
      <div
        className="card strong"
        style={{
          width: "min(520px, 100%)",
          padding: 22,
        }}
      >
<<<<<<< HEAD
        <p className="section-title" style={{ marginBottom: 6 }}>
          CareFull IQ
        </p>
        <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.01em" }}>
          Sign in
        </h1>
=======
        <p className="section-title" style={{ marginBottom: 6 }}>CareFull IQ</p>
        <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-0.01em" }}>Sign in</h1>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
        <p className="muted" style={{ marginTop: 8, marginBottom: 16 }}>
          Use your admin email and password to access your family workspace.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label>
<<<<<<< HEAD
            <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
              Email
            </span>
=======
            <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Email</span>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>

          <label>
<<<<<<< HEAD
            <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>
              Password
            </span>
=======
            <span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>Password</span>
>>>>>>> 1a5b0c886bb07452708faac7e56ec803031c4f3d
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error ? (
            <div
              style={{
                borderRadius: 14,
                padding: "10px 12px",
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.10)",
                color: "rgb(239,68,68)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.6 }}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
