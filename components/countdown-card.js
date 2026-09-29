"use client";

import { useEffect, useState } from "react";
const TARGET_DATE = new Date("2026-10-09T00:00:00");
const pad = (value) => String(value).padStart(2, "0");
const INITIAL_TIME_LEFT = { days: 0, hours: 0, minutes: 0, seconds: 0 };

const getTimeLeft = () => {
  const totalSeconds = Math.max(0, Math.floor((TARGET_DATE.getTime() - Date.now()) / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const CountdownCard = ({ className = "" }) => {
  // The initial value must be deterministic: Date.now() differs between the
  // server render and client hydration.
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME_LEFT);

  useEffect(() => {
    const updateTimeLeft = () => setTimeLeft(getTimeLeft());
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MIN", value: timeLeft.minutes },
    { label: "SEC", value: timeLeft.seconds },
  ];

  return (
    <article
      id="schedule"
      className={`rounded-2xl border border-white/20 bg-gradient-to-br from-[#071626]/90 via-[#030d17]/95 to-black/90 p-4 sm:p-5 text-white shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between border-b border-white/15 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444] opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#ef4444]" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Tournament Live Clock
          </span>
        </div>
        <span className="text-[11px] font-extrabold tracking-widest text-[#d4a84f] uppercase">
          AUCTION: 9TH OCTOBER
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        {units.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2 px-1 sm:py-2.5 transition-transform duration-200 hover:scale-[1.02] shadow-inner"
          >
            <b className="text-2xl sm:text-3xl md:text-4xl font-black tabular-nums text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {pad(value)}
            </b>
            <span className="mt-0.5 text-[9px] sm:text-[10px] font-bold tracking-wider text-[#d4a84f] uppercase">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-medium">
        <span>Countdown till: <b className="text-slate-200">8th October (Midnight)</b></span>
        <span className="font-bold text-[#d4a84f] flex items-center gap-1">
          🔨 Auction Day: 9th Oct
        </span>
      </div>
    </article>
  );
};

export default CountdownCard;
