import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type Body = {
  client_id: string;
  full_name?: string;
  dob?: string | null;
  medications?: string | null;
  insurance_company?: string | null;
  policy_number?: string | null;
  allergies?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  reason?: string | null;
  is_active?: boolean;
};

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

export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = (await req.json()) as Body;
  if (!body?.client_id) return NextResponse.json({ error: "client_id required" }, { status: 400 });

  const patch: Record<string, any> = {};
  if (typeof body.full_name === "string") patch.full_name = body.full_name.trim();
  if ("dob" in body) patch.dob = body.dob ?? null;
  if ("medications" in body) patch.medications = body.medications ?? null;
  if ("insurance_company" in body) patch.insurance_company = body.insurance_company ?? null;
  if ("policy_number" in body) patch.policy_number = body.policy_number ?? null;
  if ("allergies" in body) patch.allergies = body.allergies ?? null;
  if ("emergency_contact_name" in body) patch.emergency_contact_name = body.emergency_contact_name ?? null;
  if ("emergency_contact_phone" in body) patch.emergency_contact_phone = body.emergency_contact_phone ?? null;
  if ("reason" in body) patch.reason = body.reason ?? null;
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  const { data, error } = await supabaseAdmin
    .from("clients")
    .update(patch)
    .eq("id", body.client_id)
    .eq("family_id", gate.family_id)
    .select(
      "id, full_name, dob, medications, insurance_company, policy_number, allergies, emergency_contact_name, emergency_contact_phone, reason, is_active, created_at"
    )
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ client: data });
}
