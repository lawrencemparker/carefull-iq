"use client";

import Shell from "@/components/Shell";
import KPIRail from "@/components/KPIRail";
import { StoreProvider } from "@/components/store";
import { RequireAuth } from "@/app/components/RequireAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <RequireAuth>
        <Shell rightRail={<KPIRail />}>{children}</Shell>
      </RequireAuth>
    </StoreProvider>
  );
}
