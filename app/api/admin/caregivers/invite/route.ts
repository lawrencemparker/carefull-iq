import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { requireActiveAdmin } from "@/app/api/_utils/requireActiveAdmin";

type Body = {
  email: string;
  full_name: string;
  phone?: string;
};

function getOrigin(req: Request) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(req: Request) {
  try {
    const gate = await requireActiveAdmin(req);
    if (!gate.ok) return gate.res;

    const { family_id } = gate.ctx;

    const body = (await req.json()) as Body;
    const email = (body.email || "").trim().toLowerCase();
    const full_name = (body.full_name || "").trim();
    const phone = (body.phone || "").trim() || null;

    if (!email || !full_name) {
      return NextResponse.json({ error: "email and full_name are required" }, { status: 400 });
    }

    // Invite caregiver via email
    const origin = getOrigin(req);
    const redirectTo = `${origin}/accept-invite`;

    const { data: inviteData, error: inviteErr } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo,
        data: { full_name, role: "caregiver" },
      });

    if (inviteErr || !inviteData?.user?.id) {
      return NextResponse.json({ error: inviteErr?.message || "Invite failed" }, { status: 400 });
    }

    const invitedUserId = inviteData.user.id;

    // Upsert profile for invited user
    const { error: upsertProfileErr } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          user_id: invitedUserId,
          family_id,
          role: "caregiver",
          is_active: true,
          full_name,
          email,
        },
        { onConflict: "user_id" }
      );

    if (upsertProfileErr) {
      return NextResponse.json(
        { error: `Failed to create caregiver profile: ${upsertProfileErr.message}` },
        { status: 500 }
      );
    }

    // Insert caregiver record (enforced login: user_id NOT NULL)
    const { error: caregiverErr } = await supabaseAdmin.from("caregivers").insert({
      family_id,
      user_id: invitedUserId,
      full_name,
      email,
      phone,
      is_active: true,
    });

    if (caregiverErr) {
      return NextResponse.json(
        { error: `Failed to create caregiver record: ${caregiverErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      invited_user_id: invitedUserId,
      redirectTo,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 });
  }
}
