"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExamStore } from "@/store/examStore";
import type { PersonalDetails as PersonalDetailsType } from "@/types";

const fields = [
  { name: "familyName", label: "Family Name / Surname", type: "text", placeholder: "e.g. Johansson" },
  { name: "firstName",  label: "First Name",            type: "text", placeholder: "e.g. Maria" },
  { name: "age",        label: "Age",                   type: "number", placeholder: "e.g. 28" },
  { name: "dateOfBirth",label: "Date of Birth",         type: "date", placeholder: "" },
  { name: "nationality",label: "Nationality",           type: "text", placeholder: "e.g. Nigerian" },
  { name: "email",      label: "Email Address",         type: "email", placeholder: "e.g. maria@email.com" },
] as const;

export default function PersonalDetails() {
  const router = useRouter();
  const { setPersonalDetails, setSessionId } = useExamStore();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<PersonalDetailsType>>({});

  const [form, setForm] = useState<PersonalDetailsType>({
    familyName: "", firstName: "", age: "",
    dateOfBirth: "", nationality: "", email: "",
  });

  const validate = (): boolean => {
    const e: Partial<PersonalDetailsType> = {};
    if (!form.familyName.trim()) e.familyName = "Required";
    if (!form.firstName.trim())  e.firstName  = "Required";
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 16)
      e.age = "Enter a valid age (16+)";
    if (!form.dateOfBirth) e.dateOfBirth = "Required";
    if (!form.nationality.trim()) e.nationality = "Required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/exam/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalDetails: form }),
      });

      // Always parse JSON — our route always returns JSON now
      const json = await res.json();

      if (!res.ok || !json.sessionId) {
        setApiError(json.error ?? "Failed to start exam. Please try again.");
        setLoading(false);
        return;
      }

      setPersonalDetails(form);
      setSessionId(json.sessionId);
      router.push("/exam/section-intro?section=1");
    } catch (err) {
      console.error(err);
      setApiError("Network error. Check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EEEDF8] flex flex-col items-center justify-center px-4 py-16">

      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-black text-[#0D0D2B] text-xl tracking-tight">
            pave<span className="text-[#5B5BD6]">.</span>
          </span>
          <span className="text-gray-300 text-lg font-light">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-3 py-0.5">
            <span className="font-bold text-white text-xs italic">takk</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#0D0D2B]">Applicant Details</h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          Fill in your personal information accurately before starting the exam.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E0DEFC] shadow-sm p-8">

        {apiError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3
            text-sm text-red-600 flex items-start gap-2">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fields.map((field) => (
            <div key={field.name} className={field.name === "email" ? "md:col-span-2" : ""}>
              <label className="block text-sm font-medium text-[#0D0D2B] mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border text-sm text-gray-900 outline-none
                  transition-all bg-gray-50 focus:bg-white placeholder:text-gray-300
                  focus:ring-2 focus:ring-[#5B5BD6] focus:border-[#5B5BD6]
                  ${errors[field.name] ? "border-red-300 focus:ring-red-400" : "border-gray-200"}`}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#EEEDF8] border border-[#E0DEFC] rounded-xl p-4 text-sm text-gray-500">
          <strong className="text-[#0D0D2B]">Before you proceed:</strong>{" "}
          Ensure your environment is quiet. The 60-minute timer begins immediately after you enter the exam.
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 w-full bg-[#5B5BD6] hover:bg-[#4a4ab8] disabled:bg-gray-200
            disabled:text-gray-400 text-white font-bold text-sm py-4 rounded-xl
            transition-all duration-200 shadow-sm shadow-[#5B5BD6]/25"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Setting up your exam...
            </span>
          ) : (
            "Proceed to Exam →"
          )}
        </button>
      </div>
    </main>
  );
}