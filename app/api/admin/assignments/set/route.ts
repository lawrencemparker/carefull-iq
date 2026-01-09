import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Missing Bearer token", status: 401 as const };

  const { data: u, error: uErr } = await supabaseAdmin.auth.getUser(token);
  if (uErr || !u?.user) return { error: "Invalid session", status: 401 as const };

  const { data: p } = await supabaseAdmin
    .from("profiles")
    .select("family_id, role, is_active")
    .eq("user_id", u.user.id)
    .maybeSingle();

  if (!p) return { error: "Profile not found", status: 403 as const };
  if (p.role !== "admin" || p.is_active !== true) return { error: "Admin required", status: 403 as const };

  return { family_id: p.family_id as string };
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = (await req.json()) as { client_id: string; caregiver_ids: string[] };
  if (!body?.client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });
  if (!Array.isArray(body?.caregiver_ids)) return NextResponse.json({ error: "caregiver_ids must be an array" }, { status: 400 });

  const { error: delErr } = await supabaseAdmin
    .from("caregiver_clients")
    .delete()
    .eq("family_id", gate.family_id)
    .eq("client_id", body.client_id);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (body.caregiver_ids.length > 0) {
    const rows = body.caregiver_ids.map((caregiver_id) => ({
      family_id: gate.family_id,
      client_id: body.client_id,
      caregiver_id,
    }));

    const { error: insErr } = await supabaseAdmin.from("caregiver_clients").insert(rows);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
