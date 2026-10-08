"use client";

import Link from "next/link";
import { FaCalendarDays, FaArrowRight, FaTriangleExclamation } from "react-icons/fa6";

const RegistrationDeadlineCard = ({ className = "" }) => {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border-2 border-[#f2c46a] bg-gradient-to-br from-[#26201e] via-[#1c1716] to-[#120f0e] p-5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-between ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute -top-12 -right-12 size-36 rounded-full bg-[#f2c46a]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-[#aeac78]/25 blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#f2c46a]/30 pb-3 mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f2c46a] opacity-80" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#f2c46a]" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-[#f2c46a] flex items-center gap-1.5">
            <FaTriangleExclamation className="text-[#f2c46a] text-sm" /> Important Deadline
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#f2c46a] px-2.5 py-0.5 text-[10px] font-black tracking-widest text-[#141110] uppercase shadow-sm">
          CLOSING SOON
        </span>
      </div>

      {/* Big Notice Body */}
      <div className="my-auto py-2 relative z-10">
        <span className="text-xs font-black tracking-widest text-[#aeac78] uppercase block mb-1">
          Player Registration Deadline:
        </span>
        <div className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-none text-[#f2c46a] drop-shadow-[0_2px_14px_rgba(242,196,106,0.5)]">
          UP TO 27TH OCTOBER
        </div>
        <p className="mt-2.5 text-xs sm:text-sm text-[#fffcf5] font-semibold leading-snug">
          Register now before the portal closes. No entries accepted after the deadline!
        </p>
      </div>

      {/* Bottom CTA / Action */}
      <div className="mt-3.5 pt-3 border-t border-[#f2c46a]/30 flex items-center justify-between text-xs relative z-10 gap-2">
        <span className="text-white font-bold flex items-center gap-1.5">
          <FaCalendarDays className="text-[#f2c46a]" /> Closes at Midnight
        </span>
        <Link
          href="/player-registration"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] hover:brightness-110 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#141110] shadow-[0_4px_14px_rgba(242,196,106,0.35)] transition-all border border-[#f2c46a]"
        >
          Register Now <FaArrowRight className="text-xs" />
        </Link>
      </div>
    </article>
  );
};

export default RegistrationDeadlineCard;
