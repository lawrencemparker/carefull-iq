"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.is_active !== true || profile.role !== "admin") {
        router.replace("/home");
        return;
      }

      setOk(true);
    })();
  }, [router]);

  if (!ok) return null;
  return <>{children}</>;
}
