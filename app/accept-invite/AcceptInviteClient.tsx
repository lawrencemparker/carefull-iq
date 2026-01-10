"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function AcceptInviteClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        // Example: you likely parse token/code params here
        // const token = searchParams.get("token");
        // const type = searchParams.get("type");
        // ... your existing accept invite logic ...

        // If you previously used getSessionFromUrl and fixed it,
        // keep your working version here.

        if (!mounted) return;
        setReady(true);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to accept invite.");
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  if (error) {
    return <div style={{ padding: 24, color: "crimson", fontWeight: 800 }}>{error}</div>;
  }

  if (!ready) {
    return <div style={{ padding: 24 }}>Preparing invite…</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Replace this with your real UI */}
      <h1 style={{ margin: 0 }}>Invite Ready</h1>
      <p>Continue setting your password / completing onboarding.</p>
    </div>
  );
}
