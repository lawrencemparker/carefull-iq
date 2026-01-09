import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type Body = {
  full_name: string;
  dob?: string | null;
  medications?: string | null;
  insurance_company?: string | null;
  policy_number?: string | null;
  allergies?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  reason?: string | null;
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

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if ("error" in gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const body = (await req.json()) as Body;
  if (!body?.full_name?.trim()) return NextResponse.json({ error: "Client name is required." }, { status: 400 });

  const insert = {
    family_id: gate.family_id,
    full_name: body.full_name.trim(),
    dob: body.dob ?? null,
    medications: body.medications ?? null,
    insurance_company: body.insurance_company ?? null,
    policy_number: body.policy_number ?? null,
    allergies: body.allergies ?? null,
    emergency_contact_name: body.emergency_contact_name ?? null,
    emergency_contact_phone: body.emergency_contact_phone ?? null,
    reason: body.reason ?? null,
    is_active: true,
  };

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert(insert)
    .select(
      "id, full_name, dob, medications, insurance_company, policy_number, allergies, emergency_contact_name, emergency_contact_phone, reason, is_active, created_at"
    )
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data });
}
