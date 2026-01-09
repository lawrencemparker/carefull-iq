import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const client_id = url.searchParams.get("client_id");

  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });

  const { data: u, error: uErr } = await supabaseAdmin.auth.getUser(token);
  if (uErr || !u?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { data: p } = await supabaseAdmin
    .from("profiles")
    .select("role, family_id, is_active")
    .eq("user_id", u.user.id)
    .maybeSingle();

  if (!p) return NextResponse.json({ error: "Profile not found" }, { status: 403 });
  if (p.is_active !== true) return NextResponse.json({ error: "Account inactive" }, { status: 403 });

  let q = supabaseAdmin
    .from("daily_logs")
    .select(`
      id,
      log_date,
      bp,
      meals,
      visits,
      notes,
      entry,
      created_at,
      client:clients(id, full_name),
      caregiver:caregivers(id, full_name)
    `)
    .eq("family_id", p.family_id)
    .order("log_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (client_id) q = q.eq("client_id", client_id);

  if (p.role === "caregiver") {
    const { data: cg } = await supabaseAdmin
      .from("caregivers")
      .select("id")
      .eq("user_id", u.user.id)
      .eq("family_id", p.family_id)
      .maybeSingle();

    if (!cg?.id) return NextResponse.json({ daily_logs: [] });

    const { data: assn, error: aErr } = await supabaseAdmin
      .from("caregiver_clients")
      .select("client_id")
      .eq("family_id", p.family_id)
      .eq("caregiver_id", cg.id);

    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

    const ids = (assn ?? []).map((r: any) => r.client_id);
    if (ids.length === 0) return NextResponse.json({ daily_logs: [] });

    q = q.in("client_id", ids);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const daily_logs = (data ?? []).map((row: any) => ({
    id: row.id,
    log_date: row.log_date,
    bp: row.bp,
    meals: row.meals,
    visits: row.visits,
    notes: row.notes,
    entry: row.entry,
    created_at: row.created_at,
    client_id: row.client?.id ?? null,
    client_name: row.client?.full_name ?? "—",
    caregiver_id: row.caregiver?.id ?? null,
    caregiver_name: row.caregiver?.full_name ?? "—",
  }));

  return NextResponse.json({ daily_logs });
}
