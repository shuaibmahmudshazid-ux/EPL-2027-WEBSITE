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
    <div className="relative grid min-h-screen place-items-center moving-gradient-admin px-4 py-12 text-white overflow-hidden">
      {/* Moving Ambient Aura Orbs */}
      <div className="moving-orb-gold -top-20 -left-20 size-96 opacity-40" />
      <div className="moving-orb-sage -bottom-20 -right-20 size-96 opacity-35" />

      <div className="relative z-10 w-full max-w-[430px]">
        {/* Back Link */}
        <div className="mb-5 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-[#f2c46a] transition-colors bg-black/40 px-3.5 py-1.5 rounded-full border border-white/20"
          >
            <FaArrowLeft className="text-[10px]" /> Back to EPL Home
          </Link>
        </div>

        <form
          className="rounded-3xl border-2 border-[#f2c46a] bg-[#1a1514] p-8 sm:p-9 shadow-[0_16px_40px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          onSubmit={submit}
        >
          {/* Header & Logo */}
          <div className="text-center mb-7">
            <div className="mx-auto mb-3.5 relative size-18">
              <Image
                src="/epl-logo.png"
                alt="EPL Logo"
                fill
                className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f2c46a] bg-[#f2c46a]/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#f2c46a] mb-2.5">
              <FaShieldHalved className="text-[10px]" />
              Secure Admin Console
            </div>
            <h1 className="font-sans font-black text-2xl sm:text-3xl tracking-tight text-white">
              EPL ADMIN <span className="text-[#f2c46a]">LOGIN</span>
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-[#fcf0da]">
              Sign in to manage EPL 2027 • ESDM Premier League.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4.5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#f2c46a] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <i className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aeac78] text-sm not-italic">
                  <FaEnvelope />
                </i>
                <input
                  className="h-12 w-full rounded-xl border-2 border-white/20 bg-[#120f0e] pl-10 pr-3 text-sm text-white font-medium placeholder-white/35 outline-none transition-all focus:border-[#f2c46a] focus:ring-2 focus:ring-[#f2c46a]/20"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#f2c46a] mb-1.5">
                Password
              </label>
              <div className="relative">
                <i className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aeac78] text-sm not-italic">
                  <FaLock />
                </i>
                <input
                  className="h-12 w-full rounded-xl border-2 border-white/20 bg-[#120f0e] pl-10 pr-3 text-sm text-white font-medium placeholder-white/35 outline-none transition-all focus:border-[#f2c46a] focus:ring-2 focus:ring-[#f2c46a]/20"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setEmail ? setPassword(event.target.value) : null}
                  required
                />
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mt-4 rounded-xl border-2 border-red-500 bg-red-950/70 p-3 text-xs font-bold text-white shadow-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="mt-7 h-12 w-full rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] text-sm font-black uppercase tracking-wider text-[#141110] shadow-[0_4px_16px_rgba(242,196,106,0.35)] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 transition-all cursor-pointer border border-[#f2c46a]"
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
