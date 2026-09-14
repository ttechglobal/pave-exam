"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { timeRemaining, setTimeRemaining, sessionId, currentSection } = useExamStore();
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef(0);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1));
      if (timeRemaining <= 1) {
        clearInterval(timerRef.current!);
        handleAutoSubmit();
      }
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [timeRemaining]);

  const handleAutoSubmit = async () => {
    if (!sessionId) return;
    await fetch("/api/exam/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, autoSubmit: true }),
    });
    router.push("/complete?reason=timeout");
  };

  // ── Tab guard ──────────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden) triggerWarning(); };
    const handleBlur = () => triggerWarning();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [sessionId, currentSection]);

  const triggerWarning = async () => {
    warningRef.current += 1;
    const newCount = warningRef.current;
    setWarningCount(newCount);
    setShowWarning(true);

    if (sessionId) {
      await fetch("/api/admin/flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, type: "tab_switch", section: currentSection }),
      });
    }

    if (newCount >= 3) setLocked(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const isUrgent = timeRemaining <= 300;

  // ── Locked screen ──────────────────────────────────────────
  if (locked) {
    return (
      <div className="min-h-screen bg-[#EEEDF8] flex items-center justify-center px-4">
        <div className="text-center max-w-md bg-white rounded-2xl border border-[#E0DEFC]
          p-12 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex
            items-center justify-center text-2xl mx-auto mb-5">
            🔒
          </div>
          <h1 className="text-xl font-bold text-[#0D0D2B]">Exam Locked</h1>
          <p className="text-gray-500 mt-3 text-sm leading-relaxed">
            Your exam has been locked due to repeated tab-switch violations.
            This incident has been logged. Contact your invigilator immediately.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEEDF8] flex flex-col">

      {/* Sticky topbar */}
      <div className={`sticky top-0 z-50 w-full border-b px-6 py-3
        flex items-center justify-between
        ${isUrgent
          ? "bg-red-600 border-red-700"
          : "bg-[#0D0D2B] border-black/20"
        }`}>

        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="font-black text-white text-sm tracking-tight">
            pave<span className={isUrgent ? "text-red-300" : "text-[#5B5BD6]"}>.</span>
          </span>
          <span className="text-white/30 text-sm">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-2.5 py-0.5">
            <span className="font-bold text-white text-xs italic">takk</span>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 rounded-lg px-4 py-1.5
          ${isUrgent ? "bg-red-700/50" : "bg-white/5"}`}>
          <span className="text-white/50 text-xs">Time remaining</span>
          <span className={`font-mono font-bold text-base text-white
            ${isUrgent ? "animate-pulse" : ""}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Warnings */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i}
              className={`w-2 h-2 rounded-full transition-colors
                ${i <= warningCount ? "bg-red-400" : "bg-white/15"}`}
            />
          ))}
          <span className="text-white/40 text-xs ml-1 hidden sm:block">
            {warningCount}/3
          </span>
        </div>
      </div>

      {/* Warning modal */}
      {showWarning && !locked && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100
              flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-[#0D0D2B]">
              Warning {warningCount} of 3
            </h2>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              You switched tabs or left the exam window. This has been logged.
            </p>
            {warningCount === 2 && (
              <p className="mt-2 text-red-600 text-sm font-semibold">
                One more violation will permanently lock your exam.
              </p>
            )}
            <button
              onClick={() => setShowWarning(false)}
              className="mt-6 w-full bg-[#5B5BD6] hover:bg-[#4a4ab8] text-white
                font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Return to Exam
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">{children}</div>
    </div>
  );
}