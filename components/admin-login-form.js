"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEnvelope, FaLock, FaArrowLeft, FaShieldHalved } from "react-icons/fa6";

const AdminLoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await response.text();
      const result = text ? JSON.parse(text) : {};
      if (!response.ok) throw new Error(result.error || "Unable to log in.");
      onSuccess(result.admin);
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-[#030d17] px-4 py-12 text-white overflow-hidden">
      {/* Background stadium glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-red-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Back Link */}
        <div className="mb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="text-[10px]" /> Back to EPL Home
          </Link>
        </div>

        <form
          className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#071927]/95 to-[#030d17]/95 p-7 sm:p-8 shadow-2xl backdrop-blur-xl"
          onSubmit={submit}
        >
          {/* Header & Logo */}
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 relative size-16">
              <Image
                src="/epl-logo.png"
                alt="EPL Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400 mb-2">
              <FaShieldHalved className="text-[9px]" />
              Secure Admin Console
            </div>
            <h1 className="font-sans font-black text-2xl tracking-tight text-white">
              EPL ADMIN <span className="text-[#d4a84f]">LOGIN</span>
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to manage EPL 2027 • ESDM Premier League.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <i className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs not-italic">
                  <FaEnvelope />
                </i>
                <input
                  className="h-11 w-full rounded-xl border border-white/20 bg-white/5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#c53030] focus:ring-2 focus:ring-[#c53030]/20"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <i className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs not-italic">
                  <FaLock />
                </i>
                <input
                  className="h-11 w-full rounded-xl border border-white/20 bg-white/5 pl-9 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-[#c53030] focus:ring-2 focus:ring-[#c53030]/20"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-[#c53030] to-[#991b1b] text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading ? "SIGNING IN..." : "SIGN IN TO ADMIN PANEL"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginForm;
