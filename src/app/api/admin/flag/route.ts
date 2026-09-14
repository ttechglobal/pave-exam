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
    const { sessionId, type, section } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("tab_switch_count, flags, status")
      .eq("id", sessionId)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const newTabCount = (session.tab_switch_count ?? 0) + 1;
    const newFlag = {
      type: type ?? "tab_switch",
      section: section ?? 1,
      timestamp: new Date().toISOString(),
      count: newTabCount,
    };

    const { error } = await supabase
      .from("sessions")
      .update({
        tab_switch_count: newTabCount,
        flags: [...(session.flags ?? []), newFlag],
        ...(newTabCount >= 3 && session.status === "active" ? { status: "locked" } : {}),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("[/api/admin/flag]", error.message);
      return NextResponse.json({ error: "Failed to log flag" }, { status: 500 });
    }

    return NextResponse.json({ success: true, tabSwitchCount: newTabCount, locked: newTabCount >= 3 });
  } catch (err: any) {
    console.error("[/api/admin/flag]", err?.message ?? err);
    return NextResponse.json({ error: err?.message ?? "Internal server error" }, { status: 500 });
  }
}