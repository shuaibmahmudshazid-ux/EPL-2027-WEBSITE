"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaCalendarDays,
  FaCheck,
  FaGavel,
  FaLayerGroup,
  FaShieldHalved,
  FaTrophy,
  FaUserPlus,
  FaUsers,
  FaBolt,
  FaChartLine,
  FaClock,
  FaLocationDot,
  FaNewspaper,
  FaCamera,
  FaShareNodes,
} from "react-icons/fa6";

import UpcomingFixturesSection from "./upcoming-fixtures-section";
import TournamentGallery from "./tournament-gallery";
import TournamentTeamsSection from "./tournament-teams-section";

const steps = [
  {
    num: "01",
    title: "Player Enrolment",
    desc: "Individual players submit academic session, playing category (Batter, Bowler, All-Rounder), and profile photo.",
    icon: FaUserPlus,
    link: "/player-registration",
    btn: "Register Player",
    color: "from-amber-500 to-amber-700",
  },
  {
    num: "02",
    title: "Team Key Verification",
    desc: "Authorized team managers claim their unique security key and register their franchise emblem and roster.",
    icon: FaUsers,
    link: "/team-registration",
    btn: "Register Team",
    color: "from-sky-500 to-blue-700",
  },
  {
    num: "03",
    title: "Tier Sorting",
    desc: "Players are evaluated and slotted into transparent auction categories (Platinum, Gold, Silver) with base prices.",
    icon: FaLayerGroup,
    link: "/auction",
    btn: "Explore Tiers",
    color: "from-emerald-500 to-teal-700",
  },
  {
    num: "04",
    title: "Live Arena Bidding",
    desc: "Real-time live player auction with virtual hammer chimes, real-time purse balance calculation, and projector stage.",
    icon: FaGavel,
    link: "/auction",
    btn: "Enter Auction",
    color: "from-amber-400 to-orange-600",
  },
];

const highlights = [
  {
    icon: FaTrophy,
    label: "T10 Match Format",
    detail: "Fast, energetic 10-over cricket with maximum drama and high run rates.",
    badge: "High Octane",
  },
  {
    icon: FaUsers,
    label: "6 Elite Squads",
    detail: "Compete across round-robin league fixtures into high-intensity playoffs.",
    badge: "Franchise League",
  },
  {
    icon: FaBolt,
    label: "100+ Draft Pool",
    detail: "The deepest talent pool of ESDM faculty students, athletes, and alumni.",
    badge: "Player Pool",
  },
  {
    icon: FaShieldHalved,
    label: "Championship Trophy",
    detail: "Custom broadcast-tier championship cup and individual medals for MVPs.",
    badge: "Prestige",
  },
];

export default function TournamentInfo() {
  return (
    <div className="relative text-white bg-[#0A0F1D]">

      {/* ======================================================== */}
      {/* 1. LIVE AUCTION TICKER / BROADCAST STATUS BAR            */}
      {/* ======================================================== */}
      <section className="border-y border-white/10 bg-[#070A12]/90 backdrop-blur-xl py-3 relative overflow-hidden">
        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
            
            {/* Left Status Pulse */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                LIVE BROADCAST FEED
              </span>
              <span className="hidden sm:inline-block h-3 w-px bg-white/20" />
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium">
                Auction Day: <strong className="text-white">Upcoming</strong>
              </span>
            </div>

            {/* Middle Quick Indicators */}
            <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span>Player Registration: <strong className="text-slate-200">Open until Midnight</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>Draft System: <strong className="text-slate-200">Stage Projector Active</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-sky-400" />
                <span>Format: <strong className="text-slate-200">T10 Hard Tennis</strong></span>
              </div>
            </div>

            {/* Right Action */}
            <Link
              href="/auction"
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black text-amber-400 hover:text-amber-300 uppercase tracking-wider transition-colors"
            >
              <FaGavel className="text-xs" />
              <span>Launch Auction Feed</span>
              <FaArrowRight className="text-[9px] sm:text-[10px]" />
            </Link>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. DEDICATED UPCOMING FIXTURES SECTION                   */}
      {/* ======================================================== */}
      <UpcomingFixturesSection />

      {/* ======================================================== */}
      {/* 2.5 PARTICIPATING TEAMS SECTION (CIRCULAR EMBLEMS)       */}
      {/* ======================================================== */}
      <TournamentTeamsSection />

      {/* ======================================================== */}
      {/* 3. TOURNAMENT GALLERY SECTION (ADMIN MANAGED)            */}
      {/* ======================================================== */}
      <TournamentGallery />

      {/* ======================================================== */}
      {/* 3. TOURNAMENT HIGHLIGHTS & FORMAT CARDS                   */}
      {/* ======================================================== */}
      <section id="features" className="py-12 sm:py-20 border-b border-white/10 bg-[#0A0F1D] relative">
        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 sm:px-4 py-1 mb-3">
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                Tournament Standards
              </span>
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
              Professional <span className="text-amber-400">Match Format</span>
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-400">
              Designed according to international broadcast standards with official umpire panels, player tiers, and live score keeping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/75 p-5 sm:p-6 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-11 sm:size-12 rounded-xl sm:rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg sm:text-xl shadow-inner">
                        <Icon />
                      </div>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-slate-300">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-sans font-black text-base sm:text-lg text-white mb-1.5 sm:mb-2">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 pt-3 border-t border-white/5 flex items-center text-[10px] sm:text-[11px] font-bold text-amber-400">
                    <span>Official Rulebook</span>
                    <FaArrowRight className="ml-1 text-[8px] sm:text-[9px]" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS: 4-STEP TOURNAMENT WORKFLOW              */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-24 border-b border-white/10 bg-gradient-to-b from-[#0D1527] to-[#0A0F1D] relative overflow-hidden">
        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 sm:px-4 py-1 mb-3">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-emerald-400">
                Complete Tournament Process
              </span>
            </div>
            <h2 className="font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-white">
              How It <span className="text-amber-400">Works</span>
            </h2>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-400">
              From player registration to raising the championship trophy — four seamless stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/75 p-5 sm:p-6 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Step number badge */}
                    <div className="flex items-center justify-between mb-4 sm:mb-5">
                      <span className="font-mono text-xl sm:text-2xl font-black text-amber-400/50 group-hover:text-amber-400 transition-colors">
                        {step.num}
                      </span>
                      <div className="size-10 sm:size-11 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-200 group-hover:text-amber-400 group-hover:border-amber-500/40 transition-colors">
                        <Icon className="text-base sm:text-lg" />
                      </div>
                    </div>

                    <h3 className="font-sans font-black text-base sm:text-lg text-white mb-1.5 sm:mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-5 sm:mb-6">
                      {step.desc}
                    </p>
                  </div>

                  <Link
                    href={step.link}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-[#0A0F1D] hover:bg-amber-400 hover:border-amber-400 transition-all shadow-md"
                  >
                    <span>{step.btn}</span>
                    <FaArrowRight className="text-[10px]" />
                  </Link>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. LIVE AUCTION CTA BANNER                               */}
      {/* ======================================================== */}
      <section className="py-12 sm:py-14 bg-[#070A12] relative overflow-hidden">
        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
          <div className="relative rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#111827] via-[#0D1527] to-[#111827] p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
            
            <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-black text-emerald-400 mb-3.5 sm:mb-4">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                AUCTION DATE: UPCOMING
              </span>
              <h3 className="font-sans font-black text-2xl sm:text-4xl text-white uppercase tracking-tight">
                Ready for the Live <span className="text-amber-400">Auction Arena?</span>
              </h3>
              <p className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Watch teams place live bids with synthesized hammer chimes, real-time purse calculation, and stage projector display.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
              <Link
                href="/auction"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-7 sm:px-8 py-3.5 sm:py-4 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 transition-all w-full sm:w-auto"
              >
                <FaGavel className="text-sm" />
                <span>Enter Live Auction Arena</span>
              </Link>
              
              <Link
                href="/player-registration"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 sm:py-4 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white hover:border-amber-500/50 hover:bg-white/10 transition-all w-full sm:w-auto"
              >
                <FaUserPlus className="text-xs text-amber-400" />
                <span>Player Registration</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
