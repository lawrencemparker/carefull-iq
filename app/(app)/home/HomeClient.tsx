"use client";

import Link from "next/link";

export default function HomeClient() {
  return (
    <div className="content">
      <div className="layout">
        {/* Main column */}
        <section>
          {/* Welcome back card */}
          <div className="card strong">
            <p className="section-title" style={{ marginBottom: 6 }}>
              Quick actions
            </p>

            <h2 style={{ margin: 0, fontSize: 18, letterSpacing: "-0.01em" }}>
              Welcome back
            </h2>

            <p className="muted" style={{ margin: "8px 0 0", maxWidth: 560 }}>
              Onboard clients and caregivers, then document daily care in seconds.
            </p>

            <div className="btnrow" style={{ marginTop: 14 }}>
              <Link href="/caregivers" className="btnlike">
                Add Caregivers
              </Link>
              <Link href="/clients" className="btnlike">
                Add Clients
              </Link>
              <Link href="/daily-log" className="btnlike">
                Daily Log
              </Link>
              <Link href="/logs" className="btnlike secondary">
                View Daily Logs
              </Link>
            </div>
          </div>

          {/* App Features card */}
          <div className="card" style={{ marginTop: 16 }}>
            <p className="section-title">App Features</p>

            <h2 style={{ margin: "0 0 10px" }}>High-level overview</h2>

            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                color: "var(--muted)",
                fontSize: 13,
                lineHeight: 1.7,
                maxWidth: 760,
              }}
            >
              <li>
                <b>Caregiver login</b> (Supabase) to protect data integrity.
              </li>
              <li>
                <b>Client profiles</b>: DOB, medications, allergies, emergency contact,
                insurance.
              </li>
              <li>
                <b>Daily care logs</b>: vitals, meals, visits (OT/PT/Nurse), notes.
              </li>
              <li>
                <b>Review and filter logs</b> by client with quick indicators.
              </li>
              <li>
                <b>Edit logs anytime</b>: open a log and update later as needed.
              </li>
              <li>
                <b>Mobile-first UX</b>: responsive layout with bottom nav + sticky
                primary action.
              </li>
            </ul>
          </div>
        </section>

        {/* Right column (At-a-glance) */}
        <aside>
          <div className="card" style={{ minHeight: 260 }}>
            <p className="section-title">At-a-glance</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
              <div className="card strong" style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
                <div className="muted" style={{ fontSize: 12, fontWeight: 800 }}>
                  Clients
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  2
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Active client profiles
                </div>
              </div>

              <div className="card strong" style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
                <div className="muted" style={{ fontSize: 12, fontWeight: 800 }}>
                  Caregivers
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  2
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Onboarded caregivers
                </div>
              </div>

              <div className="card strong" style={{ padding: 14, borderRadius: "var(--radius-lg)" }}>
                <div className="muted" style={{ fontSize: 12, fontWeight: 800 }}>
                  Logs
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
                  2
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  Recorded daily logs
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Small helper styles so Links look like your buttons without changing the rest of the app */}
      <style jsx>{`
        .btnlike {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 0;
          cursor: pointer;
          border-radius: 14px;
          padding: 12px 14px;
          font-weight: 800;
          letter-spacing: 0.01em;
          box-shadow: 0 16px 30px rgba(30, 125, 215, 0.22);
          background: linear-gradient(135deg, var(--brand), var(--brand2));
          color: white;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .btnlike:hover {
          transform: translateY(-1px);
          box-shadow: 0 22px 38px rgba(30, 125, 215, 0.26);
        }
        .btnlike:active {
          transform: translateY(0px);
        }
        .btnlike.secondary {
          background: rgba(255, 255, 255, 0.7);
          color: var(--ink);
          border: 1px solid rgba(15, 23, 42, 0.1);
          box-shadow: 0 14px 24px rgba(15, 23, 42, 0.1);
        }
      `}</style>
    </div>
  );
}
