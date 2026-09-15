"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useExamStore } from "@/store/examStore";

function CompleteContent() {
  const searchParams = useSearchParams();
  const reason = searchParams?.get("reason") ?? null;
  const { personalDetails, reset } = useExamStore();
  const isTimeout = reason === "timeout";

  useEffect(() => {
    const timer = setTimeout(() => reset(), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#EEEDF8] flex flex-col items-center
      justify-center px-4">
      <div className="w-full max-w-lg text-center">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="font-black text-[#0D0D2B] text-xl tracking-tight">
            pave<span className="text-[#5B5BD6]">.</span>
          </span>
          <span className="text-gray-300 text-xl font-light">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-3 py-1">
            <span className="font-bold text-white text-sm italic">takk</span>
          </div>
        </div>

        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center
          mx-auto mb-6 text-4xl border-2
          ${isTimeout
            ? "bg-amber-50 border-amber-100"
            : "bg-[#EEEDF8] border-[#E0DEFC]"}`}>
          {isTimeout ? "⏱" : "✓"}
        </div>

        {/* Heading */}
        <h1 className={`text-3xl font-black mb-3
          ${isTimeout ? "text-amber-700" : "text-[#0D0D2B]"}`}>
          {isTimeout ? "Time's Up" : "Exam Submitted"}
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          {isTimeout
            ? "Your exam time has expired. Your answers up to this point have been automatically saved and submitted."
            : `Thank you, ${personalDetails.firstName}. Your exam has been successfully submitted.`}
        </p>

        <p className="text-gray-400 text-xs leading-relaxed">
          The admissions team at TAKK will review your responses and be in touch
          via the email address you provided.
        </p>

        {/* Next steps */}
        <div className="mt-8 bg-white border border-[#E0DEFC] rounded-2xl p-6 text-left
          shadow-sm">
          <h3 className="text-xs font-semibold text-[#0D0D2B] uppercase tracking-widest mb-4">
            What happens next
          </h3>
          <ul className="space-y-3">
            {[
              "Your responses are now being reviewed by the TAKK admissions panel.",
              "Do not attempt to retake the exam without official authorisation.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                <span className="w-5 h-5 rounded-full bg-[#EEEDF8] border border-[#E0DEFC]
                  text-[#5B5BD6] text-xs font-bold flex items-center justify-center
                  flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          © {new Date().getFullYear()} Pave × TAKK · Entrance Examination
        </p>
      </div>
    </main>
  );
}

export default function CompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEEDF8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    }>
      <CompleteContent />
    </Suspense>
  );
}