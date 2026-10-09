"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowRight, FaGavel } from "react-icons/fa6";
import TeamCrest from "./team-crest";

export default function TournamentTeamsSection() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cached tournament teams to prevent any flash of unloaded state on refresh
    try {
      const cached = sessionStorage.getItem("epl_teams_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeams(parsed);
          setLoading(false);
        }
      }
    } catch (_) {}

    fetch("/api/auction/state", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.teams) && data.teams.length > 0) {
          setTeams(data.teams);
          try {
            sessionStorage.setItem("epl_teams_cache", JSON.stringify(data.teams));
          } catch (_) {}
        }
      })
      .catch((err) => console.error("Error loading tournament teams:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && teams.length === 0) return null;

  return (
    <section id="teams" className="py-16 sm:py-24 border-b border-white/10 bg-[#070D1E] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 size-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 size-[450px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

      <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 mb-3.5 backdrop-blur-md">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400">
              OFFICIAL FRANCHISES • 2027 EDITION
            </span>
          </div>
          <h2 className="font-sans font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            PARTICIPATING <span className="text-amber-400">TEAMS</span>
          </h2>
          <p className="mt-3 text-xs sm:text-base text-slate-400 font-normal leading-relaxed">
            Elite squads battling for glory at Patuakhali Science and Technology University. 
            View team emblems, squad rosters, and live purse points.
          </p>
        </div>

        {/* Teams Grid - Shimmer Skeleton during first load, or Real Franchises */}
        {loading && teams.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-7">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#111A30]/50 p-6 sm:p-7 min-h-[290px] flex flex-col items-center justify-between animate-pulse"
              >
                <div className="my-3 size-24 sm:size-28 rounded-full bg-white/5 border border-white/10" />
                <div className="w-full space-y-2">
                  <div className="h-5 w-3/4 mx-auto rounded-lg bg-white/10" />
                  <div className="h-4 w-1/2 mx-auto rounded-full bg-white/5" />
                </div>
                <div className="mt-4 w-full pt-3.5 border-t border-white/5 flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-white/10" />
                  <div className="h-6 w-16 rounded-xl bg-amber-500/20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-7">
          {teams.map((team, idx) => (
            <div
              key={team._id || idx}
              className="group relative rounded-3xl border-2 border-white/10 bg-gradient-to-b from-[#111A30]/90 via-[#0C1425]/90 to-[#070D1E]/95 p-6 sm:p-7 text-center backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-amber-500/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col items-center justify-between min-h-[290px]"
            >
              {/* Top ambient card glow on hover */}
              <div className="absolute -top-12 -right-12 size-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

              {/* Team Circular Emblem Section (Larger in circle with floating motion) */}
              <div className="my-3 flex flex-col items-center">
                <div className="group-hover:scale-110 transition-transform duration-500 animate-crest-float">
                  <TeamCrest
                    name={team.name}
                    logoUrl={team.logoUrl}
                    className="size-24 sm:size-28 md:size-32"
                  />
                </div>
              </div>

              {/* Team Name Section (Larger bold typography) */}
              <div className="w-full my-2">
                <h3 className="font-sans font-black text-base sm:text-lg md:text-xl text-white uppercase tracking-tight leading-snug drop-shadow">
                  {team.name}
                </h3>
                <span className="inline-block mt-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {team.playerCount ? `${team.playerCount} Players` : "Franchise Squad"}
                </span>
              </div>

              {/* Card Footer: Purse Balance & Live Link */}
              <div className="mt-4 w-full pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="text-left">
                  <span className="block text-[9px] font-bold uppercase text-slate-400">Purse Budget</span>
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {team.pointsRemaining?.toLocaleString()} PTS
                  </span>
                </div>

                <Link
                  href="/auction"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-md transition-all"
                >
                  <span>Auction</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

            </div>
          ))}
        </div>
        )}

        {/* Bottom CTA to Auction Arena */}
        <div className="mt-12 text-center">
          <Link
            href="/auction"
            className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-7 py-3 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:scale-105 transition-all"
          >
            <FaGavel className="text-sm" />
            <span>Enter Live Auction Arena</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

      </div>
    </section>
  );
}
