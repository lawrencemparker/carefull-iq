"use client";

import { RequireAuth } from "../../components/RequireAuth";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type ProfileRow = {
  role: string;
  is_active: boolean;
};

export default function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase.rpc("current_profile");
      if (error || !mounted) return;

      const row = (Array.isArray(data) ? data[0] : null) as ProfileRow | null;
      const admin = !!row && row.role === "admin" && row.is_active === true;

      setIsAdmin(admin);
    }

    loadRole();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RequireAuth>
      <div style={{ padding: 24, maxWidth: 900 }}>
        {/* Quick actions */}
        <section style={card()}>
          <p style={{ margin: 0, color: "var(--cf-muted)", fontWeight: 700, fontSize: 14 }}>
            Quick actions
          </p>

          <h2 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 900, color: "var(--cf-text)" }}>
            Welcome back
          </h2>

          <p style={{ margin: "8px 0 0", color: "var(--cf-muted)", maxWidth: 560 }}>
            Onboard clients and caregivers, then document daily care in seconds.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {isAdmin && (
              <Link href="/caregivers" style={btn()}>
                Add Caregivers
              </Link>
            )}

            <Link href="/clients" style={btn()}>
              Add Clients
            </Link>

            <Link href="/daily-log" style={btn()}>
              Daily Log
            </Link>

            <Link href="/logs" style={btnSecondary()}>
              View Daily Logs
            </Link>
          </div>
        </section>

        {/* App Features */}
        <section style={{ ...card(), marginTop: 16 }}>
          <p style={{ margin: 0, color: "var(--cf-muted)", fontWeight: 700, fontSize: 14 }}>
            App Features
          </p>

          <h2 style={{ margin: "8px 0 10px", fontSize: 20, fontWeight: 900, color: "var(--cf-text)" }}>
            High-level overview
          </h2>

          <ul style={{ margin: 0, paddingLeft: 18, color: "var(--cf-text)", lineHeight: 1.7 }}>
            <li>
              <b>Caregiver login</b> (Supabase) to protect data integrity.
            </li>
            <li>
              <b>Client profiles</b>: store DOB, medications, allergies, emergency contact, insurance.
            </li>
            <li>
              <b>Daily care logs</b>: record blood pressure, meals, visits (OT/PT/Nurse), and notes.
            </li>
            <li>
              <b>Review and filter logs</b> by client with quick indicators.
            </li>
            <li>
              <b>Edit logs anytime</b>: open a log and update later as needed.
            </li>
            <li>
              <b>Mobile-first UX</b>: responsive layout with bottom nav and sticky primary action.
            </li>
          </ul>
        </section>
      </div>
    </RequireAuth>
  );
}

function card(): React.CSSProperties {
  return {
    background: "var(--cf-card)",
    border: "1px solid var(--cf-card-border)",
    borderRadius: 22,
    padding: 18,
    boxShadow: "var(--cf-card-shadow)",
  };
}

function btn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
    textDecoration: "none",
    color: "white",
    background: "linear-gradient(135deg, #1e7dd7, #5fb4ff)",
    boxShadow: "0 16px 30px rgba(30,125,215,0.22)",
  };
}

function btnSecondary(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 14px",
    borderRadius: 14,
    fontWeight: 800,
    textDecoration: "none",
    color: "var(--cf-text)",
    background: "rgba(255,255,255,0.70)",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 14px 24px rgba(15,23,42,0.10)",
  };
}
