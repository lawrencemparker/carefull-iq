"use client";

import { ReactNode } from "react";
import SidebarNav from "@/components/SidebarNav";
import Topbar from "@/components/Topbar";
import LogoutButton from "@/app/components/LogoutButton";

export default function Shell({
  children,
  rightRail,
}: {
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside>
        <SidebarNav />
      </aside>

      {/* Main + optional right rail */}
      <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
        {/* Main column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Topbar />

          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <LogoutButton />
            </div>

            {children}
          </div>
        </div>

        {/* Right rail */}
        {rightRail ? (
          <aside
            style={{
              width: 320,
              flex: "0 0 320px",
              borderLeft: "1px solid rgba(15,23,42,0.10)",
              background: "var(--cf-card)",
              padding: 16,
              display: "none",
            }}
            className="cf-right-rail"
          >
            {rightRail}
          </aside>
        ) : null}
      </div>

      {/* Minimal CSS to show right rail on larger screens */}
      <style jsx global>{`
        @media (min-width: 1100px) {
          .cf-right-rail {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
