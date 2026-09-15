"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import type { Section1Answers } from "@/types";

// Exact responsibilities from the TAKK Entrance Exam document
const responsibilities = [
  "Students are responsible for their own financial situation and for financing their studies.",
  "TAKK does not provide any financial support for any students.",
  "TAKK provides teaching and help finding practical placements during studies.",
  "Practical placements during studies are typically unpaid in Finland.",
  "Practical placements may involve shifts in early or late hours of the day and weekends.",
  "TAKK does not provide or cannot be held responsible for finding part-time or any workplace for students.",
  "Students are required to be present at school during school days. Unauthorised absences may lead to discontinuation of studies.",
  "During free time, students may do part-time work if they find the job themselves. Finding work in Finland is usually difficult without language skills. Therefore, students need to have enough savings for the duration of studies.",
  "Studies are at TAKK campuses in Tampere area. Distance learning is not used with international students.",
  "Termination of studies might affect the residence permit status of individuals.",
  "Students are ultimately responsible for learning the Finnish language. Learning the language can be difficult and requires students to use some of their free time to study independently. TAKK provides weekly Finnish classes.",
];

const TOTAL_PAGES = 2;

export default function Section1() {
  const router = useRouter();
  const { updateSection1, section1, sessionId, setCurrentSection } = useExamStore();
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState<Partial<Record<keyof Section1Answers, string>>>({});
  const [loading, setLoading] = useState(false);

  const validatePage = (p: number): boolean => {
    const newErrors: Partial<Record<keyof Section1Answers, string>> = {};
    if (p === 1) {
      if (!section1.physicalHealth)
        newErrors.physicalHealth = "Please select one option.";
      if (
        section1.physicalHealth === "limited" &&
        !section1.physicalLimitationDetail?.trim()
      )
        newErrors.physicalLimitationDetail =
          "Please describe your physical limitations.";
    }
    if (p === 2) {
      if (!section1.agreedToResponsibilities)
        newErrors.agreedToResponsibilities =
          "You must agree to the responsibilities to proceed.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validatePage(page)) return;
    setErrors({});
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleComplete = async () => {
    if (!validatePage(page)) return;
    setLoading(true);
    try {
      await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          section: "section1",
          answers: section1,
        }),
      });
      setCurrentSection(2);
      router.push("/exam/section-intro?section=2");
    } catch (err) {
      console.error(err);
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
            Section 1 of 3
          </span>
          <span className="text-xs text-gray-400">
            Question {page} of {TOTAL_PAGES}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0D0D2B]">
          Health &amp; Ability to Manage Living in Finland
        </h1>
        <div className="mt-4 w-full bg-[#E0DEFC] rounded-full h-1.5">
          <div
            className="bg-[#5B5BD6] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(page / TOTAL_PAGES) * 100}%` }}
          />
        </div>
      </div>

      {/* Page 1 — Physical health */}
      {page === 1 && (
        <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm p-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Question 1</p>
          <h2 className="text-base font-semibold text-[#0D0D2B] mb-3 leading-relaxed">
            Please tick the option that best describes your physical condition:
            <span className="text-red-500 ml-1">*</span>
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Vocation programs in Finland require you to be sufficiently fit and able to
            do physical work. Work may require that you are standing on your feet for long
            hours, walking, bending down, carrying and moving items.
          </p>

          <div className="space-y-3">
            {[
              {
                value: "healthy",
                label:
                  "I am physically healthy. I have no injuries that limit physical movement.",
              },
              {
                value: "limited",
                label:
                  "I have physical limitations. I may struggle to do physical work.",
              },
            ].map((option) => {
              const isSelected = section1.physicalHealth === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer
                    transition-all duration-150
                    ${
                      isSelected
                        ? "border-[#5B5BD6] bg-[#EEEDF8]"
                        : "border-gray-200 hover:border-[#C4C2F0] bg-gray-50"
                    }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center
                      justify-center flex-shrink-0 transition-all
                      ${
                        isSelected
                          ? "border-[#5B5BD6] bg-[#5B5BD6]"
                          : "border-gray-300"
                      }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {option.label}
                  </span>
                  <input
                    type="radio"
                    name="physicalHealth"
                    value={option.value}
                    checked={isSelected}
                    onChange={() =>
                      updateSection1({
                        physicalHealth: option.value as "healthy" | "limited",
                      })
                    }
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>

          {errors.physicalHealth && (
            <p className="mt-3 text-xs text-red-500">{errors.physicalHealth}</p>
          )}

          {section1.physicalHealth === "limited" && (
            <div className="mt-5">
              <label className="block text-sm font-medium text-[#0D0D2B] mb-2">
                Please provide more information about your physical limitations:
                <span className="text-red-500 ml-1">*</span>
              </label>
              {/* KEY FIX: explicit text-gray-900 so typed text is visible */}
              <textarea
                rows={4}
                placeholder="Describe your physical limitations..."
                value={section1.physicalLimitationDetail ?? ""}
                onChange={(e) =>
                  updateSection1({ physicalLimitationDetail: e.target.value })
                }
                className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none
                  resize-none transition-all bg-gray-50 focus:bg-white
                  placeholder:text-gray-300 focus:ring-2 focus:ring-[#5B5BD6]
                  ${
                    errors.physicalLimitationDetail
                      ? "border-red-300"
                      : "border-gray-200"
                  }`}
              />
              {errors.physicalLimitationDetail && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.physicalLimitationDetail}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Page 2 — Responsibilities */}
      {page === 2 && (
        <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm p-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Question 2</p>
          <h2 className="text-base font-semibold text-[#0D0D2B] mb-2">
            Student Responsibilities Statement
          </h2>
          <p className="text-sm text-gray-500 mb-5 leading-relaxed">
            Please read the following responsibilities carefully before proceeding.
          </p>

          <div
            className="bg-[#EEEDF8] rounded-xl border border-[#E0DEFC] p-5 space-y-3
              max-h-72 overflow-y-auto mb-5"
          >
            {responsibilities.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="w-5 h-5 rounded-full bg-white border border-[#E0DEFC]
                    text-[#5B5BD6] text-xs font-bold flex items-center justify-center
                    flex-shrink-0 mt-0.5"
                >
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <label
            className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer
              transition-all duration-150
              ${
                section1.agreedToResponsibilities
                  ? "border-[#5B5BD6] bg-[#EEEDF8]"
                  : "border-gray-200 hover:border-[#C4C2F0] bg-gray-50"
              }`}
          >
            <input
              type="checkbox"
              checked={section1.agreedToResponsibilities ?? false}
              onChange={(e) =>
                updateSection1({ agreedToResponsibilities: e.target.checked })
              }
              className="mt-0.5 w-4 h-4 accent-[#5B5BD6] flex-shrink-0"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              I have read and understood my responsibilities and duties as a full-time student.
            </span>
          </label>

          {errors.agreedToResponsibilities && (
            <p className="mt-2 text-xs text-red-500">
              {errors.agreedToResponsibilities}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {page > 1 ? (
          <button
            onClick={() => {
              setErrors({});
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

        {page < TOTAL_PAGES ? (
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
            {loading ? "Saving..." : "Complete Section 1 →"}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        You cannot return to this section once you proceed.
      </p>
    </main>
  );
}