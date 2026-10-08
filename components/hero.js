"use client";

import Image from "next/image";
import Link from "next/link";
import { FaUserPlus, FaUsers, FaGavel, FaBolt, FaTrophy, FaArrowRight } from "react-icons/fa6";
import CountdownCard from "./countdown-card";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-0 sm:min-h-[620px] lg:min-h-[760px] overflow-hidden text-white flex items-center bg-[#0A0F1D] py-8 sm:py-12 lg:py-16"
    >
      {/* Stadium Background - with dramatic stadium night-match floodlights */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          className="hidden object-cover object-center md:block opacity-65 transition-opacity duration-1000 scale-105"
          src="/cricket-stadium-desktop-v2.png"
          alt="Cricket stadium night match under floodlights"
          fill
          priority
          sizes="100vw"
        />
        <Image
          className="object-cover object-center md:hidden opacity-55 transition-opacity duration-1000"
          src="/cricket-stadium-mobile.png"
          alt="Cricket stadium night match"
          fill
          priority
          sizes="100vw"
        />
      </div>

      {/* Atmospheric Overlays: Dark obsidian & midnight navy mesh vignetting */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0A0F1D]/95 via-[#0A0F1D]/80 to-[#0A0F1D]/55 md:from-[#0A0F1D]/90 md:via-[#0A0F1D]/75 md:to-[#0D1527]/60" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#0A0F1D] via-[#0A0F1D]/90 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-28 pointer-events-none bg-gradient-to-b from-[#0A0F1D]/80 to-transparent" />

      {/* Floodlight beams casting from top left and right */}
      <div className="absolute -top-32 left-10 size-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 right-10 size-[600px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 size-[400px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      {/* Main Content Grid: Left Countdown HUD + Right Heroic Headline */}
      <div className="relative z-10 mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Column (5 Cols): Countdown Timer HUD */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="w-full max-w-[460px]">
              <CountdownCard className="w-full" />
              
              {/* Micro Status Indicators underneath countdown */}
              <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-2.5">
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#111827]/70 p-2 xs:p-2.5 sm:p-3 text-center backdrop-blur-xl">
                  <span className="block text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</span>
                  <b className="text-xs xs:text-sm font-black text-white">T10 Cricket</b>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#111827]/70 p-2 xs:p-2.5 sm:p-3 text-center backdrop-blur-xl">
                  <span className="block text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Squads</span>
                  <b className="text-xs xs:text-sm font-black text-amber-400">6 Teams</b>
                </div>
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-[#111827]/70 p-2 xs:p-2.5 sm:p-3 text-center backdrop-blur-xl">
                  <span className="block text-[9px] xs:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Draft Pool</span>
                  <b className="text-xs xs:text-sm font-black text-emerald-400">100+ Players</b>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Hero Headline, Slogan & Frosted CTAs */}
          <div className="lg:col-span-7 order-1 lg:order-2 text-center lg:text-left">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 sm:px-4 py-1 sm:py-1.5 mb-4 sm:mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)] max-w-full">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
              </span>
              <span className="text-[10px] xs:text-xs font-black uppercase tracking-wider sm:tracking-widest text-amber-300 truncate">
                ESDM Premier League • 2027 Edition
              </span>
            </div>

            {/* Giant Title matching Reference Image */}
            <h1 className="font-sans font-black text-3xl xs:text-4xl sm:text-6xl xl:text-7xl uppercase tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
              ESDM PREMIER <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-400">
                LEAGUE 2027
              </span>
            </h1>

            {/* Subtitle matching Reference Image */}
            <p className="mt-3 sm:mt-4 text-base sm:text-xl md:text-2xl font-bold text-slate-300 max-w-2xl">
              Witness the Ultimate Faculty Cricket Spectacle
            </p>

            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl font-normal leading-relaxed">
              The premier department cricket showdown at Patuakhali Science and Technology University. 
              Top talent, high stakes, live auction bidding, and unforgettable sportsmanship.
            </p>

            {/* Two Prominent Glass-Morphism CTA Buttons as in Reference Image */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              {/* 1. Player Registration CTA */}
              <Link
                href="/player-registration"
                className="group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden"
              >
                <FaUserPlus className="text-sm" />
                <span>Player Registration</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* 2. Team Registration CTA */}
              <Link
                href="/team-registration"
                className="group inline-flex items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-white/20 bg-white/5 text-xs font-black uppercase tracking-wider text-white hover:text-amber-400 hover:border-amber-500/50 hover:bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:scale-[1.03] active:scale-95 transition-all backdrop-blur-xl"
              >
                <FaUsers className="text-sm text-amber-400" />
                <span>Team Registration</span>
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Organizer Crest Branding */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs text-slate-400">
              <span className="font-bold text-slate-300">Organized with pride by:</span>
              <div className="flex items-center gap-2">
                <Image
                  src="/addyanta-14-logo.png"
                  alt="Addyanta-14"
                  width={120}
                  height={45}
                  className="h-7 sm:h-8 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                />
              </div>
              <span className="text-slate-600 hidden xs:inline">•</span>
              <span className="text-slate-400 text-center sm:text-left">Faculty of ESDM, PSTU</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
