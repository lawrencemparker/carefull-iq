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

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const url = new URL(req.url);
  const client_id = url.searchParams.get("client_id");
  if (!client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const { data: caregivers, error: cErr } = await supabaseAdmin
    .from("caregivers")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("family_id", gate.family_id)
    .order("created_at", { ascending: false });

  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

  const { data: assigned, error: aErr } = await supabaseAdmin
    .from("caregiver_clients")
    .select("caregiver_id")
    .eq("family_id", gate.family_id)
    .eq("client_id", client_id);

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });

  return NextResponse.json({
    caregivers: caregivers ?? [],
    assigned_caregiver_ids: (assigned ?? []).map((r: any) => r.caregiver_id),
  });
}
