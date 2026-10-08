import Image from "next/image";
import Link from "next/link";
import { FaClock, FaCalendarDays, FaUserPlus, FaArrowLeft } from "react-icons/fa6";
import SiteNavbar from "../components/site-navbar";
import PlayerRegistrationForm from "../components/player-registration-form";
import RegistrationRulesNotice from "../components/registration-rules-notice";
import SiteFooter from "../components/site-footer";

const container =
  "mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]";

export default function PlayerRegistrationPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1D] text-white relative overflow-hidden">
      <SiteNavbar />

      <section className="relative py-12 sm:py-16">
        {/* Stadium Background under dark overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            className="object-cover object-center opacity-30"
            src="/cricket-stadium-desktop-v2.png"
            alt="Cricket stadium"
            fill
            priority
          />
        </div>

        {/* Ambient mesh lighting */}
        <div className="absolute top-10 left-1/4 size-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 size-96 rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

        <div className={`${container} relative z-10`}>
          <div className="max-w-[920px] mx-auto">
            
            {/* Critical Deadline Banner */}
            <div className="mb-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#111827]/90 via-[#0D1527]/90 to-[#111827]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-amber-400" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    CRITICAL DEADLINE NOTICE
                  </span>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-black tracking-wider uppercase text-rose-300">
                  <FaClock className="text-xs" /> STRICT DEADLINE
                </span>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ATTENTION ALL STUDENTS & PLAYERS:
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight">
                  REGISTRATION CLOSES ON{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 underline decoration-amber-500/50">
                    27TH OCTOBER
                  </span>
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Player registration closes strictly at 11:59 PM (Midnight). Submit your authenticated student ID and clear passport photo to be evaluated for auction draft tiers.
                </p>
              </div>
            </div>

            <RegistrationRulesNotice />
            <PlayerRegistrationForm />

          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
