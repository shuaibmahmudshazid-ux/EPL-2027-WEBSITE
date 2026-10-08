"use client";

import { useEffect, useState } from "react";

const TARGET_DATE = new Date("2026-10-27T00:00:00");
const pad = (value) => String(value).padStart(2, "0");
const INITIAL_TIME_LEFT = { days: 17, hours: 21, minutes: 40, seconds: 0 };

const getTimeLeft = () => {
  const totalSeconds = Math.max(0, Math.floor((TARGET_DATE.getTime() - Date.now()) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

export default function CountdownCard({ className = "" }) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LEFT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTimeLeft = () => setTimeLeft(getTimeLeft());
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayTime = mounted ? timeLeft : INITIAL_TIME_LEFT;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#111827]/85 via-[#0D1527]/80 to-[#0A0F1D]/90 p-3.5 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-500/40 ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -left-16 size-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 size-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Header matching reference image: "Live Countdown / Live countdown" */}
      <div className="relative z-10 flex flex-col items-center text-center mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2 sm:size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2 sm:size-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
          </span>
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-amber-400">
            Live Countdown
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5">
          Live tournament countdown
        </p>
      </div>

      {/* Digits Display - matching exact reference image with colons */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 py-1 sm:py-2">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center min-w-[42px] xs:min-w-[52px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
              {pad(displayTime.days)}
            </span>
          </div>
          <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
            DAYS
          </span>
        </div>

        {/* Separator */}
        <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
          :
        </span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center min-w-[42px] xs:min-w-[52px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
              {pad(displayTime.hours)}
            </span>
          </div>
          <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
            HOURS
          </span>
        </div>

        {/* Separator */}
        <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center min-w-[42px] xs:min-w-[52px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
              {pad(displayTime.minutes)}
            </span>
          </div>
          <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
            MINUTES
          </span>
        </div>

        {/* Separator */}
        <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center min-w-[42px] xs:min-w-[52px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
            <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
              {pad(displayTime.seconds)}
            </span>
          </div>
          <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
            SECONDS
          </span>
        </div>
      </div>

      {/* Bottom status pill */}
      <div className="relative z-10 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-slate-200 backdrop-blur-md text-center">
          <span className="size-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span>Auction Date: <strong className="text-amber-400">Upcoming</strong></span>
        </div>
      </div>
    </div>
  );
}
