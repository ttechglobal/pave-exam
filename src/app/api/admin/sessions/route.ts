import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .order("started_at", { ascending: false });

    if (error) {
      console.error("[/api/admin/sessions]", error.message);
      return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }

    return NextResponse.json({ sessions: data });
  } catch (err: any) {
    console.error("[/api/admin/sessions]", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}