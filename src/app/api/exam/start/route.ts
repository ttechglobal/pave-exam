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

    // Block duplicate / retake attempts for the same email
    const email = personalDetails?.email?.toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("sessions")
      .select("id, status")
      .ilike("personal_details->>email", email)
      .limit(1)
      .maybeSingle();

    if (existing) {
      const isActive = existing.status === "active";
      return NextResponse.json(
        {
          error: isActive
            ? "An exam session is already in progress for this email address. Please contact your invigilator."
            : "An exam has already been submitted for this email address. Retakes are not permitted.",
          code: "DUPLICATE_EMAIL",
        },
        { status: 409 }
      );
    }

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