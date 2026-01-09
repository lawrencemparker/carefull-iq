import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export type AdminContext = {
  user_id: string;
  family_id: string;
};

export async function requireActiveAdmin(req: Request): Promise<
  { ok: true; ctx: AdminContext } | { ok: false; res: NextResponse }
> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Missing Authorization Bearer token" }, { status: 401 }),
    };
  }

  const { data: callerData, error: callerErr } = await supabaseAdmin.auth.getUser(token);
  if (callerErr || !callerData?.user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Invalid session" }, { status: 401 }),
    };
  }

  const { data: callerProfile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("family_id, role, is_active")
    .eq("user_id", callerData.user.id)
    .maybeSingle();

  if (profErr || !callerProfile) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Caller profile not found" }, { status: 403 }),
    };
  }

  if (callerProfile.role !== "admin" || callerProfile.is_active !== true) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Admin privileges required" }, { status: 403 }),
    };
  }

  if (!callerProfile.family_id) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Caller family not found" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    ctx: {
      user_id: callerData.user.id,
      family_id: callerProfile.family_id,
    },
  };
}
