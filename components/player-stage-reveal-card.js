"use client";

import { useMemo } from "react";
import {
  FaCoins,
  FaGavel,
  FaIdCard,
  FaPlay,
  FaShieldHalved,
  FaStopwatch,
  FaTrophy,
  FaUserGraduate,
} from "react-icons/fa6";
import AuctionRoundStamp from "./auction-round-stamp";

/**
 * Formats cricket role into clean broadcast abbreviation/title,
 * e.g. "Wicket Keeper (Batsman)" -> "WK - BATTER" (as in Rishabh Pant IPL screen)
 */
export const formatBroadcastRole = (roleStr, categories = []) => {
  const raw = (roleStr || (categories && categories[0]) || "").trim().toLowerCase();
  if (!raw) return "CRICKETER";

  if (raw.includes("wicket keeper") || raw.includes("wicket-keeper") || raw.includes("wk")) {
    return "WK - BATTER";
  }
  if (raw.includes("batting all") || raw.includes("batting all-rounder")) {
    return "ALL-ROUNDER (BAT)";
  }
  if (raw.includes("bowling all") || raw.includes("bowling all-rounder")) {
    return "ALL-ROUNDER (BOWL)";
  }
  if (raw.includes("all-rounder") || raw.includes("all rounder")) {
    return "ALL-ROUNDER";
  }
  if (raw.includes("batsman") || raw.includes("batter")) {
    return "BATTER";
  }
  if (raw.includes("bowler") || raw.includes("pace") || raw.includes("spin")) {
    return "BOWLER";
  }
  return raw.toUpperCase();
};

/**
 * Formats currency / base price in clean high-impact broadcast style
 */
export const formatBasePrice = (amount) => {
  const num = Number(amount) || 0;
  // If in crores / lakhs or standard BDT
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(1).replace(/\.0$/, "");
    return `৳ ${cr} CR`;
  }
  if (num >= 100000) {
    const lk = (num / 100000).toFixed(1).replace(/\.0$/, "");
    return `৳ ${lk} LAKH`;
  }
  return `৳ ${num.toLocaleString()}`;
};

export default function PlayerStageRevealCard({
  player,
  basePrice = 0,
  tierName = "",
  categoryName = "",
  playerIndex = 0,
  totalPlayers = 5,
  isFifthPlayer = false,
  isProjectorMode = false,
  isAdmin = false,
  isBiddingOpen = false,
  onOpenBidding = null,
  isSubmitting = false,
}) {
  const formattedRole = useMemo(() => {
    return formatBroadcastRole(player?.role, player?.categories || (player?.category ? [player.category] : []));
  }, [player]);

  const displayBasePrice = useMemo(() => {
    return formatBasePrice(basePrice || player?.basePrice || 500);
  }, [basePrice, player]);

  if (!player) {
    return (
      <div className="flex min-h-[450px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#021222] p-8 text-center text-slate-400">
        <p className="text-sm font-semibold">No player currently on the reveal stage.</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#d4a84f]/60 bg-gradient-to-b from-[#02182c] via-[#011120] to-[#010912] text-white shadow-[0_20px_70px_rgba(0,0,0,0.85)] select-none transition-all ${
        isProjectorMode
          ? "min-h-[82vh] min-h-[82dvh] p-4 sm:p-10 flex flex-col justify-between"
          : "p-4 sm:p-8"
      }`}
    >
      {/* ======================================================== */}
      {/* 1. STADIUM LIGHTING & REALISTIC AUDITORIUM BEAMS        */}
      {/* ======================================================== */}
      {/* Top stage truss bar glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d4a84f] to-transparent opacity-80" />
      
      {/* Overhead stage spotlights casting down */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-64 -rotate-12 bg-gradient-to-b from-cyan-400/25 via-blue-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-64 rotate-12 bg-gradient-to-b from-amber-300/25 via-yellow-500/10 to-transparent blur-3xl" />
      
      {/* Stadium LED video wall dot-matrix & scanline texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "16px 16px, 32px 32px",
        }}
      />

      {/* ======================================================== */}
      {/* 2. REFINED SPORTS BROADCAST ACCENTS                      */}
      {/* ======================================================== */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 opacity-80">
        <div className="h-6 sm:h-10 w-1.5 rounded-full bg-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
        <div className="h-4 sm:h-7 w-1 rounded-full bg-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
      </div>

      <div className="pointer-events-none absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 opacity-80">
        <div className="h-4 sm:h-7 w-1 rounded-full bg-sky-400/80 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
        <div className="h-6 sm:h-10 w-1.5 rounded-full bg-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
      </div>

      {/* ======================================================== */}
      {/* 3. BROADCAST TOP HEADER                                  */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col items-center justify-center pb-4 text-center">
        {/* Network / League Branding Bar */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-1 backdrop-blur-md shadow-lg">
          <span className="size-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[11px] sm:text-xs font-black tracking-widest text-[#d4a84f] uppercase">
            EPL.INFO
          </span>
          <span className="text-white/40">•</span>
          <span className="text-[10px] sm:text-xs font-extrabold tracking-wider text-slate-200 uppercase">
            EPL 2027 MEGA AUCTION
          </span>
        </div>

        {/* Tournament set indicator */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
          {categoryName && (
            <span className="rounded-md bg-gradient-to-r from-red-600 to-red-800 px-2.5 py-0.5 font-black uppercase tracking-wider text-white shadow">
              {categoryName}
            </span>
          )}
          {tierName && (
            <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-0.5 font-bold text-slate-200">
              {tierName}
            </span>
          )}
          <span className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 font-mono font-bold text-amber-300">
            PLAYER {playerIndex + 1} OF {totalPlayers}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN HERO STAGE: PLAYER PORTRAIT & TYPOGRAPHIC POWER  */}
      {/* ======================================================== */}
      <div className="relative z-10 my-auto grid items-center gap-6 sm:gap-10 lg:grid-cols-12 py-3 sm:py-6">
        {/* LEFT / CENTER: HERO ATHLETIC CUTOUT / PORTRAIT (COLS 5) */}
        <div className="flex flex-col items-center justify-center lg:col-span-5">
          <div className="relative">
            {/* Circular rim light glow behind player */}
            <div className="absolute inset-0 m-auto size-52 sm:size-72 md:size-84 rounded-full bg-gradient-to-tr from-[#d4a84f]/30 via-blue-600/30 to-cyan-400/25 blur-2xl animate-pulse" />
            <div className="absolute inset-0 m-auto size-48 sm:size-64 md:size-72 rounded-full border-2 border-[#d4a84f]/40 opacity-70" />

            {/* Player photo or stylized jersey monogram */}
            <div className="relative z-10 flex flex-col items-center">
              {player.photoUrl ? (
                <div className="relative overflow-hidden rounded-3xl border-4 border-[#d4a84f] bg-[#02101b] p-1 shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
                  <img
                    src={player.photoUrl}
                    alt={player.fullName}
                    className="size-48 sm:size-64 md:size-72 object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Round Stamp Overlay for SOLD / UNSOLD */}
                  {["sold", "unsold"].includes((player.auctionStatus || player.status || "").toLowerCase()) && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 pointer-events-none">
                      <AuctionRoundStamp
                        status={player.auctionStatus || player.status}
                        size="md"
                        price={player.soldPrice}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative flex size-48 sm:size-64 md:size-72 flex-col items-center justify-center rounded-3xl border-4 border-[#d4a84f] bg-gradient-to-b from-[#031d33] via-[#021321] to-[#010912] text-[#d4a84f] shadow-[0_15px_45px_rgba(0,0,0,0.9)]">
                  <FaShieldHalved className="text-5xl sm:text-7xl mb-2 opacity-80" />
                  <span className="text-3xl sm:text-5xl font-black tracking-wider">
                    {player.fullName ? player.fullName.slice(0, 2).toUpperCase() : "PL"}
                  </span>
                  <span className="mt-1 text-[10px] sm:text-xs font-bold tracking-widest text-slate-300 uppercase">
                    EPL ATHLETE
                  </span>

                  {/* Round Stamp Overlay for SOLD / UNSOLD */}
                  {["sold", "unsold"].includes((player.auctionStatus || player.status || "").toLowerCase()) && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 pointer-events-none">
                      <AuctionRoundStamp
                        status={player.auctionStatus || player.status}
                        size="md"
                        price={player.soldPrice}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Spotlight Badge */}
              <div className="relative -mt-4 z-20 rounded-full border-2 border-black bg-gradient-to-r from-[#d4a84f] to-[#b8872f] px-4 py-1 text-xs font-black uppercase tracking-wider text-black shadow-xl">
                ★ ON THE BLOCK ★
              </div>
            </div>
          </div>

          {/* Student Badges Bar below photo */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-300">
            {player.playerId && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1">
                <FaIdCard className="text-[#d4a84f]" />
                ID: <b className="font-mono text-white">{player.playerId}</b>
              </span>
            )}
            {player.session && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1">
                <FaUserGraduate className="text-cyan-400" />
                <b className="text-white">{player.session}</b>
              </span>
            )}
            {player.registrationNumber && (
              <span className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 text-slate-300">
                Reg: <b className="font-mono text-white">{player.registrationNumber}</b>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: MASSIVE NAME, ROLE & BASE PRICE (COLS 7) */}
        <div className="flex flex-col justify-center text-center lg:text-left lg:col-span-7 space-y-4 sm:space-y-6">
          {/* 5th Player Special rule callout if applicable */}
          {isFifthPlayer && (
            <div className="mx-auto lg:mx-0 w-fit rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-950/90 to-amber-900/60 px-3.5 py-1.5 shadow-lg animate-pulse">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-amber-300">
                <FaCoins className="text-amber-400" />
                5th Player Special Rule: Starting Base = Average of Player 3 &amp; 4
              </span>
            </div>
          )}

          {/* 1. PLAYER NAME (Massive Athletic Typography) */}
          <div>
            <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)] leading-tight break-words">
              {player.fullName}
            </h1>

            {/* 2. PLAYING ROLE / POSITION (Matches "WK - BATTER" in reference photo) */}
            <div className="mt-2.5 sm:mt-4 flex items-center justify-center lg:justify-start gap-2">
              <span className="rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-2.5 sm:px-3 py-1 font-mono text-xs sm:text-base font-extrabold tracking-widest text-cyan-300 uppercase shadow">
                {formattedRole}
              </span>
              {player.tier && (
                <span className="rounded-lg border border-white/15 bg-white/5 px-2.5 sm:px-3 py-1 text-[11px] sm:text-sm font-bold text-slate-300 uppercase">
                  {player.tier}
                </span>
              )}
            </div>
          </div>

          {/* 3. BASE PRICE SECTION (Exact match to reference photo layout) */}
          <div className="pt-1.5 sm:pt-4">
            <p className="text-[10px] sm:text-sm md:text-base font-extrabold tracking-[0.25em] text-[#d4a84f] uppercase drop-shadow">
              BASE PRICE
            </p>

            <div className="mt-0.5 sm:mt-2 flex items-baseline justify-center lg:justify-start gap-2">
              <span className="font-black text-white text-4xl xs:text-5xl sm:text-7xl md:text-8xl tracking-tight drop-shadow-[0_0_35px_rgba(212,168,79,0.5)] font-mono">
                {displayBasePrice}
              </span>
            </div>
          </div>

          {/* 4. BROADCAST STATUS BANNER */}
          <div className="pt-2">
            {!isBiddingOpen ? (
              <div className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-amber-400/70 bg-gradient-to-r from-amber-950/80 via-black/80 to-amber-950/80 px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 shadow-2xl animate-pulse">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-amber-400" />
                </span>
                <span>BIDDING OPENS SHORTLY • AWAITING AUCTIONEER</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-emerald-400/80 bg-gradient-to-r from-emerald-950/80 via-black/80 to-emerald-950/80 px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-emerald-300 shadow-2xl animate-pulse">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
                </span>
                <span>BIDDING IS NOW OPEN!</span>
              </div>
            )}
          </div>

          {/* 5. ADMIN QUICK ACTION (If rendered on Admin Console) */}
          {isAdmin && !isBiddingOpen && onOpenBidding && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onOpenBidding}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-black uppercase text-white shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <FaPlay />
                Open Bidding Now For This Player
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. BOTTOM BROADCAST FOOTER / STAGE METRICS               */}
      {/* ======================================================== */}
      <div className="relative z-10 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] sm:text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <FaGavel className="text-[#d4a84f]" />
          <span>Official EPL 2027 Auction System</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Set Rule: <b>5-Player Tier Queue</b>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Status: <b className="text-white">{isBiddingOpen ? "Live Bidding" : "Spotlight Presentation"}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
