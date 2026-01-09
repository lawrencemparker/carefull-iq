import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    // Supabase client scoped to the user's JWT
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    // Who is calling?
    const { data: me, error: meErr } = await supabase.rpc("current_profile");
    if (meErr) {
      return NextResponse.json({ error: meErr.message }, { status: 400 });
    }

    // rpc returns a row or rows depending on how it’s used; normalize
    const profile = Array.isArray(me) ? me[0] : me;
    if (!profile?.user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // List admins in the same family
    const { data: admins, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, email, role, is_active, family_id")
      .eq("family_id", profile.family_id)
      .eq("role", "admin")
      .order("full_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ admins: admins ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
