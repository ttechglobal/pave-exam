"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";

// Exact questions from the TAKK Entrance Exam document
const questions = [
  {
    key: "knowledgeOfFinland",
    label: "What do you know about Finland?",
    placeholder: "Share what you know about Finland — its culture, climate, education system, or anything else relevant...",
  },
  {
    key: "reasonsForMoving",
    label: "What are the main reasons for wanting to move to Finland?",
    placeholder: "Explain your personal and professional motivations for choosing Finland...",
  },
  {
    key: "adaptationPlan",
    label: "How would you adapt to living in a new country?",
    placeholder: "Describe the steps you would take to settle in and adjust to life in Finland...",
  },
  {
    key: "lifeSituation",
    label: "How does your life situation fit in with full-time studies in Finland? Is there anything in your life that may pose challenges for your participation in the programme?",
    placeholder: "Explain how your family, financial, and personal circumstances support or might challenge this commitment...",
  },
  {
    key: "futurePlans",
    label: "What are your future plans after graduation? Where do you see yourself in 5 years?",
    placeholder: "Describe your career goals and how this qualification will help you achieve them. Paint a picture of your life five years from now...",
  },
  {
    key: "whyChooseYou",
    label: "Why should we choose you in this programme?",
    placeholder: "Tell us what makes you a strong and committed candidate for this vocational qualification...",
  },
  {
    key: "workExperience",
    label: "Do you have any work experience?",
    placeholder: "Describe any work experience you have, including roles, duration, and key responsibilities...",
  },
] as const;

type Section2Key = (typeof questions)[number]["key"];

export default function Section2() {
  const router = useRouter();
  const { updateSection2, section2, sessionId, setCurrentSection } = useExamStore();
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const TOTAL = questions.length;
  const q = questions[page];
  const value: string = (section2 as unknown as Record<string, string>)[q.key] ?? "";

  const wordCount = (t: string) =>
    t.trim() === "" ? 0 : t.trim().split(/\s+/).length;
  const wc = wordCount(value);

  const validateCurrent = (): boolean => {
    if (!value.trim()) {
      setError("This question is required.");
      return false;
    }
    if (wc < 5) {
      setError("Please provide a more detailed answer (at least 5 words).");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;
    setError(null);
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async () => {
    if (!validateCurrent()) return;
    setLoading(true);
    try {
      await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          section: "section2",
          answers: section2,
        }),
      });
      setCurrentSection(3);
      router.push("/exam/section-intro?section=3");
    } catch (err) {
      console.error(err);
      setError("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#9B1B6E] uppercase tracking-widest">
            Section 2 of 3
          </span>
          <span className="text-xs text-gray-400">
            Question {page + 1} of {TOTAL}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0D0D2B]">
          Personal Background &amp; Motivation
        </h1>
        <div className="mt-4 w-full bg-[#E0DEFC] rounded-full h-1.5">
          <div
            className="bg-[#5B5BD6] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((page + 1) / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm p-8">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
          Question {page + 1}
        </p>
        <h2 className="text-base font-semibold text-[#0D0D2B] mb-5 leading-relaxed">
          {q.label}
          <span className="text-red-500 ml-1">*</span>
        </h2>

        {/* KEY FIX: explicit text-gray-900 so typed text is visible */}
        <textarea
          rows={7}
          placeholder={q.placeholder}
          value={value}
          onChange={(e) =>
            updateSection2({ [q.key]: e.target.value } as any)
          }
          className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none
            resize-none transition-all bg-gray-50 focus:bg-white
            placeholder:text-gray-300 focus:ring-2 focus:ring-[#5B5BD6]
            ${error ? "border-red-300 focus:ring-red-400" : "border-gray-200"}`}
        />

        <div className="flex items-center justify-between mt-2">
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ml-auto font-medium
              ${wc >= 5 ? "text-[#5B5BD6]" : "text-gray-300"}`}
          >
            {wc} {wc === 1 ? "word" : "words"}
            {wc >= 5 ? " ✓" : ""}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {page > 0 ? (
          <button
            onClick={() => {
              setError(null);
              setPage((p) => p - 1);
              window.scrollTo({ top: 0 });
            }}
            className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium
              text-gray-600 hover:bg-white hover:border-[#C4C2F0] transition-all"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        {page < TOTAL - 1 ? (
          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-[#0D0D2B] hover:bg-[#1a1a3e]
              text-white font-semibold text-sm transition-all"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#5B5BD6] hover:bg-[#4a4ab8]
              disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold
              text-sm transition-all shadow-sm shadow-[#5B5BD6]/25"
          >
            {loading ? "Saving..." : "Complete Section 2 →"}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        You cannot return to this section once you proceed.
      </p>
    </main>
  );
}