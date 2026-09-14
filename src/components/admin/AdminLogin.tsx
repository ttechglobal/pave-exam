"use client";

import { useState } from "react";

// These are compared client-side only — fine for an internal tool.
// Never put secrets here that need to stay hidden from the network tab.
const ADMIN_EMAIL    = process.env.NEXT_PUBLIC_ADMIN_EMAIL    ?? "admin@pave.com";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin123";

export default function AdminLogin() {
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    // Tiny delay so the spinner renders before the synchronous cookie write
    await new Promise((r) => setTimeout(r, 400));

    const emailOk = email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();
    const passOk  = password === ADMIN_PASSWORD;

    if (emailOk && passOk) {
      // Write the cookie BEFORE navigating so middleware sees it immediately
      document.cookie = "admin_session=1; path=/; max-age=28800; SameSite=Lax";
      // Hard redirect — forces a full request so Next.js middleware re-reads cookies
      window.location.replace("/dashboard");
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EEEDF8] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className="font-black text-[#0D0D2B] text-2xl tracking-tight">
            pave<span className="text-[#5B5BD6]">.</span>
          </span>
          <span className="text-gray-300 text-xl font-light">×</span>
          <div className="bg-[#9B1B6E] rounded-full px-4 py-1">
            <span className="font-bold text-white text-sm italic">takk</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E0DEFC] shadow-sm p-8">

          <div className="mb-7">
            <div className="inline-flex items-center gap-1.5 bg-[#EEEDF8] text-[#5B5BD6]
              text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B5BD6] inline-block" />
              Admin Portal
            </div>
            <h1 className="text-2xl font-bold text-[#0D0D2B]">Invigilator Sign In</h1>
            <p className="text-gray-400 text-sm mt-1">
              Access the live exam monitoring dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3
              text-sm text-red-700 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#0D0D2B] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@pave.com"
                value={email}
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                  text-gray-900 outline-none bg-gray-50 focus:bg-white
                  focus:ring-2 focus:ring-[#5B5BD6] focus:border-[#5B5BD6]
                  transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#0D0D2B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-200
                    text-sm text-gray-900 outline-none bg-gray-50 focus:bg-white
                    focus:ring-2 focus:ring-[#5B5BD6] focus:border-[#5B5BD6]
                    transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs
                    font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-6 w-full bg-[#5B5BD6] hover:bg-[#4a4ab8]
              disabled:bg-gray-200 disabled:text-gray-400
              text-white font-semibold text-sm py-3.5 rounded-xl
              transition-all shadow-sm shadow-[#5B5BD6]/25"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white
                  rounded-full animate-spin" />
                Verifying...
              </span>
            ) : "Sign In"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Restricted access · TAKK Entrance Examination Portal
        </p>
      </div>
    </main>
  );
}