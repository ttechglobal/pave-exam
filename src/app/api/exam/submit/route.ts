import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, autoSubmit } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { error } = await supabase
      .from("sessions")
      .update({
        status: autoSubmit ? "timeout" : "submitted",
        submitted_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("[/api/exam/submit]", error.message);
      return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/exam/submit]", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}