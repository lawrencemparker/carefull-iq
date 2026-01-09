import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return { error: "Missing Bearer token", status: 401 as const };

  const { data: callerData, error: callerErr } = await supabaseAdmin.auth.getUser(token);
  if (callerErr || !callerData?.user) return { error: "Invalid session", status: 401 as const };

  const { data: prof, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("family_id, role, is_active")
    .eq("user_id", callerData.user.id)
    .maybeSingle();

  if (profErr || !prof) return { error: "Caller profile not found", status: 403 as const };
  if (prof.role !== "admin" || prof.is_active !== true) return { error: "Admin privileges required", status: 403 as const };

  return { family_id: prof.family_id as string };
}

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select(
      "id, full_name, dob, medications, insurance_company, policy_number, allergies, emergency_contact_name, emergency_contact_phone, reason, is_active, created_at"
    )
    .eq("family_id", gate.family_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ clients: data ?? [] });
}
