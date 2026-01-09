import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { requireActiveAdmin } from "@/app/api/_utils/requireActiveAdmin";

export async function GET(req: Request) {
  const gate = await requireActiveAdmin(req);
  if (!gate.ok) return gate.res;

  const { family_id } = gate.ctx;

  const { data, error } = await supabaseAdmin
    .from("caregivers")
    .select("id, user_id, full_name, email, phone, is_active, created_at")
    .eq("family_id", family_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ caregivers: data ?? [] });
}
