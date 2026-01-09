import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type Body = {
  id?: string; // if provided => update
  client_id: string;
  caregiver_id?: string; // admin can set; caregiver will be forced
  date: string;
  bp?: string | null;
  meals: { b: "Yes" | "No"; l: "Yes" | "No"; d: "Yes" | "No" };
  visits: { ot: "Yes" | "No"; pt: "Yes" | "No"; n: "Yes" | "No" };
  notes?: string | null;
};

export async function POST(req: Request) {
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

  const body = (await req.json()) as Body;
  if (!body?.client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });
  if (!body?.date) return NextResponse.json({ error: "date required" }, { status: 400 });
  if (!body?.meals || !body?.visits) return NextResponse.json({ error: "meals/visits required" }, { status: 400 });

  let caregiver_id = body.caregiver_id ?? null;

  // If caregiver, force caregiver_id and validate assignment
  if (prof.role === "caregiver") {
    const { data: cg } = await supabaseAdmin
      .from("caregivers")
      .select("id")
      .eq("user_id", user_id)
      .eq("family_id", prof.family_id)
      .maybeSingle();

    if (!cg?.id) return NextResponse.json({ error: "Caregiver record not found" }, { status: 403 });
    caregiver_id = cg.id;

    const { data: assn } = await supabaseAdmin
      .from("caregiver_clients")
      .select("id")
      .eq("family_id", prof.family_id)
      .eq("caregiver_id", cg.id)
      .eq("client_id", body.client_id)
      .maybeSingle();

    if (!assn) return NextResponse.json({ error: "Not assigned to this client" }, { status: 403 });
  }

  // Admin: caregiver_id is required (they must choose)
  if (prof.role === "admin" && !caregiver_id) {
    return NextResponse.json({ error: "caregiver_id required for admin log entry" }, { status: 400 });
  }

  const payload = {
    family_id: prof.family_id,
    client_id: body.client_id,
    caregiver_id,
    date: body.date,
    bp: body.bp ?? null,
    meals: body.meals,
    visits: body.visits,
    notes: body.notes ?? null,
  };

  if (body.id) {
    const { data, error } = await supabaseAdmin
      .from("logs")
      .update(payload)
      .eq("id", body.id)
      .eq("family_id", prof.family_id)
      .select("id")
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data?.id });
  }

  const { data, error } = await supabaseAdmin
    .from("logs")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
