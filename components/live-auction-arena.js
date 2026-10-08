"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaGavel,
  FaKey,
  FaVolumeHigh,
  FaVolumeXmark,
  FaRightFromBracket,
  FaUserGroup,
  FaTowerBroadcast,
  FaClock,
  FaCompress,
  FaExpand,
} from "react-icons/fa6";
import SiteNavbar from "./site-navbar";
import TeamCrest from "./team-crest";
import AuctionRoundStamp from "./auction-round-stamp";

const pad = (val) => String(val).padStart(2, "0");

// Dynamic theme generator for real teams registered in the database
const getTeamTheme = (name = "", index = 0) => {
  const clean = name.toLowerCase();
  if (clean.includes("stormer") || clean.includes("blue")) {
    return {
      cardBg: "from-[#0d1e38]/90 via-[#0a162b]/85 to-[#070e1c]/90",
      borderClass: "border-blue-500/30 hover:border-blue-400/60",
      glowClass: "shadow-[0_0_20px_rgba(37,99,235,0.2)]",
    };
  }
  if (clean.includes("titan") || clean.includes("steel") || clean.includes("slate")) {
    return {
      cardBg: "from-[#1a2335]/90 via-[#121927]/85 to-[#0b101b]/90",
      borderClass: "border-slate-500/30 hover:border-slate-400/60",
      glowClass: "shadow-[0_0_20px_rgba(148,163,184,0.18)]",
    };
  }
  if (clean.includes("warrior") || clean.includes("gold") || clean.includes("amber")) {
    return {
      cardBg: "from-[#2f2210]/90 via-[#1f160a]/85 to-[#120d06]/90",
      borderClass: "border-amber-500/30 hover:border-amber-400/60",
      glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    };
  }
  if (clean.includes("gladiator") || clean.includes("maroon")) {
    return {
      cardBg: "from-[#381318]/90 via-[#240b0e]/85 to-[#130507]/90",
      borderClass: "border-red-500/30 hover:border-red-400/60",
      glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    };
  }
  if (clean.includes("crimson") || clean.includes("red")) {
    return {
      cardBg: "from-[#3d0f19]/90 via-[#270910]/85 to-[#150508]/90",
      borderClass: "border-rose-500/30 hover:border-rose-400/60",
      glowClass: "shadow-[0_0_20px_rgba(244,63,94,0.2)]",
    };
  }
  if (clean.includes("royal") || clean.includes("purple") || clean.includes("violet")) {
    return {
      cardBg: "from-[#271336]/90 via-[#1a0c24]/85 to-[#0f0715]/90",
      borderClass: "border-purple-500/30 hover:border-purple-400/60",
      glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    };
  }
  const defaultThemes = [
    { cardBg: "from-[#0d1e38]/90 via-[#0a162b]/85 to-[#070e1c]/90", borderClass: "border-blue-500/30 hover:border-blue-400/60", glowClass: "shadow-[0_0_20px_rgba(37,99,235,0.2)]" },
    { cardBg: "from-[#1a2335]/90 via-[#121927]/85 to-[#0b101b]/90", borderClass: "border-slate-500/30 hover:border-slate-400/60", glowClass: "shadow-[0_0_20px_rgba(148,163,184,0.18)]" },
    { cardBg: "from-[#2f2210]/90 via-[#1f160a]/85 to-[#120d06]/90", borderClass: "border-amber-500/30 hover:border-amber-400/60", glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" },
    { cardBg: "from-[#381318]/90 via-[#240b0e]/85 to-[#130507]/90", borderClass: "border-red-500/30 hover:border-red-400/60", glowClass: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
    { cardBg: "from-[#3d0f19]/90 via-[#270910]/85 to-[#150508]/90", borderClass: "border-rose-500/30 hover:border-rose-400/60", glowClass: "shadow-[0_0_20px_rgba(244,63,94,0.2)]" },
    { cardBg: "from-[#271336]/90 via-[#1a0c24]/85 to-[#0f0715]/90", borderClass: "border-purple-500/30 hover:border-purple-400/60", glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.2)]" },
  ];
  return defaultThemes[index % defaultThemes.length];
};

// Web Audio sound effects
const playAudioEffect = (type, isMuted) => {
  if (isMuted || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "bid") {
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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio gesture may be blocked
  }
};

export default function LiveAuctionArena() {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(15);

  // Authenticated Bidding Team state
  const [biddingTeam, setBiddingTeam] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("epl_bidding_team");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamKeyInput, setTeamKeyInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [bidError, setBidError] = useState("");
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const prevBidRef = useRef(0);

  // Polling live auction state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/auction/state", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAuctionData(data);

        // Sound cues on bid update
        if (data.state?.currentBid && data.state.currentBid !== prevBidRef.current) {
          if (prevBidRef.current > 0) playAudioEffect("bid", isMuted);
          prevBidRef.current = data.state.currentBid;
        }

        if (data.state?.timerSeconds !== undefined && data.state?.timerSeconds !== null) {
          setCountdownSeconds(data.state.timerSeconds);
        }
      }
    } catch (err) {
      console.error("Auction state fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isMuted]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [fetchState]);

  // Client-side local timer tick down
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen support (with F key shortcut)
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "f" || e.key === "F") && !["INPUT", "TEXTAREA"].includes(e.target?.tagName)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  const state = auctionData?.state || {};

  // Check if auction is actively running from admin action
  const isAuctionActive =
    (state.status === "in_progress" || state.status === "paused") &&
    Array.isArray(state.players) &&
    state.players.length > 0;

  // Active Player under the hammer (ONLY REAL DATA FROM DB)
  const activePlayer = useMemo(() => {
    if (!isAuctionActive) return null;
    const p = state.players[state.currentPlayerIndex];
    if (!p) return null;

    return {
      fullName: p.fullName || "Player on Stage",
      photoUrl: p.photoUrl || null,
      role: p.role || p.category || (p.categories && p.categories[0]) || "Cricketer",
      batsman: p.batsman || "RHB",
      bowler: p.bowler || "RAM",
      session: p.session || "—",
      lastMatch: p.session ? `Session: ${p.session}` : "—",
      basePrice: state.tierBasePrice || p.basePrice || 0,
      currentBid: state.currentBid || state.tierBasePrice || p.basePrice || 0,
      currentBidderTeamName: state.currentBidderTeamName || null,
      currentBidderTeamLogo: state.currentBidderTeamLogo || null,
      status: state.hammerStatus ? state.hammerStatus.replace("_", " ").toUpperCase() : "BIDDING OPEN",
      timerSeconds: countdownSeconds,
      tier: state.tierName || p.tier || "Tier",
    };
  }, [isAuctionActive, state, countdownSeconds]);

  // Upcoming players queue (ONLY REAL DATA FROM DB)
  const upcomingPlayers = useMemo(() => {
    if (!isAuctionActive || !Array.isArray(state.players)) return [];
    return state.players
      .slice(state.currentPlayerIndex + 1)
      .filter((p) => p.status === "upcoming")
      .slice(0, 3)
      .map((p) => ({
        name: p.fullName,
        photoUrl: p.photoUrl || null,
        role: p.category || "Cricketer",
      }));
  }, [isAuctionActive, state]);

  // Live Bid History (ONLY REAL DATA FROM DB)
  const bidHistory = useMemo(() => {
    if (!isAuctionActive || !Array.isArray(state.bidHistory) || state.bidHistory.length === 0) {
      return [];
    }
    return state.bidHistory.slice(-5).reverse().map((b) => ({
      teamName: b.teamName,
      amount: b.amount,
      timeAgo: "Recent",
    }));
  }, [isAuctionActive, state]);

  // Teams with remaining purses (ONLY REAL DATA FROM DB)
  const teamsList = useMemo(() => {
    const dbTeams = auctionData?.teams || [];
    return dbTeams.map((t, idx) => {
      const theme = getTeamTheme(t.name, idx);
      return {
        _id: t._id,
        name: t.name,
        logoUrl: t.logoUrl || null,
        pointsRemaining: t.pointsRemaining ?? 50000,
        ...theme,
      };
    });
  }, [auctionData]);

  // Team authentication handler
  const handleTeamLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auction/team-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueKey: teamKeyInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid secret team key");

      setBiddingTeam(data.team);
      localStorage.setItem("epl_bidding_team", JSON.stringify(data.team));
      setShowTeamModal(false);
      setTeamKeyInput("");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogoutTeam = () => {
    setBiddingTeam(null);
    localStorage.removeItem("epl_bidding_team");
  };

  // Place live bid
  const handlePlaceBid = async () => {
    if (!biddingTeam) {
      setShowTeamModal(true);
      return;
    }
    setBidError("");
    setIsSubmittingBid(true);
    try {
      const res = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uniqueKey: biddingTeam.uniqueKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place bid");
      fetchState();
    } catch (err) {
      setBidError(err.message);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // SVG Circular Timer calculations (radius = 42, perimeter = 264)
  const maxSeconds = 15;
  const currentSec = Math.max(0, Math.min(maxSeconds, countdownSeconds));
  const circleOffset = 264 - (currentSec / maxSeconds) * 264;

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-[#0A0F1D] text-white flex flex-col justify-between relative overflow-x-hidden ${isFullscreen ? "p-0" : ""}`}>
      {/* 1. Global Site Navbar (Hidden in Fullscreen for immersive stadium view) */}
      {!isFullscreen && <SiteNavbar />}

      {/* 2. Stadium Night Atmosphere Background Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/cricket-stadium-desktop-v2.png"
          alt="Stadium background"
          fill
          priority
          className="object-cover object-center opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1D]/90 via-[#0A0F1D]/80 to-[#0A0F1D]/95" />
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute top-1/2 -right-32 size-96 rounded-full bg-sky-500/10 blur-[130px]" />
      </div>

      {/* ======================================================== */}
      {/* CASE A: AUCTION NOT STARTED YET (STANDBY SCREEN)         */}
      {/* ======================================================== */}
      {!isAuctionActive ? (
        <main className="relative z-10 mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] py-8 flex-1 flex flex-col justify-between">
          
          {/* Top Status Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#F59E0B]" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                OFFICIAL AUCTION ARENA • STANDBY
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111827]/70 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 transition-all backdrop-blur-md cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen (Press F or Esc)" : "Enter Fullscreen (Press F)"}
              >
                {isFullscreen ? (
                  <>
                    <FaCompress className="text-amber-400 text-xs" />
                    <span className="hidden xs:inline">Exit Full</span>
                  </>
                ) : (
                  <>
                    <FaExpand className="text-amber-400 text-xs" />
                    <span className="hidden xs:inline">Fullscreen</span>
                  </>
                )}
              </button>

              {/* Franchise Team Login */}
              {biddingTeam ? (
                <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  <TeamCrest name={biddingTeam.name} className="size-4" />
                  <span className="truncate max-w-[120px]">{biddingTeam.name}</span>
                  <button
                    onClick={handleLogoutTeam}
                    className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                    title="Logout Team"
                  >
                    <FaRightFromBracket className="text-[10px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-white/5 hover:bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 transition-all backdrop-blur-md cursor-pointer"
                >
                  <FaKey className="text-[11px] text-amber-400" />
                  <span>Team Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Standby Central Stage Card */}
          <div className="my-auto py-12 text-center max-w-2xl mx-auto flex flex-col items-center">
            <div className="relative size-20 sm:size-24 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
              <FaGavel className="text-3xl sm:text-4xl text-amber-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-amber-300 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="size-2 rounded-full bg-amber-400 animate-ping" />
              <span>AUCTION HAS NOT STARTED YET</span>
            </div>

            <h1 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-tight drop-shadow-lg mb-4">
              LIVE AUCTION ARENA
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
              The live tournament auction draft is currently on standby. The bidding stage, current player under the hammer, and live timers will automatically appear here once started by tournament administrators.
            </p>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0C1527]/80 px-4 py-2 text-xs font-mono text-slate-400 backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Broadcast receiver listening • Updates in real-time</span>
            </div>
          </div>

          {/* Teams Registered (Only shows real teams if admin has added them) */}
          <div className="mt-8 mb-6">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
              TEAM PURSES {teamsList.length > 0 && `(${teamsList.length})`}
            </h2>

            {teamsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
                {teamsList.map((team, idx) => (
                  <div
                    key={team._id || idx}
                    className={`relative rounded-2xl border ${team.borderClass} bg-gradient-to-b ${team.cardBg} p-3.5 sm:p-4 text-center backdrop-blur-xl shadow-lg flex flex-col items-center justify-between min-h-[145px]`}
                  >
                    <div className="my-1">
                      <TeamCrest name={team.name} logoUrl={team.logoUrl} className="size-11 sm:size-12" />
                    </div>
                    <h3 className="font-sans font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-tight mt-1 truncate w-full">
                      {team.name}
                    </h3>
                    <div className="mt-2 w-full pt-2 border-t border-white/10">
                      <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400">
                        REMAINING PURSES
                      </span>
                      <span className="block font-mono text-xs sm:text-sm font-black text-amber-400 mt-0.5">
                        {team.pointsRemaining?.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-slate-500 italic">
                No teams registered yet. Teams will appear here once added by administrators.
              </div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="py-4 border-t border-white/10 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Organized with pride by:</span>
            <div className="flex items-center gap-2">
              <Image
                src="/addyanta-14-logo.png"
                alt="Addyanta-14"
                width={100}
                height={38}
                className="h-6 sm:h-7 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              />
            </div>
            <span>• Faculty of ESDM, PSTU</span>
          </div>

        </main>
      ) : (
        /* ======================================================== */
        /* CASE B: AUCTION IS LIVE (MATCHING REFERENCE IMAGE HUD)   */
        /* ======================================================== */
        <main className="relative z-10 mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] py-6 sm:py-8 flex-1 flex flex-col justify-between">
          
          {/* Top Control Bar: Audio + Team Login */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                OFFICIAL BROADCAST ARENA
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                PSTU Central Stage
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Fullscreen Toggle */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111827]/70 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 transition-all backdrop-blur-md cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen (Press F or Esc)" : "Enter Fullscreen (Press F)"}
              >
                {isFullscreen ? (
                  <>
                    <FaCompress className="text-amber-400 text-xs" />
                    <span className="hidden xs:inline">Exit Full</span>
                  </>
                ) : (
                  <>
                    <FaExpand className="text-amber-400 text-xs" />
                    <span className="hidden xs:inline">Fullscreen</span>
                  </>
                )}
              </button>

              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#111827]/70 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-md cursor-pointer"
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <FaVolumeXmark className="text-rose-400" /> : <FaVolumeHigh className="text-amber-400" />}
                <span className="hidden xs:inline">{isMuted ? "Muted" : "Live Audio"}</span>
              </button>

              {/* Team Manager Login / Status */}
              {biddingTeam ? (
                <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                  <TeamCrest name={biddingTeam.name} className="size-4" />
                  <span className="truncate max-w-[120px]">{biddingTeam.name}</span>
                  <button
                    onClick={handleLogoutTeam}
                    className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                    title="Logout Team"
                  >
                    <FaRightFromBracket className="text-[10px]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-white/5 hover:bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-slate-300 hover:text-amber-400 transition-all backdrop-blur-md cursor-pointer"
                >
                  <FaKey className="text-[10px] text-amber-400" />
                  <span>Team Login</span>
                </button>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* ROW 1: CURRENTLY UNDER THE HAMMER + BID HISTORY & UPCOMING */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 sm:mb-8 items-stretch">
            
            {/* LEFT PANEL: CURRENTLY UNDER THE HAMMER */}
            <div className="lg:col-span-7 flex flex-col">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-2">
                CURRENTLY UNDER THE HAMMER
              </h2>

              {/* Hero Stage Card */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 xs:p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex-1 flex flex-col justify-between">
                
                <div className="absolute top-0 right-0 size-64 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

                {activePlayer ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
                    
                    {/* 1. Athlete Cutout Portrait */}
                    <div className="md:col-span-4 lg:col-span-3.5 flex justify-center">
                      <div className="relative aspect-[3/4] w-full max-w-[200px] md:max-w-none rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-[#070A12] shadow-[0_10px_30px_rgba(0,0,0,0.7)] group">
                        {activePlayer.photoUrl ? (
                          <Image
                            src={activePlayer.photoUrl}
                            alt={activePlayer.fullName}
                            fill
                            priority
                            unoptimized
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 200px, 240px"
                          />
                        ) : (
                          <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-[#151c2e] to-[#080d19] text-amber-400 p-4">
                            <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl font-black mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                              {activePlayer.fullName ? activePlayer.fullName.slice(0, 2).toUpperCase() : "PL"}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              ATHLETE
                            </span>
                          </div>
                        )}
                        {/* Round Stamp Overlay for SOLD / UNSOLD */}
                        {["sold", "unsold"].includes((state.hammerStatus || "").toLowerCase()) && (
                          <div className="absolute inset-0 z-30 flex items-center justify-center p-3 pointer-events-none">
                            <AuctionRoundStamp
                              status={state.hammerStatus}
                              size="responsive"
                              price={state.hammerStatus === "sold" ? (state.currentBid || activePlayer.currentBid) : null}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* 2. Player Information & Attributes */}
                    <div className="md:col-span-4 lg:col-span-4 flex flex-col justify-center text-center md:text-left space-y-1.5">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                        CURRENT PLAYER
                      </span>
                      
                      <h1 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl text-white uppercase tracking-tight leading-[1.05] drop-shadow-md">
                        {activePlayer.fullName}
                      </h1>

                      <p className="text-xs sm:text-sm font-semibold text-slate-300 pb-1.5">
                        {activePlayer.role}
                      </p>

                      <div className="space-y-1 pt-1.5 border-t border-white/10 text-xs text-slate-300">
                        <p>
                          <span className="text-slate-400 font-medium">Batsman:</span>{" "}
                          <strong className="text-white font-bold">{activePlayer.batsman}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-medium">Bowler:</span>{" "}
                          <strong className="text-white font-bold">{activePlayer.bowler}</strong>
                        </p>
                        <p>
                          <span className="text-slate-400 font-medium">Last Match:</span>{" "}
                          <strong className="text-white font-bold">{activePlayer.lastMatch}</strong>
                        </p>
                      </div>
                    </div>

                    {/* 3. Bidding Status & Circular Countdown Timer (Side-by-side) */}
                    <div className="md:col-span-4 lg:col-span-4.5 flex flex-col justify-between h-full space-y-4">
                      
                      {/* Bidding Open Badge */}
                      <div className="flex justify-center md:justify-end">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-[#161208]/90 px-3.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                          <span>{activePlayer.status}</span>
                        </div>
                      </div>

                      {/* Side-by-side: Bids Left + Circular Timer Right */}
                      <div className="flex items-center justify-between gap-3 sm:gap-4">
                        {/* Bidding numbers */}
                        <div className="text-left">
                          <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            BASE PRICE:
                          </span>
                          <strong className="block text-xs sm:text-sm font-black text-slate-200">
                            {activePlayer.basePrice?.toLocaleString()} PTS
                          </strong>

                          <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-2.5">
                            CURRENT BID:
                          </span>
                          <strong className="block font-mono text-2xl xs:text-3xl sm:text-[34px] font-black text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)] leading-tight">
                            {activePlayer.currentBid?.toLocaleString()} PTS
                          </strong>

                          {/* Leading Bidder Team */}
                          <div className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-slate-200">
                            {activePlayer.currentBidderTeamName ? (
                              <>
                                <TeamCrest
                                  name={activePlayer.currentBidderTeamName}
                                  logoUrl={activePlayer.currentBidderTeamLogo}
                                  className="size-5"
                                />
                                <span className="truncate max-w-[150px]">{activePlayer.currentBidderTeamName}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 font-semibold italic text-xs">
                                Waiting for Opening Bid
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Circular Timer (Matching Reference Image) */}
                        <div className="relative size-24 sm:size-28 shrink-0 flex items-center justify-center">
                          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-white/10"
                              strokeWidth="5"
                              fill="transparent"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="42"
                              className="stroke-amber-400 transition-all duration-1000 ease-linear drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                              strokeWidth="5.5"
                              strokeDasharray={264}
                              strokeDashoffset={circleOffset}
                              strokeLinecap="round"
                              fill="transparent"
                            />
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums leading-none">
                              00:{pad(activePlayer.timerSeconds)}
                            </span>
                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-400/90 mt-1">
                              SECONDS
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400">
                    <p className="text-base font-bold text-white mb-1">Waiting for player to take the stage</p>
                    <p className="text-xs text-slate-500">The next athlete in the tier queue will appear here.</p>
                  </div>
                )}

                {/* Bidding Control Bar (If logged in as team) */}
                {biddingTeam && (
                  <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="text-slate-400">Your Team:</span>{" "}
                      <b className="text-amber-400">{biddingTeam.name}</b> • Remaining:{" "}
                      <b className="text-white font-mono">
                        {biddingTeam.pointsRemaining?.toLocaleString() || "50,000"} PTS
                      </b>
                    </div>

                    <button
                      type="button"
                      onClick={handlePlaceBid}
                      disabled={isSubmittingBid}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
                    >
                      <FaGavel className="text-xs" />
                      <span>{isSubmittingBid ? "Bidding..." : "Place Next Bid"}</span>
                    </button>
                  </div>
                )}

                {bidError && (
                  <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2 text-center text-xs text-rose-300 font-bold">
                    {bidError}
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT PANEL: BID HISTORY & UPCOMING PLAYERS */}
            <div className="lg:col-span-5 flex flex-col">
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-2">
                BID HISTORY & UPCOMING PLAYERS
              </h2>

              <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 xs:p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex-1 flex flex-col justify-between">
                
                {/* Top: Live Bid History */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    LIVE BID HISTORY
                  </h3>

                  {bidHistory.length > 0 ? (
                    <div className="space-y-2.5">
                      {bidHistory.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs sm:text-[13px] py-1 border-b border-white/[0.04] last:border-0"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="size-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                            <span className="truncate text-slate-200">
                              <strong className="text-amber-400 font-bold">{item.teamName}</strong> placed bid of{" "}
                              <span className="text-white font-bold font-mono">{item.amount?.toLocaleString()} PTS</span>
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                            ({item.timeAgo})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500 italic">
                      No bids placed yet for this player.
                    </div>
                  )}
                </div>

                {/* Bottom: Upcoming Players */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    UPCOMING PLAYERS
                  </h3>

                  {upcomingPlayers.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                      {upcomingPlayers.map((player, idx) => {
                        const parts = (player.name || "").split(" ");
                        const firstName = parts[0] || "";
                        const restName = parts.slice(1).join(" ") || "";
                        return (
                          <div
                            key={idx}
                            className="group relative flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0d1627]/80 p-2 sm:p-2.5 hover:border-amber-500/40 hover:bg-[#121e35] transition-all cursor-pointer shadow-md"
                          >
                            <div className="relative size-10 sm:size-11 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#070A12]">
                              {player.photoUrl ? (
                                <Image
                                  src={player.photoUrl}
                                  alt={player.name}
                                  fill
                                  unoptimized
                                  className="object-cover object-top"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="size-full flex items-center justify-center bg-white/5 text-amber-400 font-black text-xs">
                                  {firstName.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-sans font-black text-[11px] sm:text-xs text-white uppercase leading-tight truncate">
                                {firstName}
                              </p>
                              {restName && (
                                <p className="font-sans font-black text-[11px] sm:text-xs text-white uppercase leading-tight truncate">
                                  {restName}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-3 text-center text-xs text-slate-500 italic">
                      No upcoming players remaining in this tier queue.
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* ROW 2: TEAM PURSES                                       */}
          {/* ======================================================== */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 mb-2.5 flex items-center gap-2">
              TEAM PURSES {teamsList.length > 0 && `(${teamsList.length})`}
            </h2>

            {teamsList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
                {teamsList.map((team, idx) => (
                  <div
                    key={team._id || idx}
                    className={`relative rounded-2xl border ${team.borderClass} bg-gradient-to-b ${team.cardBg} p-3.5 sm:p-4 text-center backdrop-blur-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col items-center justify-between min-h-[145px]`}
                  >
                    <div className="my-1">
                      <TeamCrest name={team.name} logoUrl={team.logoUrl} className="size-11 sm:size-12" />
                    </div>

                    <h3 className="font-sans font-black text-xs sm:text-sm text-white uppercase tracking-tight leading-tight mt-1 truncate w-full">
                      {team.name}
                    </h3>

                    <div className="mt-2 w-full pt-2 border-t border-white/10">
                      <span className="block text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400">
                        REMAINING PURSES
                      </span>
                      <span className="block font-mono text-xs sm:text-sm font-black text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] mt-0.5">
                        {team.pointsRemaining?.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-slate-500 italic">
                No teams registered yet. Teams will appear here once added by administrators.
              </div>
            )}
          </div>

          {/* Bottom Organizer Crest Branding */}
          <div className="py-4 border-t border-white/10 flex items-center justify-center gap-3 text-xs text-slate-400">
            <span>Organized with pride by:</span>
            <div className="flex items-center gap-2">
              <Image
                src="/addyanta-14-logo.png"
                alt="Addyanta-14"
                width={100}
                height={38}
                className="h-6 sm:h-7 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              />
            </div>
            <span>• Faculty of ESDM, PSTU</span>
          </div>

        </main>
      )}

      {/* Team Login Modal */}
      {showTeamModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
          onClick={() => setShowTeamModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-amber-500/40 bg-[#0C1527] p-6 sm:p-8 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FaKey />
                </div>
                <div>
                  <h3 className="font-sans font-black text-lg text-white uppercase">
                    Team Bidding Key
                  </h3>
                  <p className="text-[11px] text-slate-400">Enter your franchise secret key</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="size-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTeamLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Unique Team Key:
                </label>
                <input
                  type="password"
                  value={teamKeyInput}
                  onChange={(e) => setTeamKeyInput(e.target.value)}
                  placeholder="e.g. KEY-STORMERS-2027"
                  required
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 outline-none"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-black uppercase text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] cursor-pointer transition-all"
              >
                Authenticate & Access Bidding
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Quick Fullscreen Toggle Button */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-[#0A0F1D]/90 px-3.5 py-1.5 text-xs font-black uppercase text-amber-400 hover:bg-amber-500/20 hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all cursor-pointer"
        title={isFullscreen ? "Exit Fullscreen (Press F or Esc)" : "Enter Fullscreen (Press F)"}
      >
        {isFullscreen ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
        <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
      </button>

    </div>
  );
}
