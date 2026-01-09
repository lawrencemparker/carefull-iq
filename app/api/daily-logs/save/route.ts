import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type Body = {
  id?: string;
  client_id: string;
  caregiver_id?: string; // admin can set; caregiver forced
  log_date: string;      // YYYY-MM-DD
  bp?: string | null;
  meals?: any;           // jsonb
  visits?: any;          // jsonb
  notes?: string | null;
  entry?: string | null;
};

export async function POST(req: Request) {
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

  const body = (await req.json()) as Body;
  if (!body?.client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });
  if (!body?.log_date) return NextResponse.json({ error: "log_date required" }, { status: 400 });

  let caregiver_id = body.caregiver_id ?? null;

  if (p.role === "caregiver") {
    const { data: cg } = await supabaseAdmin
      .from("caregivers")
      .select("id")
      .eq("user_id", u.user.id)
      .eq("family_id", p.family_id)
      .maybeSingle();

    if (!cg?.id) return NextResponse.json({ error: "Caregiver record not found" }, { status: 403 });
    caregiver_id = cg.id;

    const { data: assn } = await supabaseAdmin
      .from("caregiver_clients")
      .select("client_id")
      .eq("family_id", p.family_id)
      .eq("caregiver_id", cg.id)
      .eq("client_id", body.client_id)
      .maybeSingle();

    if (!assn) return NextResponse.json({ error: "Not assigned to this client" }, { status: 403 });
  }

  if (p.role === "admin" && !caregiver_id) {
    return NextResponse.json({ error: "caregiver_id required for admin daily log entry" }, { status: 400 });
  }

  const payload = {
    family_id: p.family_id,
    client_id: body.client_id,
    caregiver_id,
    log_date: body.log_date,
    bp: body.bp ?? null,
    meals: body.meals ?? null,
    visits: body.visits ?? null,
    notes: body.notes ?? null,
    entry: body.entry ?? null,
  };

  if (body.id) {
    const { data, error } = await supabaseAdmin
      .from("daily_logs")
      .update(payload)
      .eq("id", body.id)
      .eq("family_id", p.family_id)
      .select("id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data?.id });
  }

  const { data, error } = await supabaseAdmin
    .from("daily_logs")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
