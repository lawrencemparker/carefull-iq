"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={onLogout} className="secondary">
      Log out
    </button>
  );
}
