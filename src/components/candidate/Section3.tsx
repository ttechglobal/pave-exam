"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";

// Exact questions from the TAKK Entrance Exam document
const questions = [
  {
    key: "q1",
    question: "There are 31 apples in a basket. Lisa takes 13 apples. How many apples are left in the basket?",
    options: [
      { id: "a", text: "13" },
      { id: "b", text: "17" },
      { id: "c", text: "18" },
      { id: "d", text: "44" },
      { id: "e", text: "31" },
    ],
    answer: "c",
  },
  {
    key: "q2",
    question: "If you have nine pens and you buy four more pens, how many pens do you have?",
    options: [
      { id: "a", text: "12" },
      { id: "b", text: "36" },
      { id: "c", text: "11" },
      { id: "d", text: "13" },
      { id: "e", text: "5" },
    ],
    answer: "d",
  },
  {
    key: "q3",
    question: "Lisa has four dogs and two cats. Each of these animals has four legs. How many legs do the animals have in total?",
    options: [
      { id: "a", text: "16" },
      { id: "b", text: "18" },
      { id: "c", text: "24" },
      { id: "d", text: "22" },
      { id: "e", text: "20" },
    ],
    answer: "c",
  },
  {
    key: "q4",
    question: "If one bird lays five eggs, how many eggs can 7 birds lay?",
    options: [
      { id: "a", text: "28" },
      { id: "b", text: "21" },
      { id: "c", text: "27" },
      { id: "d", text: "35" },
      { id: "e", text: "42" },
    ],
    answer: "d",
  },
  {
    key: "q5",
    question: "Look at this series: 3, 9, 15, 21, 27, ... What comes next?",
    options: [
      { id: "a", text: "29" },
      { id: "b", text: "33" },
      { id: "c", text: "35" },
      { id: "d", text: "41" },
      { id: "e", text: "43" },
    ],
    answer: "b",
  },
  {
    key: "q6",
    question: "Look at the series: 77, 68, 59, 50, 41, ... What comes next?",
    options: [
      { id: "a", text: "31" },
      { id: "b", text: "33" },
      { id: "c", text: "32" },
      { id: "d", text: "22" },
      { id: "e", text: "40" },
    ],
    answer: "c",
  },
  {
    key: "q7",
    question: "You have 4.2 decilitres of water. You remove half. How much water do you have left?",
    options: [
      { id: "a", text: "Half a litre" },
      { id: "b", text: "0.8 decilitres" },
      { id: "c", text: "2.2 decilitres" },
      { id: "d", text: "2 litres" },
      { id: "e", text: "2.1 decilitres" },
    ],
    answer: "e",
  },
  {
    key: "q8",
    question: "1 decilitre is 100 millilitres. How many millilitres is 3.2 decilitres?",
    options: [
      { id: "a", text: "3200 millilitres" },
      { id: "b", text: "32 millilitres" },
      { id: "c", text: "320 millilitres" },
      { id: "d", text: "640 millilitres" },
      { id: "e", text: "40 millilitres" },
    ],
    answer: "c",
  },
  {
    key: "q9",
    question: "1 litre is 1000 millilitres. How many litres is 400 millilitres?",
    options: [
      { id: "a", text: "4 litres" },
      { id: "b", text: "40 litres" },
      { id: "c", text: "400 litres" },
      { id: "d", text: "0.4 litres" },
      { id: "e", text: "0.04 litres" },
    ],
    answer: "d",
  },
  {
    key: "q10",
    question: "Given instruction is to put 2 millilitres of cleaning agent to 1 litre of water. You have 5 litres of water. How many millilitres of cleaning agent do you need?",
    options: [
      { id: "a", text: "10 millilitres" },
      { id: "b", text: "5 millilitres" },
      { id: "c", text: "2 millilitres" },
      { id: "d", text: "4 millilitres" },
      { id: "e", text: "20 millilitres" },
    ],
    answer: "a",
  },
  {
    key: "q11",
    question: "Given instruction is to put 50 millilitres of cleaning agent to 1 litre of water. You have 5 litres of water. How many decilitres of cleaning agent do you need if 1 decilitre is 100 millilitres?",
    options: [
      { id: "a", text: "200 decilitres" },
      { id: "b", text: "25 decilitres" },
      { id: "c", text: "50 decilitres" },
      { id: "d", text: "2.5 decilitres" },
      { id: "e", text: "20 millilitres" },
    ],
    answer: "d",
  },
] as const;

type QuestionKey = (typeof questions)[number]["key"];
type AnswerId = string;

export default function Section3() {
  const router = useRouter();
  const { updateSection3, section3, sessionId } = useExamStore();
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const TOTAL = questions.length;
  const q = questions[page];
  const selected: AnswerId | undefined = (section3 as unknown as Record<string, string>)[q.key];

  const validateCurrent = (): boolean => {
    if (!selected) {
      setError("Please select an answer before continuing.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrent()) return;
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateScore = (): number =>
    questions.reduce(
      (score, question) =>
        (section3 as unknown as Record<string, string>)[question.key] === question.answer
          ? score + 1
          : score,
      0
    );

  const handleSubmit = async () => {
    if (!validateCurrent()) return;
    setLoading(true);
    try {
      const score = calculateScore();
      const finalAnswers = { ...(section3 as unknown as Record<string, string>), score };

      await fetch("/api/exam/save-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          section: "section3",
          answers: finalAnswers,
        }),
      });

      await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, autoSubmit: false }),
      });

      setSubmitted(true);
      router.push("/complete");
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
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
            Section 3 of 3
          </span>
          <span className="text-xs text-gray-400">
            Question {page + 1} of {TOTAL}
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#0D0D2B]">Mathematical Reasoning</h1>
        <div className="mt-4 w-full bg-[#E0DEFC] rounded-full h-1.5">
          <div
            className="bg-[#5B5BD6] h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${((page + 1) / TOTAL) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-100
          rounded-xl px-4 py-2.5 text-xs text-red-700">
          <span>🚫</span>
          <span>
            Calculators and mobile phones are{" "}
            <strong>strictly prohibited</strong> in this section.
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className={`bg-white rounded-2xl border shadow-sm p-8 transition-all
        ${error ? "border-red-200" : "border-[#E0DEFC]"}`}>
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">
          Question {page + 1}
        </p>
        <h2 className="text-base font-semibold text-[#0D0D2B] mb-6 leading-relaxed">
          {q.question}
        </h2>

        <div className="space-y-3">
          {q.options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer
                  transition-all duration-150 select-none
                  ${
                    isSelected
                      ? "border-[#5B5BD6] bg-[#EEEDF8]"
                      : "border-gray-200 hover:border-[#C4C2F0] bg-gray-50 hover:bg-[#F8F7FE]"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center
                    justify-center flex-shrink-0 text-xs font-bold transition-all
                    ${
                      isSelected
                        ? "border-[#5B5BD6] bg-[#5B5BD6] text-white"
                        : "border-gray-200 text-gray-400 bg-white"
                    }`}
                >
                  {option.id.toUpperCase()}
                </div>
                <span
                  className={`text-sm font-medium
                    ${isSelected ? "text-[#5B5BD6]" : "text-gray-700"}`}
                >
                  {option.text}
                </span>
                <input
                  type="radio"
                  name={q.key}
                  value={option.id}
                  checked={isSelected}
                  onChange={() =>
                    updateSection3({ [q.key]: option.id } as any)
                  }
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>

        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
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
            onClick={handleSubmit}
            disabled={loading || submitted}
            className="px-8 py-3 rounded-xl bg-[#5B5BD6] hover:bg-[#4a4ab8]
              disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold
              text-sm transition-all shadow-sm shadow-[#5B5BD6]/25"
          >
            {loading
              ? "Submitting..."
              : submitted
              ? "Submitted ✓"
              : "Submit Exam →"}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Once submitted, your exam cannot be changed.
      </p>
    </main>
  );
}