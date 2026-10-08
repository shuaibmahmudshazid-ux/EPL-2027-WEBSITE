"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaCircleCheck, FaArrowRight, FaGavel } from "react-icons/fa6";
import SiteNavbar from "../components/site-navbar";
import SiteFooter from "../components/site-footer";

export default function RegistrationSuccessPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const playerId = searchParams.get("playerId");

  return (
    <main className="min-h-screen bg-[#0A0F1D] text-white flex flex-col justify-between relative overflow-hidden">
      <SiteNavbar />

      <div className="relative py-16 sm:py-24 flex items-center justify-center">
        {/* Ambient mesh lighting */}
        <div className="absolute top-1/3 left-1/3 size-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/3 size-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

        <div className="mx-auto w-[min(1450px,calc(100%-36px))] relative z-10">
          <div className="mx-auto max-w-[600px] rounded-3xl border border-white/10 bg-[#111827]/85 p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
            
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-4xl text-[#0A0F1D] shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              <FaCircleCheck />
            </div>

            <h1 className="mt-6 font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-white leading-tight">
              Registration <span className="text-amber-400">Successful!</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300">
              {name ? (
                <>
                  Thank you, <strong className="text-white font-bold">{name}</strong>.
                </>
              ) : (
                "Thank you."
              )}{" "}
              Your player entry has been recorded in the EPL 2027 draft pool.
            </p>

            {playerId && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm text-slate-200">
                <span className="text-slate-400 font-medium">Verified Student ID:</span>
                <b className="font-mono text-base font-black text-amber-400">{playerId}</b>
              </div>
            )}

            <p className="mt-4 text-xs text-slate-400 leading-relaxed">
              The tournament evaluation committee will categorize your profile into the official
              auction tiers (Platinum, Gold, Silver) prior to the upcoming mega draft.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all"
                href="/"
              >
                Return to Home
              </Link>
              
              <Link
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                href="/auction"
              >
                <FaGavel className="text-amber-400 text-xs" />
                <span>Live Auction Preview</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
