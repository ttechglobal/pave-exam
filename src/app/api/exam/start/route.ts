import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create inside a function so missing env vars return a clean JSON error
// instead of crashing the module and returning an empty 500 body
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const { personalDetails } = await req.json();

    if (!personalDetails?.firstName || !personalDetails?.familyName) {
      return NextResponse.json(
        { error: "Missing required personal details" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        status: "active",
        started_at: new Date().toISOString(),
        submitted_at: null,
        time_remaining: 3600,
        current_section: 1,
        tab_switch_count: 0,
        flags: [],
        personal_details: personalDetails,
        answers: { section1: {}, section2: {}, section3: {} },
      })
      .select("id")
      .single();

    if (error) {
      console.error("[/api/exam/start] Supabase error:", error.message);
      return NextResponse.json(
        { error: "Failed to create exam session. Check Supabase config." },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: data.id });
  } catch (err: any) {
    console.error("[/api/exam/start]", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status: 500 }
    );
  }
}