"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarDays,
  FaLocationDot,
  FaClock,
  FaTrophy,
  FaArrowRight,
  FaBolt,
  FaShieldHalved,
  FaUsers,
} from "react-icons/fa6";

export default function UpcomingFixturesSection() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Upcoming");

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch("/api/fixtures", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setMatches(Array.isArray(data.fixtures) ? data.fixtures : []);
        }
      } catch (err) {
        console.error("Error fetching fixtures:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  // Only show section when fixtures have been added from the admin panel
  if (loading || matches.length === 0) {
    return null;
  }

  // Compute dynamic filter tabs based on available matches
  const uniqueDays = Array.from(
    new Set(matches.map((m) => m.day).filter(Boolean))
  );
  const filters = ["All Upcoming", ...uniqueDays];

  const filteredMatches =
    activeFilter === "All Upcoming"
      ? matches
      : matches.filter((m) => m.day === activeFilter);

  return (
    <section
      id="fixtures"
      className="py-20 border-b border-white/10 bg-gradient-to-b from-[#0A0F1D] via-[#0D1527] to-[#0A0F1D] relative overflow-hidden"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/3 -left-32 size-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 size-[500px] rounded-full bg-sky-500/10 blur-[140px] pointer-events-none" />

      <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 sm:px-4 py-1 mb-3 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
              </span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                OFFICIAL MATCH SCHEDULE • 2027 EDITION
              </span>
            </div>
            <h2 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
              UPCOMING <span className="text-amber-400">FIXTURES</span>
            </h2>
            <p className="mt-2 text-xs sm:text-base text-slate-400 max-w-2xl font-normal leading-relaxed">
              Witness explosive 10-over faculty cricket showdowns live at Patuakhali Science and Technology University Central Ground.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-5 sm:px-6 py-2 sm:py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(245,158,11,0.55)] hover:scale-105 active:scale-95 transition-all"
            >
              <span>Schedule View</span>
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {/* Filter Tabs if multiple categories exist */}
        {filters.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-4 sm:pb-6 border-b border-white/10 mb-6 sm:mb-8">
            {filters.map((tab) => {
              const count =
                tab === "All Upcoming"
                  ? matches.length
                  : matches.filter((m) => m.day === tab).length;
              const active = activeFilter === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-3.5 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-amber-500 text-[#0A0F1D] shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105"
                      : "border border-white/10 bg-[#111827]/70 text-slate-400 hover:text-white hover:border-white/25 hover:bg-[#111827]"
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono ${
                      active ? "bg-[#0A0F1D]/30 text-[#0A0F1D]" : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match._id || match.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/80 p-4 sm:p-6 shadow-xl transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              {/* Top ambient card glow */}
              <div className="absolute -top-12 -right-12 size-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              <div>
                {/* Match header badge */}
                <div className="flex items-center justify-between pb-3 sm:pb-3.5 border-b border-white/10 mb-3 sm:mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
                      {match.matchNumber}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                      {match.stage}
                    </span>
                  </div>

                  {/* Upcoming Status Pill with pulse */}
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-400 shadow-sm">
                    <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                    {match.status || "UPCOMING"}
                  </span>
                </div>

                {/* Team vs Team Layout (Larger section with circular team icons) */}
                <div className="py-3 flex items-center justify-between gap-3 sm:gap-4">
                  {/* Team 1 */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0">
                    <div
                      className={`size-16 sm:size-20 md:size-24 rounded-full bg-gradient-to-br ${
                        match.team1.color || "from-blue-600 to-indigo-900"
                      } border-2 border-white/30 ring-2 ring-blue-500/30 flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-xl group-hover:scale-105 transition-transform duration-300`}
                    >
                      {match.team1.short || match.team1.name?.slice(0, 3)}
                    </div>
                    <h3 className="font-sans font-black text-sm sm:text-base md:text-lg text-white mt-2.5 line-clamp-2 px-1 leading-tight drop-shadow-md">
                      {match.team1.name}
                    </h3>
                    {match.team1.session && (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-1">
                        {match.team1.session}
                      </span>
                    )}
                  </div>

                  {/* Center VS & Time Display */}
                  <div className="flex flex-col items-center px-1 shrink-0">
                    <div className="size-9 sm:size-11 rounded-full bg-[#070A12] border border-amber-500/40 flex items-center justify-center text-xs sm:text-sm font-black text-amber-400 shadow-inner">
                      VS
                    </div>
                    <div className="mt-2 text-center">
                      <span className="block font-mono text-xs sm:text-sm font-black text-white tabular-nums">
                        {match.time}
                      </span>
                      <span className="block text-[9px] sm:text-[10px] font-bold text-amber-400/90 uppercase tracking-tight mt-0.5">
                        {match.format?.split(" ")[0] || "T10"}
                      </span>
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="flex flex-col items-center text-center flex-1 min-w-0">
                    <div
                      className={`size-16 sm:size-20 md:size-24 rounded-full bg-gradient-to-br ${
                        match.team2.color || "from-amber-600 to-yellow-800"
                      } border-2 border-white/30 ring-2 ring-amber-500/30 flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-xl group-hover:scale-105 transition-transform duration-300`}
                    >
                      {match.team2.short || match.team2.name?.slice(0, 3)}
                    </div>
                    <h3 className="font-sans font-black text-sm sm:text-base md:text-lg text-white mt-2.5 line-clamp-2 px-1 leading-tight drop-shadow-md">
                      {match.team2.name}
                    </h3>
                    {match.team2.session && (
                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 mt-1">
                        {match.team2.session}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Card Footer */}
              <div className="mt-5 pt-3.5 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <FaCalendarDays className="text-[11px] text-amber-400" />
                    <span>
                      {match.dayOfWeek ? `${match.dayOfWeek}, ` : ""}
                      {match.date}
                    </span>
                  </span>
                  {match.format && (
                    <span className="font-mono text-[10px] font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                      {match.format.split(" ")[0]}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 truncate">
                    <FaLocationDot className="text-[11px] text-slate-400 shrink-0" />
                    <span className="truncate">{match.venue || "Central Stadium, PSTU"}</span>
                  </span>

                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors shrink-0 ml-2"
                  >
                    <span>Match Center</span>
                    <FaArrowRight className="text-[9px]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
