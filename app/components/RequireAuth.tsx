"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!mounted) return;

      if (!session) {
        // Avoid loops if you're already on /login
        if (pathname !== "/login") router.replace("/login");
        return;
      }

      setReady(true);
    }

    check();
    return () => {
      mounted = false;
    };
  }, [router, pathname]);

  if (!ready) return null; // keeps your UI clean while it checks
  return <>{children}</>;
}
