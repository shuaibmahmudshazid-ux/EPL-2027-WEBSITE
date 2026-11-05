"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  FaGavel,
  FaCrown,
  FaStar,
  FaXmark,
  FaCheck,
  FaTrophy,
} from "react-icons/fa6";
import TeamCrest from "./team-crest";
import AuctionRoundStamp from "./auction-round-stamp";
import { formatBroadcastRole } from "./player-stage-reveal-card";

/**
 * Rubber-stamp style badge displayed when player is the highest bid till now.
 */
function HighestBidStamp({ price, className = "" }) {
  return (
    <div
      aria-label="Highest Bid of the Auction"
      className={`pointer-events-none select-none z-30 flex flex-col items-center justify-center rounded-2xl border-4 border-amber-400 bg-black/85 p-3 sm:p-4 text-center text-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.9),inset_0_0_20px_rgba(245,158,11,0.5)] backdrop-blur-md rotate-[-12deg] animate-stamp ${className}`}
    >
      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-amber-300 tracking-widest uppercase">
        <FaCrown className="text-amber-400 text-xs sm:text-sm animate-bounce" />
        <span>RECORD BREAKER</span>
        <FaStar className="text-amber-400 text-[10px]" />
      </div>
      <span className="font-sans font-black text-lg sm:text-2xl md:text-3xl uppercase tracking-wider leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] my-1 sm:my-1.5">
        HIGHEST BID
      </span>
      {price && (
        <span className="font-mono font-black text-xs sm:text-sm md:text-base text-amber-300 tracking-tight">
          ৳ {Number(price).toLocaleString()} PTS
        </span>
      )}
      <div className="mt-1 border-t border-amber-400/40 pt-0.5 text-[7px] sm:text-[8px] font-mono tracking-widest uppercase text-slate-300">
        EPL 2027 TOURNAMENT RECORD
      </div>
    </div>
  );
}

export default function FullscreenSoldPlayerCard({
  player,
  winningTeam,
  soldPrice = 0,
  isHighestBid = false,
  onClose,
}) {
  const canvasRef = useRef(null);

  // Keyboard shortcut: Press ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Prevent background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Confetti burst on reveal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === "undefined") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#d4a84f", "#ffd700", "#10b981", "#38bdf8", "#ffffff", "#f59e0b"];
    const particles = Array.from({ length: 90 }, () => ({
      x: canvas.width * 0.5,
      y: canvas.height * 0.45,
      r: Math.random() * 6 + 3,
      dx: (Math.random() - 0.5) * 16,
      dy: (Math.random() - 0.75) * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    }));

    let frameId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.35; // gravity
        p.opacity -= 0.009;
        if (p.opacity > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fill();
        }
      });
      if (alive) {
        frameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!player) return null;

  const roleText = formatBroadcastRole(
    player.role || player.category,
    player.categories || [player.category].filter(Boolean)
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-[#010714]/95 backdrop-blur-2xl overflow-y-auto selection:bg-amber-400 selection:text-black animate-fade-in"
    >
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40 size-full"
      />

      {/* Atmospheric Stadium Night Lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 size-[600px] rounded-full bg-amber-500/15 blur-[160px]" />
        <div className="absolute -bottom-32 right-1/4 size-[600px] rounded-full bg-emerald-500/15 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
      </div>

      {/* Main Fullscreen Presentation Card */}
      <div className="relative z-50 w-full max-w-6xl rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-[#0c1626]/95 via-[#08101e]/95 to-[#040812]/98 shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Top Truss Glow Accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Top-Right Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 hover:border-amber-400/50 backdrop-blur-md cursor-pointer transition-all shadow-md"
          title="Close card (ESC)"
        >
          <FaXmark className="text-sm" />
          <span className="hidden sm:inline">Close</span>
          <span className="hidden sm:inline-block rounded bg-white/10 px-1 text-[9px] font-mono text-slate-300">
            ESC
          </span>
        </button>

        {/* ======================================================== */}
        {/* LEFT COLUMN: PLAYER IMAGE (COVERS EXACTLY 40% OF SCREEN) */}
        {/* ======================================================== */}
        <div className="w-full md:w-[40%] flex flex-col items-center justify-center p-5 sm:p-7 lg:p-8 bg-gradient-to-b from-[#0a1424] via-[#060c18] to-[#040810] border-b md:border-b-0 md:border-r border-white/10 relative">
          
          {/* Top Badge on Left Column */}
          <div className="w-full flex items-center justify-between mb-3 text-[10px] sm:text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              OFFICIAL HAMMER DROP
            </span>
            <span className="text-amber-300 font-bold uppercase">
              {player.tier || "TOURNAMENT DRAFT"}
            </span>
          </div>

          {/* Hero Portrait Container */}
          <div className="relative w-full aspect-[3/4] max-h-[500px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] bg-[#050914] flex items-center justify-center group">
            {player.photoUrl ? (
              <Image
                src={player.photoUrl}
                alt={player.fullName || "Sold Player"}
                fill
                priority
                unoptimized
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-[#111c33] to-[#060a14] text-amber-400 p-6">
                <div className="size-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-4xl font-black mb-3">
                  {player.fullName?.slice(0, 2).toUpperCase() || "PL"}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  OFFICIAL ATHLETE
                </span>
              </div>
            )}

            {/* HIGHEST BID STAMP OVERLAY (IF THIS PLAYER IS THE HIGHEST BID TILL THEN) */}
            {isHighestBid && (
              <div className="absolute top-6 inset-x-2 z-40 flex items-center justify-center">
                <HighestBidStamp price={soldPrice} />
              </div>
            )}

            {/* OFFICIAL "SOLD" ROUND STAMP */}
            <div
              className={`absolute z-30 flex items-center justify-center pointer-events-none ${
                isHighestBid ? "bottom-4 right-4" : "inset-0"
              }`}
            >
              <AuctionRoundStamp
                status="sold"
                size={isHighestBid ? "sm" : "responsive"}
                price={soldPrice}
              />
            </div>

            {/* Gradient shadow at bottom of image */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Category Bar below photo */}
          <div className="mt-3 w-full text-center">
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
              {roleText}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (60%): NAME, ASSIGNED TEAM, CATEGORY, PRICE */}
        {/* ======================================================== */}
        <div className="w-full md:w-[60%] flex flex-col justify-between p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
          
          {/* Top Category & Status Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-lg bg-amber-500/20 border border-amber-500/50 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                {roleText}
              </span>
              {player.tier && (
                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-mono font-bold text-slate-300 uppercase">
                  {player.tier}
                </span>
              )}
              {isHighestBid && (
                <span className="rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-black flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse">
                  <FaCrown className="text-xs" />
                  <span>HIGHEST BID OF THE AUCTION</span>
                </span>
              )}
            </div>

            {/* 1. PLAYER NAME (HEROIC TYPOGRAPHY) */}
            <h1 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-white leading-tight drop-shadow-lg">
              {player.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              EPL 2027 Official Player Draft • Successfully Hammered
            </p>
          </div>

          {/* 2. ASSIGNED TEAM (PURCHASED BY) */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-md">
            <span className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
              ASSIGNED FRANCHISE TEAM
            </span>
            <div className="flex items-center gap-4">
              <TeamCrest
                name={winningTeam?.name || "Winning Team"}
                logoUrl={winningTeam?.logoUrl}
                className="size-14 sm:size-18 shrink-0 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    OFFICIAL SQUAD ACQUISITION
                  </span>
                </div>
                <h3 className="font-sans font-black text-lg sm:text-2xl text-white uppercase truncate mt-0.5">
                  {winningTeam?.name || "WINNING FRANCHISE"}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Player is officially registered with the squad
                </p>
              </div>
            </div>
          </div>

          {/* 3. SOLD PRICE ON GRADIENT VIEW (EXPLICIT REQUIREMENT) */}
          <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black shadow-[0_12px_45px_rgba(245,158,11,0.55)] overflow-hidden">
            {/* Inner background glow accent */}
            <div className="absolute -top-10 -right-10 size-32 rounded-full bg-white/30 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-2 border-b border-black/15 pb-2 mb-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-black/80 font-mono">
                <FaGavel className="text-black text-xs" />
                FINAL WINNING SOLD PRICE
              </span>
              <span className="rounded-full bg-black/15 px-2.5 py-0.5 text-[10px] font-mono font-black text-black uppercase">
                HAMMER CONFIRMED
              </span>
            </div>

            <div className="relative z-10 flex flex-wrap items-baseline gap-2 mt-1">
              <span className="font-mono text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]">
                ৳ {Number(soldPrice || 0).toLocaleString()}
              </span>
              <span className="font-mono text-base sm:text-xl font-black text-black/80 tracking-wider">
                POINTS
              </span>
            </div>

            <p className="relative z-10 text-[10px] sm:text-xs text-black/75 font-semibold mt-2">
              Official purchase value recorded into team balance sheet
            </p>
          </div>

          {/* Bottom Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-amber-400 text-xs" />
              <span>EPL 2027 Live Auction Arena</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer hover:border-amber-400/50 border border-white/15"
            >
              <FaCheck className="text-emerald-400 text-xs" />
              <span>Return to Live Arena Floor</span>
            </button>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
}

