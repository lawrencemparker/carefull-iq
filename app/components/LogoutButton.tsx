"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
      }}
    >
      Logout
    </button>
  );
}
