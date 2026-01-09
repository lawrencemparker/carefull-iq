import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });

  const { data: callerData, error: callerErr } = await supabaseAdmin.auth.getUser(token);
  if (callerErr || !callerData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const user_id = callerData.user.id;

  const { data: prof, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("role, family_id, is_active")
    .eq("user_id", user_id)
    .maybeSingle();

  if (profErr || !prof) return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  if (prof.is_active !== true) return NextResponse.json({ error: "Account is inactive" }, { status: 403 });

  // Admin: return all active clients in family
  if (prof.role === "admin") {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .select("id, full_name, is_active, created_at")
      .eq("family_id", prof.family_id)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ clients: data ?? [] });
  }

  // Caregiver: return assigned clients only
  const { data: cg } = await supabaseAdmin
    .from("caregivers")
    .select("id")
    .eq("user_id", user_id)
    .eq("family_id", prof.family_id)
    .maybeSingle();

  if (!cg?.id) return NextResponse.json({ clients: [] });

  const { data, error } = await supabaseAdmin
    .from("caregiver_clients")
    .select("client:clients(id, full_name, is_active, created_at)")
    .eq("family_id", prof.family_id)
    .eq("caregiver_id", cg.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const clients = (data ?? [])
    .map((r: any) => r.client)
    .filter(Boolean);

  return NextResponse.json({ clients });
}
