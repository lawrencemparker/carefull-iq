import { Suspense } from "react";
import AcceptInviteClient from "./AcceptInviteClient";

export const dynamic = "force-dynamic"; // prevents static prerender at build
export const revalidate = 0;

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <AcceptInviteClient />
    </Suspense>
  );
}
