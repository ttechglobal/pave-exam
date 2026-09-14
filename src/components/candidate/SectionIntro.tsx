"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const sectionData = {
  1: {
    number: 1,
    title: "Health & Ability to Manage Living in Finland",
    description:
      "This section assesses your physical health and your understanding of the responsibilities involved in studying and living in Finland as a full-time student.",
    instructions: [
      "Read each statement carefully before responding.",
      "Tick the option that honestly reflects your current physical condition.",
      "If you have physical limitations, provide clear details in the text box provided.",
      "You must agree to the responsibilities statement before proceeding.",
    ],
    duration: "Estimated time: 5 – 10 minutes",
    next: "/exam/section-1",
  },
  2: {
    number: 2,
    title: "Personal Background & Motivation",
    description:
      "This section explores your motivation for studying in Finland, your personal background, and your professional goals. All questions require written responses.",
    instructions: [
      "Answer all questions honestly and in full sentences.",
      "There is no word limit, but be clear and concise.",
      "Your answers will be reviewed by the admissions panel.",
      "Do not leave any question blank.",
    ],
    duration: "Estimated time: 20 – 25 minutes",
    next: "/exam/section-2",
  },
  3: {
    number: 3,
    title: "Mathematical Reasoning",
    description:
      "This section tests your basic numerical and logical reasoning ability through multiple choice questions. Only one answer is correct per question.",
    instructions: [
      "Read each question carefully before selecting your answer.",
      "Only one option is correct per question.",
      "The use of calculators or mobile phones is strictly prohibited.",
      "You cannot change your answer once you move to the next question.",
    ],
    duration: "Estimated time: 15 – 20 minutes",
    next: "/exam/section-3",
  },
};

function SectionIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionNum = Number(searchParams?.get("section") ?? "1") as 1 | 2 | 3;
  const section = sectionData[sectionNum];

  return (
    <main className="min-h-screen bg-[#EEEDF8] flex flex-col items-center
      justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="font-black text-[#0D0D2B] text-base tracking-tight">
              pave<span className="text-[#5B5BD6]">.</span>
            </span>
            <span className="text-gray-300 text-sm">×</span>
            <div className="bg-[#9B1B6E] rounded-full px-2.5 py-0.5">
              <span className="font-bold text-white text-xs italic">takk</span>
            </div>
          </div>
          {/* Section progress dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s}
                className={`rounded-full transition-all
                  ${s === sectionNum
                    ? "w-6 h-3 bg-[#5B5BD6]"
                    : s < sectionNum
                    ? "w-3 h-3 bg-[#5B5BD6] opacity-40"
                    : "w-3 h-3 bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm overflow-hidden">

          {/* Banner */}
          <div className="bg-[#0D0D2B] px-8 py-6">
            <span className="text-[#5B5BD6] text-xs font-semibold uppercase tracking-widest">
              Section {section.number} of 3
            </span>
            <h1 className="text-white text-2xl font-black mt-1">
              {section.title}
            </h1>
            <span className="text-gray-400 text-xs mt-2 block">
              {section.duration}
            </span>
          </div>

          <div className="px-8 py-8">
            <p className="text-gray-500 text-sm leading-relaxed">
              {section.description}
            </p>

            {/* Instructions */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-[#0D0D2B] uppercase tracking-widest mb-3">
                Instructions
              </h3>
              <ul className="space-y-3">
                {section.instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-[#EEEDF8] border
                      border-[#E0DEFC] text-[#5B5BD6] text-xs font-bold flex items-center
                      justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warning */}
            <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4
              text-sm text-amber-700 flex items-start gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>
                The 60-minute exam timer is running. Once you start this section,
                you cannot go back to a previous section.
              </span>
            </div>

            <button
              onClick={() => router.push(section.next)}
              className="mt-8 w-full bg-[#5B5BD6] hover:bg-[#4a4ab8] text-white
                font-bold text-sm py-4 rounded-xl transition-all duration-200
                shadow-sm shadow-[#5B5BD6]/25"
            >
              Start Section {section.number} →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SectionIntro() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EEEDF8] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading section...</p>
      </div>
    }>
      <SectionIntroContent />
    </Suspense>
  );
}