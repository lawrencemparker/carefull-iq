import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const client_id = url.searchParams.get("client_id"); // optional filter

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

  // Base select; assumes logs table stores: client_id, caregiver_id, date, bp, meals (jsonb), visits (jsonb), notes
  let q = supabaseAdmin
    .from("logs")
    .select(
      `
      id,
      date,
      bp,
      meals,
      visits,
      notes,
      created_at,
      client:clients(id, full_name),
      caregiver:caregivers(id, full_name)
    `
    )
    .eq("family_id", prof.family_id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (client_id) q = q.eq("client_id", client_id);

  // Caregiver restriction: only logs for assigned clients
  if (prof.role === "caregiver") {
    const { data: cg } = await supabaseAdmin
      .from("caregivers")
      .select("id")
      .eq("user_id", user_id)
      .eq("family_id", prof.family_id)
      .maybeSingle();

    if (!cg?.id) return NextResponse.json({ logs: [] });

    const { data: assn, error: aErr } = await supabaseAdmin
      .from("caregiver_clients")
      .select("client_id")
      .eq("family_id", prof.family_id)
      .eq("caregiver_id", cg.id);

    if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

    const clientIds = (assn ?? []).map((r: any) => r.client_id);
    if (clientIds.length === 0) return NextResponse.json({ logs: [] });

    q = q.in("client_id", clientIds);
  }

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten for front-end
  const logs = (data ?? []).map((row: any) => ({
    id: row.id,
    date: row.date,
    bp: row.bp,
    meals: row.meals,
    visits: row.visits,
    notes: row.notes,
    created_at: row.created_at,
    client_id: row.client?.id ?? null,
    client_name: row.client?.full_name ?? "—",
    caregiver_id: row.caregiver?.id ?? null,
    caregiver_name: row.caregiver?.full_name ?? "—",
  }));

  return NextResponse.json({ logs });
}
