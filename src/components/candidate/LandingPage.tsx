"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#EEEDF8] flex flex-col">

      {/* Header */}
      <header className="w-full bg-[#EEEDF8] px-8 py-5 flex items-center justify-between
        border-b border-[#E0DEFC]">
        <div className="flex items-center gap-3">
          <span className="font-black text-[#0D0D2B] text-xl tracking-tight">
            pave<span className="text-[#5B5BD6]">.</span>
          </span>
          <span className="text-gray-300 text-lg font-light">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-3 py-0.5">
            <span className="font-bold text-white text-xs italic tracking-tight">takk</span>
          </div>
        </div>
        <span className="text-xs text-gray-400 hidden md:block">
          Official Entrance Examination Portal
        </span>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center px-4 pt-16 pb-12">

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-white border border-[#E0DEFC]
          rounded-full px-4 py-2 mb-8 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#9B1B6E]" />
          <span className="text-xs font-semibold text-[#0D0D2B]">
            Tampere Adult Education Centre — Vocational Qualification
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-[#0D0D2B] text-center
          leading-tight max-w-2xl">
          TAKK{" "}
          <span className="text-[#5B5BD6]">Entrance</span>
          <br />Examination
        </h1>

        {/* Meta cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
          {[
            { icon: "⏱", label: "Duration", value: "60 Minutes" },
            { icon: "📋", label: "Sections", value: "3 Sections" },
            { icon: "📷", label: "Monitored", value: "Webcam Active" },
            { icon: "🖥", label: "Environment", value: "No Tab Switching" },
          ].map((item) => (
            <div key={item.label}
              className="bg-white rounded-2xl border border-[#E0DEFC] p-5
                flex flex-col items-center gap-1.5 shadow-sm">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs text-gray-400">{item.label}</span>
              <span className="text-sm font-bold text-[#0D0D2B]">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-10 w-full max-w-3xl bg-white rounded-2xl border
          border-[#E0DEFC] shadow-sm overflow-hidden">
          <div className="bg-[#0D0D2B] px-8 py-5">
            <h2 className="text-white font-bold text-base">Examination Instructions</h2>
            <p className="text-gray-400 text-xs mt-0.5">Read carefully before you begin</p>
          </div>
          <div className="px-8 py-6 space-y-4">
            {[
              "Use this official entrance examination for the TAKK Vocational Qualification Programs.",
              "The examination consists of 3 sections: Health & Ability, Personal Background & Motivation, and Mathematical Reasoning.",
              "You have 60 minutes total. The timer starts immediately once you enter the exam and cannot be paused.",
              "Do not switch tabs, minimise, or leave this window at any point during the exam.",
              "You will receive up to 5 warnings for tab-switch violations. These will be logged and reviewed.",
              "Calculators, mobile phones, and any external aids are strictly prohibited.",
              "Ensure you are in a quiet, well-lit environment with a stable internet connection.",
              "You cannot return to a previous section once you advance.",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-6 h-6 rounded-full bg-[#EEEDF8] text-[#5B5BD6]
                  text-xs font-bold flex items-center justify-center flex-shrink-0 border
                  border-[#E0DEFC]">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="mt-6 w-full max-w-3xl bg-amber-50 border border-amber-100
          rounded-2xl p-5">
          <p className="text-sm text-amber-700 leading-relaxed">
            <span className="font-semibold">⚠️ Important:</span>{" "}
            By proceeding, you confirm that you are the registered applicant, alone in a
            quiet environment, and agree to be monitored throughout the session.
            Any misconduct will result in immediate disqualification.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/details")}
          className="mt-8 w-full max-w-3xl bg-[#5B5BD6] hover:bg-[#4a4ab8] text-white
            font-bold text-sm py-4 rounded-xl transition-all duration-200
            shadow-md shadow-[#5B5BD6]/25 hover:shadow-lg hover:shadow-[#5B5BD6]/30
            hover:-translate-y-0.5 active:translate-y-0"
        >
          I Have Read the Instructions — Begin Exam →
        </button>

        <p className="mt-3 text-xs text-gray-400 text-center">
          By proceeding, you agree to the examination terms and monitoring conditions.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#0D0D2B] px-8 py-4 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          © {new Date().getFullYear()} TAKK × Pave Education
        </span>
        <span className="text-xs text-gray-500">All rights reserved</span>
      </footer>
    </main>
  );
}