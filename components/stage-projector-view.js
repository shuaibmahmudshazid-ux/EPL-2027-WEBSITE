"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCoins,
  FaCompress,
  FaExpand,
  FaGavel,
  FaShieldHalved,
  FaStopwatch,
  FaTrophy,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";
import PlayerStageRevealCard, { formatBasePrice, formatBroadcastRole } from "./player-stage-reveal-card";
import AuctionRoundStamp from "./auction-round-stamp";
import TeamCrest from "./team-crest";

const safeParse = async (response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

// Web Audio sound synthesizer for broadcast alerts
const playBroadcastSound = (type, isMuted) => {
  if (isMuted || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "reveal") {
      // Cinematic player reveal fanfare
      const notes = [392.0, 523.25, 659.25, 783.99]; // G4 -> C5 -> E5 -> G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } else if (type === "bid") {
      // High-energy bid ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "hammer") {
      // Gavel strike percussion
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "sold") {
      // Celebratory fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.5);
      });
    }
  } catch {
    // browser auto-play audio policy handling
  }
};

export default function StageProjectorView() {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const prevPlayerRef = useRef(null);
  const prevHammerRef = useRef(null);
  const prevBidRef = useRef(0);
  const canvasRef = useRef(null);
  const pollRef = useRef(null);

  // Fullscreen trigger
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Keyboard shortcut: Press F to toggle Fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "f" || e.key === "F") && !["INPUT", "TEXTAREA"].includes(e.target?.tagName)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Confetti burst for SOLD moments
  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#d4a84f", "#ffd700", "#c53030", "#3b82f6", "#10b981", "#ffffff"];
    const particles = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2,
      y: canvas.height * 0.45,
      r: Math.random() * 6 + 3,
      dx: (Math.random() - 0.5) * 16,
      dy: (Math.random() - 0.8) * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10,
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

  // Fetch auction state
  const fetchAuctionState = useCallback(async () => {
    try {
      const res = await fetch("/api/auction/state", { cache: "no-store" });
      const data = await safeParse(res);
      if (res.ok && data) {
        setAuctionData(data);

        const state = data.state || {};
        const currentPlayerId = state.players?.[state.currentPlayerIndex]?.player;

        // Check if new player revealed
        if (currentPlayerId && currentPlayerId !== prevPlayerRef.current) {
          prevPlayerRef.current = currentPlayerId;
          playBroadcastSound("reveal", isMuted);
        }

        // Check bids
        if (state.currentBid > prevBidRef.current) {
          playBroadcastSound("bid", isMuted);
        }
        prevBidRef.current = state.currentBid || 0;

        // Check hammer status
        if (state.hammerStatus && state.hammerStatus !== prevHammerRef.current) {
          if (["going_once", "going_twice"].includes(state.hammerStatus)) {
            playBroadcastSound("hammer", isMuted);
          } else if (state.hammerStatus === "sold") {
            playBroadcastSound("sold", isMuted);
            triggerConfetti();
          }
          prevHammerRef.current = state.hammerStatus;
        }
      }
    } catch {
      // silent polling error
    } finally {
      setLoading(false);
    }
  }, [isMuted, triggerConfetti]);

  useEffect(() => {
    const timer = window.setTimeout(fetchAuctionState, 0);
    pollRef.current = setInterval(fetchAuctionState, 1200);
    return () => {
      window.clearTimeout(timer);
      clearInterval(pollRef.current);
    };
  }, [fetchAuctionState]);

  const state = auctionData?.state || {};
  const currentQueue = state.players || [];
  const currentPlayer = currentQueue[state.currentPlayerIndex];
  const isFifthPlayer = state.currentPlayerIndex === 4;

  const currentBasePrice =
    isFifthPlayer && state.fifthPlayerCalculatedBasePrice
      ? state.fifthPlayerCalculatedBasePrice
      : currentPlayer?.basePrice || state.tierBasePrice || 500;

  const isBiddingOpen =
    state.status === "in_progress" &&
    ["bidding_open", "going_once", "going_twice"].includes(state.hammerStatus);

  const isStageRevealMode =
    (state.status === "in_progress" || state.status === "paused") &&
    state.hammerStatus === "waiting";

  return (
    <div className="relative min-h-screen bg-[#010912] text-white selection:bg-[#d4a84f] selection:text-black overflow-hidden flex flex-col justify-between">
      {/* CONFETTI CANVAS */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 size-full"
      />

      {/* TOP FLOATING OVERLAY CONTROLS (AUTO-HIDE/SUBTLE FOR BROADCAST) */}
      <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <Link
          href="/auction"
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white backdrop-blur-md transition-colors"
        >
          <FaArrowLeft className="text-[10px]" />
          <span>Exit to Arena</span>
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="grid size-8 place-items-center rounded-full border border-white/20 bg-black/60 text-[#d4a84f] hover:bg-white/10 backdrop-blur-md cursor-pointer transition-colors"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <FaVolumeXmark className="text-xs" /> : <FaVolumeHigh className="text-xs" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold text-white hover:bg-white/10 hover:border-amber-400/50 backdrop-blur-md cursor-pointer transition-colors shadow-sm"
            title={isFullscreen ? "Exit Fullscreen (Press F or Esc)" : "Enter Projector Fullscreen (Press F)"}
          >
            {isFullscreen ? <FaCompress className="text-xs text-[#d4a84f]" /> : <FaExpand className="text-xs text-[#d4a84f]" />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN SCREEN PRESENTATION                                  */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col justify-center p-3 sm:p-6 lg:p-8 max-w-[1700px] mx-auto w-full">
        {loading ? (
          <div className="grid min-h-[70vh] place-items-center text-center">
            <div className="space-y-3">
              <div className="size-10 border-4 border-[#d4a84f] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-mono text-xs tracking-widest text-[#d4a84f] uppercase">
                INITIALIZING AUDITORIUM STAGE SCREEN...
              </p>
            </div>
          </div>
        ) : !currentPlayer || state.status === "idle" || state.status === "completed" ? (
          /* IDLE / COMPLETED TOURNAMENT STAGE */
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#d4a84f]/40 bg-gradient-to-b from-[#031d33] via-[#021321] to-[#010912] p-12 text-center shadow-2xl space-y-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,79,0.12),transparent_70%)]" />
            <FaGavel className="mx-auto text-6xl sm:text-7xl text-[#d4a84f] animate-bounce" />
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white">
              EPL 2027 MEGA AUCTION
            </h1>
            <p className="text-sm sm:text-lg max-w-xl mx-auto text-slate-300">
              {state.status === "completed"
                ? "This auction round has concluded. Next tier set starting soon!"
                : "Auditorium stage display is online and synchronized with the auctioneer console."}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 py-2 font-mono text-xs tracking-widest text-amber-300 uppercase">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
              WAITING FOR NEXT PLAYER ON THE BLOCK
            </div>
          </div>
        ) : isStageRevealMode ? (
          /* ======================================================== */
          /* 1. EXACT REPLICA OF REFERENCE PHOTO: BEFORE BIDDING      */
          /* ======================================================== */
          <PlayerStageRevealCard
            player={currentPlayer}
            basePrice={currentBasePrice}
            tierName={state.tierName}
            categoryName={state.category}
            playerIndex={state.currentPlayerIndex}
            totalPlayers={currentQueue.length}
            isFifthPlayer={isFifthPlayer}
            isProjectorMode={true}
            isBiddingOpen={false}
          />
        ) : (
          /* ======================================================== */
          /* 2. LIVE BIDDING & HAMMER STAGE (WHEN BIDDING IS OPEN/SOLD) */
          /* ======================================================== */
          <div className="relative overflow-hidden rounded-3xl border-2 border-[#d4a84f]/60 bg-gradient-to-b from-[#02182c] via-[#011120] to-[#010912] p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.85)] flex flex-col justify-between min-h-[82vh]">
            {/* Stage Truss Glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#d4a84f] to-transparent opacity-80" />

            {/* Top Broadcast Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-red-600 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-white shadow animate-pulse">
                  ON AIR
                </span>
                <span className="text-xs font-black tracking-widest text-[#d4a84f] uppercase">
                  EPL 2027 • LIVE STAGE
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-slate-300 font-bold hidden sm:inline">
                  {state.category} — {state.tierName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                  PLAYER {state.currentPlayerIndex + 1} OF {currentQueue.length}
                </span>
              </div>
            </div>

            {/* UNIFIED 3-ZONE STAGE: BASE PRICE (LEFT) | BIG IMAGE (CENTRE) | BID AMOUNT (RIGHT) */}
            <div className="my-auto grid items-stretch gap-6 lg:grid-cols-12 py-4">
              {/* 1. LEFT: BASE PRICE & TOURNAMENT RULES */}
              <div className="lg:col-span-3 flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#02182c] to-[#010e1a] p-6 text-center shadow-2xl backdrop-blur-md">
                <div>
                  <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#d4a84f]">
                    <FaCoins className="text-sm" />
                    BASE STARTING PRICE
                  </div>
                  <p className="mt-3 font-mono text-4xl sm:text-5xl lg:text-6xl font-black text-[#d4a84f] tracking-tight drop-shadow-[0_0_20px_rgba(212,168,79,0.35)]">
                    ৳ {currentBasePrice.toLocaleString()}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-400">Opening Bid Floor</p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 space-y-3 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <b className="text-white text-sm">{state.category}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tier:</span>
                    <b className="text-white text-sm">{state.tierName}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rule Raise:</span>
                    <b className="text-emerald-400 font-bold">
                      {(state.currentBid || 0) < 10000 ? "+৳ 500" : "+৳ 2,000"}
                    </b>
                  </div>
                  {isFifthPlayer && (
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-300 font-bold text-[11px] border border-amber-400/30">
                      5th Player Average Rule Active
                    </div>
                  )}
                </div>
              </div>

              {/* 2. CENTRE: BIGGER PLAYER IMAGE & IDENTITY */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center text-center p-2">
                <div className="relative group">
                  {/* Circular stadium halo glow */}
                  <div className="absolute inset-0 m-auto size-56 sm:size-72 md:size-84 rounded-full bg-gradient-to-tr from-[#d4a84f]/30 via-blue-600/30 to-cyan-400/25 blur-3xl animate-pulse" />
                  <div className="absolute inset-0 m-auto size-52 sm:size-64 md:size-76 rounded-full border-2 border-[#d4a84f]/40 opacity-70" />

                  {currentPlayer.photoUrl ? (
                    <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-[#d4a84f] bg-[#02101b] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
                      <img
                        src={currentPlayer.photoUrl}
                        alt={currentPlayer.fullName}
                        className="size-52 sm:size-64 md:size-76 object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      
                      {/* Round Stamp Overlay for SOLD / UNSOLD */}
                      {["sold", "unsold"].includes((state.hammerStatus || "").toLowerCase()) && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
                          <AuctionRoundStamp
                            status={state.hammerStatus}
                            size="lg"
                            price={state.hammerStatus === "sold" ? state.currentBid : null}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative z-10 flex size-52 sm:size-64 md:size-76 flex-col items-center justify-center rounded-3xl border-4 border-[#d4a84f] bg-gradient-to-b from-[#031d33] via-[#021321] to-[#010912] text-[#d4a84f] shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
                      <span className="text-5xl sm:text-7xl font-black">
                        {currentPlayer.fullName.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="mt-1 text-xs font-bold tracking-widest text-slate-300 uppercase">
                        EPL ATHLETE
                      </span>

                      {/* Round Stamp Overlay for SOLD / UNSOLD */}
                      {["sold", "unsold"].includes((state.hammerStatus || "").toLowerCase()) && (
                        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
                          <AuctionRoundStamp
                            status={state.hammerStatus}
                            size="lg"
                            price={state.hammerStatus === "sold" ? state.currentBid : null}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`absolute -bottom-3 inset-x-0 mx-auto w-fit z-20 rounded-full px-4 py-1 text-xs font-black uppercase shadow-xl transition-all ${
                      state.hammerStatus === "sold"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400 text-black border border-emerald-300"
                        : state.hammerStatus === "unsold"
                        ? "bg-gradient-to-r from-red-600 to-rose-500 text-white border border-red-400"
                        : "bg-gradient-to-r from-[#d4a84f] to-[#b8872f] text-black"
                    }`}
                  >
                    {state.hammerStatus === "sold"
                      ? `🏆 SOLD TO ${state.currentBidderTeamName || "WINNING SQUAD"}`
                      : state.hammerStatus === "unsold"
                      ? "✕ UNSOLD / PASSED"
                      : "ON THE BLOCK"}
                  </span>
                </div>

                {/* NAME, ROLE & DETAILS */}
                <div className="mt-5">
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)] leading-tight">
                    {currentPlayer.fullName}
                  </h2>

                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="rounded-lg border border-cyan-400/40 bg-cyan-950/40 px-3 py-1 font-mono text-sm sm:text-base font-black uppercase tracking-wider text-cyan-300 shadow">
                      {formatBroadcastRole(currentPlayer.role, currentPlayer.categories)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-300">
                    <span>
                      Student ID: <b className="text-white font-mono">{currentPlayer.playerId}</b>
                    </span>
                    <span>•</span>
                    <span>
                      Session: <b className="text-white">{currentPlayer.session}</b>
                    </span>
                    {currentPlayer.registrationNumber && (
                      <>
                        <span>•</span>
                        <span>
                          Reg No: <b className="text-white font-mono">{currentPlayer.registrationNumber}</b>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. RIGHT: CURRENT HIGHEST BID / SOLD RESULT */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                {state.hammerStatus === "sold" ? (
                  /* SOLD CELEBRATION CARD */
                  <div className="rounded-3xl border-4 border-emerald-400 bg-gradient-to-b from-emerald-950/90 via-[#011409] to-black p-6 text-center shadow-[0_0_60px_rgba(16,185,129,0.5)]">
                    <span className="inline-block rounded-full bg-emerald-500 px-5 py-1 text-sm font-black uppercase tracking-widest text-black shadow-lg mb-3">
                      🏆 SOLD!
                    </span>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-300">
                      WINNING TEAM
                    </p>
                    {state.currentBidderTeamName && (
                      <div className="my-3 flex justify-center">
                        <TeamCrest
                          name={state.currentBidderTeamName}
                          logoUrl={state.currentBidderTeamLogo}
                          className="size-20 sm:size-24 md:size-28"
                        />
                      </div>
                    )}
                    <h3 className="mt-1 text-2xl sm:text-4xl font-black text-white uppercase drop-shadow">
                      {state.currentBidderTeamName || "WINNING SQUAD"}
                    </h3>
                    <div className="mt-3 inline-block rounded-2xl border border-emerald-400/40 bg-black/60 px-5 py-2">
                      <p className="text-[10px] font-bold text-slate-300 uppercase">FINAL PRICE</p>
                      <p className="font-mono text-3xl sm:text-4xl font-black text-[#d4a84f]">
                        ৳ {state.currentBid?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : state.hammerStatus === "unsold" ? (
                  /* UNSOLD CARD */
                  <div className="rounded-3xl border-2 border-red-500 bg-red-950/60 p-6 text-center shadow-2xl">
                    <h3 className="text-2xl sm:text-4xl font-black text-red-400 uppercase">
                      PLAYER UNSOLD
                    </h3>
                    <p className="mt-2 text-xs text-slate-300">
                      Passed to re-auction pool.
                    </p>
                  </div>
                ) : (
                  /* LIVE BID DISPLAY */
                  <div className="rounded-3xl border-2 border-white/20 bg-gradient-to-b from-[#02182c] to-[#010c17] p-6 text-center shadow-2xl space-y-4">
                    <div>
                      <p className="text-xs font-black tracking-widest text-[#d4a84f] uppercase">
                        CURRENT HIGHEST BID
                      </p>
                      <p className="mt-1 font-mono text-4xl sm:text-5xl lg:text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(212,168,79,0.5)]">
                        ৳ {state.currentBid ? state.currentBid.toLocaleString() : "0"}
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        LEADING BIDDER
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2.5">
                        {state.currentBidderTeamName && (
                          <TeamCrest
                            name={state.currentBidderTeamName}
                            logoUrl={state.currentBidderTeamLogo}
                            className="size-8 sm:size-10"
                          />
                        )}
                        <span className="text-xl sm:text-2xl font-black text-[#d4a84f] truncate">
                          {state.currentBidderTeamName || "Waiting for Opening Bid..."}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-center gap-2">
                        <span
                          className={`inline-block rounded-2xl border px-3.5 py-1 text-xs uppercase font-black tracking-wider ${
                            state.hammerStatus === "bidding_open"
                              ? "bg-emerald-950/90 text-emerald-400 border-emerald-500 animate-pulse"
                              : state.hammerStatus === "going_once"
                              ? "bg-amber-950/90 text-amber-300 border-amber-400 animate-pulse text-sm"
                              : state.hammerStatus === "going_twice"
                              ? "bg-red-950/90 text-red-300 border-red-500 animate-pulse text-sm"
                              : "bg-white/10 text-white border-white/20"
                          }`}
                        >
                          <FaGavel className="inline mr-1.5" />
                          {state.hammerStatus?.replace("_", " ")}
                        </span>
                      </div>

                      <p className="mt-2 text-xs font-mono text-slate-300 flex items-center justify-center gap-1.5">
                        <FaStopwatch />
                        Timer: <b className="text-white">{state.timerSeconds || 15}s</b>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BOTTOM TICKER */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-[#d4a84f]">EPL 2027 OFFICIAL STAGE BROADCAST</span>
              <span className="font-mono">PROJECTOR MODE • 16:9</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Fullscreen Quick Button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-[#d4a84f]/40 bg-black/85 px-3 py-1.5 text-xs font-bold uppercase text-[#d4a84f] hover:bg-black hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen (Press F or Esc)" : "Enter Projector Fullscreen (Press F)"}
      >
        {isFullscreen ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
        <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
      </button>
    </div>
  );
}
