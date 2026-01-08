import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    // 1) Read bearer token from client
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2) Validate caller (must be logged in)
    const supabase = createClient(url, anon, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callerId = userData.user.id;

    // 3) Check caller is an active admin + get family_id
    const { data: callerProfile, error: profErr } = await supabase
      .from("profiles")
      .select("family_id, role, is_active")
      .eq("user_id", callerId)
      .single();

    if (
      profErr ||
      !callerProfile ||
      callerProfile.is_active !== true ||
      callerProfile.role !== "admin" ||
      !callerProfile.family_id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4) Parse request
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const full_name = String(body.full_name || "").trim();
    const tempPassword = String(body.temp_password || "").trim(); // optional

    if (!email || !full_name) {
      return NextResponse.json({ error: "Missing email or full_name" }, { status: 400 });
    }

    // 5) Create Auth user (Admin API)
    // Option A: set a temp password
    // Option B: omit password + invite via email (recommended for security)
    const createPayload: any = {
      email,
      email_confirm: true,
      user_metadata: { full_name },
    };
    if (tempPassword) createPayload.password = tempPassword;

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser(createPayload);
    if (createErr || !created?.user) {
      return NextResponse.json({ error: createErr?.message || "Failed to create user" }, { status: 400 });
    }

    const newUserId = created.user.id;

    // 6) Insert into profiles with same family_id, role=admin
    const { error: insErr } = await supabaseAdmin.from("profiles").insert({
      user_id: newUserId,
      family_id: callerProfile.family_id,
      role: "admin",
      is_active: true,
      full_name,
      email,
    });

    if (insErr) {
      // rollback Auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_id: newUserId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
