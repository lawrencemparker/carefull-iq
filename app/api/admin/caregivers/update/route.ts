import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { requireActiveAdmin } from "@/app/api/_utils/requireActiveAdmin";

type Body = {
  caregiver_id: string;
  full_name?: string;
  phone?: string;
  is_active?: boolean;
};

export async function PATCH(req: Request) {
  const gate = await requireActiveAdmin(req);
  if (!gate.ok) return gate.res;

  const { family_id } = gate.ctx;

  const body = (await req.json()) as Body;
  if (!body?.caregiver_id) return NextResponse.json({ error: "caregiver_id required" }, { status: 400 });

  const patch: Record<string, any> = {};
  if (typeof body.full_name === "string") patch.full_name = body.full_name.trim();
  if (typeof body.phone === "string") patch.phone = body.phone.trim();
  if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

  const { data, error } = await supabaseAdmin
    .from("caregivers")
    .update(patch)
    .eq("id", body.caregiver_id)
    .eq("family_id", family_id)
    .select("id, user_id, full_name, email, phone, is_active, created_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ caregiver: data });
}
