"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaCalendarDays,
  FaLocationDot,
  FaClock,
  FaTrophy,
  FaFilter,
  FaArrowLeft,
  FaGavel,
  FaCircleDot,
  FaShieldHalved,
  FaSpinner,
} from "react-icons/fa6";
import SiteNavbar from "../components/site-navbar";
import SiteFooter from "../components/site-footer";

export default function SchedulePage() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        const res = await fetch("/api/fixtures", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setFixtures(Array.isArray(data.fixtures) ? data.fixtures : []);
        }
      } catch (err) {
        console.error("Failed to load schedule fixtures:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFixtures();
  }, []);

  const filteredMatches = fixtures.filter((m) => {
    if (filter === "all") return true;
    if (filter === "group") return (m.stage || "").toLowerCase().includes("group");
    if (filter === "playoffs")
      return (
        (m.stage || "").toLowerCase().includes("playoff") ||
        (m.stage || "").toLowerCase().includes("final") ||
        (m.day || "").toLowerCase().includes("playoff")
      );
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0A0F1D] text-white">
      <SiteNavbar />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-white/10 py-12 sm:py-20 bg-gradient-to-b from-[#0D1527] to-[#0A0F1D]">
        <div className="absolute top-0 left-1/3 size-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 sm:px-4 py-1 sm:py-1.5 mb-3 sm:mb-4 backdrop-blur-md">
              <span className="size-2 rounded-full bg-amber-400" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest text-amber-300">
                Official Tournament Fixtures
              </span>
            </div>

            <h1 className="font-sans font-black text-2xl xs:text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Matches & <span className="text-amber-400">Schedule</span>
            </h1>

            <p className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-300 max-w-2xl">
              Complete tournament schedule for the EPL 2027 T10 Cricket Championship. Held at PSTU
              Central Ground under official department umpires.
            </p>

            {/* Quick stats pills */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold text-slate-300">
                🏟️ Venue: Central Stadium, PSTU
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold text-slate-300">
                ⚡ Format: T10 (10 Overs / Side)
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold text-amber-400">
                🔨 Auction Date: Upcoming
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Fixtures Listing */}
      <section className="py-10 sm:py-16">
        <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))]">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-52 sm:h-56 rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/50 animate-pulse"
                />
              ))}
            </div>
          ) : fixtures.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-white/15 bg-[#111827]/40 p-6 sm:p-12 text-center backdrop-blur-xl max-w-2xl mx-auto">
              <div className="mx-auto size-14 sm:size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl sm:text-2xl mb-4 shadow-inner">
                <FaCalendarDays />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Official Tournament Schedule Coming Soon
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                The match fixtures and tournament timetable are currently being finalized by the
                organizing committee. All scheduled clashes will be displayed here once officially
                announced.
              </p>
            </div>
          ) : (
            <>
              {/* Filter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-amber-400 text-xs" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    Filter By:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[
                    { label: "All Fixtures", value: "all" },
                    { label: "Group Stage", value: "group" },
                    { label: "Playoffs & Final", value: "playoffs" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => setFilter(btn.value)}
                      className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        filter === btn.value
                          ? "bg-amber-500 text-[#0A0F1D] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredMatches.map((match) => (
                  <div
                    key={match._id || match.id}
                    className="group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#111827]/80 p-4 sm:p-6 transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1 shadow-xl backdrop-blur-xl"
                  >
                    {/* Header: Match # & Stage */}
                    <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/10">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black text-amber-400">
                          {match.matchNumber}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-400">{match.stage}</span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 sm:px-3 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-400">
                        <FaCircleDot className="text-[8px] animate-pulse" />
                        {match.status || "Upcoming"}
                      </span>
                    </div>

                    {/* Team Versus Layout (Larger section with circular icons) */}
                    <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center my-4 sm:my-5">
                      {/* Team 1 */}
                      <div className="col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3.5">
                          <div
                            className={`size-14 sm:size-16 md:size-20 rounded-full bg-gradient-to-br ${
                              match.team1?.color || "from-blue-600 to-indigo-900"
                            } border-2 border-white/30 ring-2 ring-blue-500/30 flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-300`}
                          >
                            {match.team1?.short || match.team1?.name?.slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <b className="block font-sans font-black text-sm sm:text-lg text-white leading-tight truncate">
                              {match.team1?.name}
                            </b>
                            {match.team1?.session && (
                              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 block">
                                {match.team1.session}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* VS Badge */}
                      <div className="col-span-2 flex flex-col items-center justify-center">
                        <span className="size-8 sm:size-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-black text-xs sm:text-sm text-amber-400 shadow-inner">
                          VS
                        </span>
                      </div>

                      {/* Team 2 */}
                      <div className="col-span-5 flex flex-col items-center sm:items-end text-center sm:text-right">
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3.5">
                          <div className="min-w-0">
                            <b className="block font-sans font-black text-sm sm:text-lg text-white leading-tight truncate">
                              {match.team2?.name}
                            </b>
                            {match.team2?.session && (
                              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 block">
                                {match.team2.session}
                              </span>
                            )}
                          </div>
                          <div
                            className={`size-14 sm:size-16 md:size-20 rounded-full bg-gradient-to-br ${
                              match.team2?.color || "from-amber-600 to-yellow-800"
                            } border-2 border-white/30 ring-2 ring-amber-500/30 flex items-center justify-center font-black text-sm sm:text-lg text-white shadow-xl shrink-0 group-hover:scale-105 transition-transform duration-300`}
                          >
                            {match.team2?.short || match.team2?.name?.slice(0, 3)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Match Details Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-400">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <FaCalendarDays className="text-amber-400 text-xs" />
                          {match.date}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <FaClock className="text-amber-400 text-xs" />
                          {match.time}
                        </span>
                      </div>

                      <span className="flex items-center gap-1.5 text-slate-400">
                        <FaLocationDot className="text-xs text-slate-500" />
                        {match.venue || "Central Stadium, PSTU"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
