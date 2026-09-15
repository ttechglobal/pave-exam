"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// Lazy factory — avoids module-level eval during Next.js prerender
// when env vars aren't available in the build environment
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface Flag {
  type: string;
  section: number;
  timestamp: string;
  count: number;
}

interface Session {
  id: string;
  status: "active" | "submitted" | "timeout" | "locked";
  started_at: string;
  submitted_at: string | null;
  time_remaining: number;
  current_section: number;
  tab_switch_count: number;
  flags: Flag[];
  personal_details: {
    firstName: string;
    familyName: string;
    email: string;
    age: string;
    nationality: string;
    dateOfBirth: string;
  };
  answers: {
    section1: Record<string, unknown>;
    section2: Record<string, unknown>;
    section3: Record<string, unknown> & { score?: number };
  };
}

const statusConfig = {
  active: { label: "In Progress", color: "bg-green-100 text-green-700 border-green-200" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700 border-blue-200" },
  timeout: { label: "Timed Out", color: "bg-amber-100 text-amber-700 border-amber-200" },
  locked: { label: "Locked", color: "bg-red-100 text-red-700 border-red-200" },
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  const m = Math.floor((3600 - seconds) / 60);
  const s = (3600 - seconds) % 60;
  return `${m}m ${s}s elapsed`;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "submitted" | "locked">("all");
  const [newFlagAlert, setNewFlagAlert] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "section1" | "section2" | "section3">("overview");

  const fetchSessions = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from("sessions")
      .select("*")
      .order("started_at", { ascending: false });

    if (error) {
      setError("Failed to load sessions. Check your Supabase connection.");
      console.error(error);
    } else {
      setSessions(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();

    // Real-time subscription — updates appear instantly without page refresh
    const channel = getSupabase()
      .channel("sessions-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSessions((prev) => [payload.new as Session, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as Session;
            setSessions((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
            // If the selected session was updated, refresh it
            setSelectedSession((prev) =>
              prev?.id === updated.id ? updated : prev
            );
            // Show alert if new flag was added
            if (
              updated.tab_switch_count >
              (sessions.find((s) => s.id === updated.id)?.tab_switch_count ?? 0)
            ) {
              const name = `${updated.personal_details?.firstName} ${updated.personal_details?.familyName}`;
              setNewFlagAlert(`⚠️ New flag: ${name} (${updated.tab_switch_count} total)`);
              setTimeout(() => setNewFlagAlert(null), 5000);
            }
          } else if (payload.eventType === "DELETE") {
            setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, [fetchSessions]);

  const filtered = sessions.filter(
    (s) => filter === "all" || s.status === filter
  );

  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === "active").length,
    submitted: sessions.filter((s) => s.status === "submitted").length,
    flagged: sessions.filter((s) => s.tab_switch_count > 0).length,
    locked: sessions.filter((s) => s.status === "locked").length,
  };

  return (
    <div className="min-h-screen bg-[#EEEDF8]">

      {/* Topbar */}
      <header className="bg-[#0D0D2B] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-lg tracking-tight">
            pave<span className="text-[#5B5BD6]">.</span>
          </span>
          <span className="text-white/30">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-3 py-0.5">
            <span className="font-bold text-white text-xs italic">takk</span>
          </div>
          <span className="text-white/40 text-xs ml-2 hidden md:block">
            Invigilator Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 bg-green-900/40 border border-green-700/50
            rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live</span>
          </div>
          <button
            onClick={fetchSessions}
            className="text-white/50 hover:text-white text-xs transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* Flag alert toast */}
      {newFlagAlert && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white text-sm
          font-medium px-5 py-3 rounded-xl shadow-lg animate-bounce">
          {newFlagAlert}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total Sessions", value: stats.total, color: "text-[#0D0D2B]" },
            { label: "In Progress", value: stats.active, color: "text-green-600" },
            { label: "Submitted", value: stats.submitted, color: "text-blue-600" },
            { label: "Flagged", value: stats.flagged, color: "text-amber-600" },
            { label: "Locked", value: stats.locked, color: "text-red-600" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-[#E0DEFC] p-5 shadow-sm"
            >
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4
            text-sm text-red-600 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="flex gap-6">

          {/* Session list */}
          <div className="flex-1 min-w-0">

            {/* Filter tabs */}
            <div className="flex gap-2 mb-4">
              {(["all", "active", "submitted", "locked"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all
                    ${filter === f
                      ? "bg-[#0D0D2B] text-white"
                      : "bg-white border border-[#E0DEFC] text-gray-500 hover:border-[#5B5BD6]"
                    }`}
                >
                  {f === "all" ? `All (${stats.total})` : f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-[#E0DEFC] p-12 text-center">
                <div className="w-8 h-8 border-2 border-[#5B5BD6]/30 border-t-[#5B5BD6]
                  rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Loading sessions...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E0DEFC] p-12 text-center">
                <p className="text-gray-400 text-sm">No sessions found.</p>
                <p className="text-gray-300 text-xs mt-1">
                  Sessions will appear here as candidates begin their exams.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((session) => {
                  const name = `${session.personal_details?.firstName ?? "—"} ${
                    session.personal_details?.familyName ?? ""
                  }`;
                  const cfg = statusConfig[session.status] ?? statusConfig.active;
                  const isFlagged = session.tab_switch_count > 0;

                  return (
                    <button
                      key={session.id}
                      onClick={() => { setSelectedSession(session); setDetailTab("overview"); }}
                      className={`w-full text-left bg-white rounded-2xl border p-5
                        transition-all hover:shadow-md
                        ${
                          selectedSession?.id === session.id
                            ? "border-[#5B5BD6] shadow-sm shadow-[#5B5BD6]/10"
                            : isFlagged
                            ? "border-amber-200 hover:border-amber-300"
                            : "border-[#E0DEFC] hover:border-[#C4C2F0]"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center
                              text-xs font-bold text-white flex-shrink-0
                              ${
                                session.status === "locked"
                                  ? "bg-red-500"
                                  : session.status === "submitted"
                                  ? "bg-[#5B5BD6]"
                                  : "bg-[#0D0D2B]"
                              }`}
                          >
                            {(session.personal_details?.firstName?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0D0D2B]">{name}</p>
                            <p className="text-xs text-gray-400">
                              {session.personal_details?.nationality} ·{" "}
                              {formatTime(session.started_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Section progress */}
                          <div className="hidden md:flex gap-1">
                            {[1, 2, 3].map((s) => (
                              <div
                                key={s}
                                className={`w-5 h-1.5 rounded-full
                                  ${
                                    s < session.current_section
                                      ? "bg-[#5B5BD6]"
                                      : s === session.current_section &&
                                        session.status === "active"
                                      ? "bg-[#5B5BD6] opacity-50"
                                      : "bg-gray-200"
                                  }`}
                              />
                            ))}
                          </div>

                          {/* Flags badge */}
                          {isFlagged && (
                            <span className="bg-amber-100 border border-amber-200 text-amber-700
                              text-xs font-bold px-2 py-0.5 rounded-full">
                              ⚠️ {session.tab_switch_count}
                            </span>
                          )}

                          {/* Status badge */}
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border
                              ${cfg.color}`}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail panel */}
          {selectedSession && (
            <div className="w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm
                overflow-hidden sticky top-6">

                {/* Panel header */}
                <div className="bg-[#0D0D2B] px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-base">
                        {selectedSession.personal_details?.firstName}{" "}
                        {selectedSession.personal_details?.familyName}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {selectedSession.personal_details?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => { setSelectedSession(null); setDetailTab("overview"); }}
                      className="text-gray-400 hover:text-white text-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Tab nav */}
                <div className="flex border-b border-[#E0DEFC] px-4 pt-3 bg-gray-50 gap-1">
                  {(["overview", "section1", "section2", "section3"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all capitalize
                        ${detailTab === tab
                          ? "bg-white border border-b-white border-[#E0DEFC] text-[#5B5BD6] -mb-px"
                          : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {tab === "overview" ? "Overview" : tab === "section1" ? "Section 1" : tab === "section2" ? "Section 2" : "Section 3"}
                    </button>
                  ))}
                </div>

                <div className="p-6 space-y-5 max-h-[calc(100vh-240px)] overflow-y-auto">

                  {/* ── OVERVIEW TAB ── */}
                  {detailTab === "overview" && (<>
                  {/* Status + basic info */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                      Status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border
                          ${statusConfig[selectedSession.status]?.color}`}
                      >
                        {statusConfig[selectedSession.status]?.label}
                      </span>
                      <span className="text-xs text-gray-400 py-1.5">
                        Section {selectedSession.current_section} of 3
                      </span>
                    </div>
                  </div>

                  {/* Flags */}
                  <div
                    className={`rounded-xl border p-4
                      ${
                        selectedSession.tab_switch_count === 0
                          ? "bg-green-50 border-green-100"
                          : selectedSession.tab_switch_count >= 5
                          ? "bg-red-50 border-red-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2 text-gray-500">
                      Tab-Switch Violations
                    </p>
                    <p
                      className={`text-2xl font-black mb-1
                        ${
                          selectedSession.tab_switch_count === 0
                            ? "text-green-600"
                            : selectedSession.tab_switch_count >= 5
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                    >
                      {selectedSession.tab_switch_count} / 5
                    </p>
                    {selectedSession.flags && selectedSession.flags.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {selectedSession.flags.map((flag, i) => (
                          <div key={i} className="flex items-center justify-between text-xs border-t border-amber-100 pt-2">
                            <span className="text-amber-700 font-medium">Warning {flag.count} · Section {flag.section}</span>
                            <span className="text-amber-500">
                              {new Date(flag.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-600 mt-1">No violations recorded.</p>
                    )}
                  </div>

                  {/* Timing */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Timing</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Started</span>
                        <span className="text-[#0D0D2B] font-medium">{formatTime(selectedSession.started_at)}</span>
                      </div>
                      {selectedSession.submitted_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Submitted</span>
                          <span className="text-[#0D0D2B] font-medium">{formatTime(selectedSession.submitted_at)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time used</span>
                        <span className="text-[#0D0D2B] font-medium">{formatDuration(selectedSession.time_remaining)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate details */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Candidate</p>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Nationality", selectedSession.personal_details?.nationality],
                        ["Age", selectedSession.personal_details?.age],
                        ["Date of Birth", selectedSession.personal_details?.dateOfBirth],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-500">{label}</span>
                          <span className="text-[#0D0D2B] font-medium">{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Maths score */}
                  {selectedSession.answers?.section3?.score !== undefined && (
                    <div className="bg-[#EEEDF8] border border-[#E0DEFC] rounded-xl p-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Maths Score</p>
                      <p className="text-3xl font-black text-[#5B5BD6]">
                        {selectedSession.answers.section3.score as number}
                        <span className="text-gray-300 text-lg font-normal"> / 11</span>
                      </p>
                    </div>
                  )}

                  {/* Session ID */}
                  <div>
                    <p className="text-xs text-gray-300 font-mono break-all">ID: {selectedSession.id}</p>
                  </div>
                  </>)}

                  {/* ── SECTION 1 TAB — Health & Ability ── */}
                  {detailTab === "section1" && (
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Health &amp; Ability to Manage Living in Finland
                      </p>
                      {!selectedSession.answers?.section1 || Object.keys(selectedSession.answers.section1).length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No responses recorded yet.</p>
                      ) : (<>
                        {/* Physical health */}
                        {(selectedSession.answers.section1 as any).physicalHealth && (
                          <div className="bg-[#EEEDF8] rounded-xl border border-[#E0DEFC] p-4">
                            <p className="text-xs text-gray-400 mb-1 font-medium">Q1 — Physical Condition</p>
                            <p className="text-sm font-semibold text-[#0D0D2B] capitalize">
                              {(selectedSession.answers.section1 as any).physicalHealth === "healthy"
                                ? "✅ Physically healthy — no limitations"
                                : "⚠️ Has physical limitations"}
                            </p>
                            {(selectedSession.answers.section1 as any).physicalLimitationDetail && (
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                {(selectedSession.answers.section1 as any).physicalLimitationDetail}
                              </p>
                            )}
                          </div>
                        )}
                        {/* Responsibilities */}
                        <div className="bg-[#EEEDF8] rounded-xl border border-[#E0DEFC] p-4">
                          <p className="text-xs text-gray-400 mb-1 font-medium">Q2 — Student Responsibilities</p>
                          <p className="text-sm font-semibold text-[#0D0D2B]">
                            {(selectedSession.answers.section1 as any).agreedToResponsibilities
                              ? "✅ Agreed to responsibilities"
                              : "❌ Did not agree"}
                          </p>
                        </div>
                      </>)}
                    </div>
                  )}

                  {/* ── SECTION 2 TAB — Personal Background ── */}
                  {detailTab === "section2" && (() => {
                    const s2 = selectedSession.answers?.section2 as any;
                    const s2Questions: [string, string][] = [
                      ["knowledgeOfFinland",  "What do you know about Finland?"],
                      ["reasonsForMoving",    "Main reasons for wanting to move to Finland?"],
                      ["adaptationPlan",      "How would you adapt to living in a new country?"],
                      ["lifeSituation",       "How does your life situation fit with full-time studies?"],
                      ["futurePlans",         "Future plans after graduation?"],
                      ["whyChooseYou",        "Why should we choose you?"],
                      ["workExperience",      "Do you have any work experience?"],
                    ];
                    return (
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Personal Background &amp; Motivation
                        </p>
                        {!s2 || Object.keys(s2).length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No responses recorded yet.</p>
                        ) : (
                          s2Questions.map(([key, label], i) => (
                            <div key={key} className="bg-[#EEEDF8] rounded-xl border border-[#E0DEFC] p-4">
                              <p className="text-xs text-gray-400 mb-1 font-medium">Q{i + 1} — {label}</p>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {s2[key] || <span className="italic text-gray-300">Not answered</span>}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })()}

                  {/* ── SECTION 3 TAB — Maths ── */}
                  {detailTab === "section3" && (() => {
                    const s3 = selectedSession.answers?.section3 as any;
                    return (
                      <div className="space-y-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                          Mathematical Reasoning
                        </p>
                        {!s3 || Object.keys(s3).length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No responses recorded yet.</p>
                        ) : (<>
                          {s3.score !== undefined && (
                            <div className="bg-[#EEEDF8] border border-[#E0DEFC] rounded-xl p-5 text-center">
                              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-widest">Final Score</p>
                              <p className="text-4xl font-black text-[#5B5BD6]">
                                {s3.score}
                                <span className="text-gray-300 text-xl font-normal"> / 11</span>
                              </p>
                            </div>
                          )}
                          {/* Individual answers */}
                          {Object.entries(s3)
                            .filter(([k]) => k !== "score")
                            .map(([key, val], i) => (
                              <div key={key} className="bg-[#EEEDF8] rounded-xl border border-[#E0DEFC] p-4">
                                <p className="text-xs text-gray-400 mb-1 font-medium">Question {i + 1}</p>
                                <p className="text-sm text-gray-700 font-semibold">{String(val) || "—"}</p>
                              </div>
                            ))}
                        </>)}
                      </div>
                    );
                  })()}

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}