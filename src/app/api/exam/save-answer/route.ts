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
    const { sessionId, section, answers } = await req.json();

    if (!sessionId || !section || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("answers")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updatedAnswers = {
      ...session.answers,
      [section]: { ...(session.answers?.[section] ?? {}), ...answers },
    };

    const { error } = await supabase
      .from("sessions")
      .update({
        answers: updatedAnswers,
        current_section: section === "section1" ? 2 : section === "section2" ? 3 : 3,
      })
      .eq("id", sessionId);

    if (error) {
      console.error("[/api/exam/save-answer]", error.message);
      return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/exam/save-answer]", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}