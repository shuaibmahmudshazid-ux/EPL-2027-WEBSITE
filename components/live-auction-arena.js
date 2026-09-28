"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaBars,
  FaChartPie,
  FaCheck,
  FaCoins,
  FaExpand,
  FaGavel,
  FaKey,
  FaLayerGroup,
  FaLock,
  FaMagnifyingGlass,
  FaRightFromBracket,
  FaShieldHalved,
  FaStopwatch,
  FaTrophy,
  FaUserCheck,
  FaUsers,
  FaVolumeHigh,
  FaVolumeXmark,
  FaXmark,
} from "react-icons/fa6";

const safeParse = async (response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

// Web Audio API Sound Synthesizer (Realistic chimes & gavel without external assets)
const playAudioEffect = (type, isMuted) => {
  if (isMuted || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "bid") {
      // Pleasant high-energy bid ping (D5 -> A5)
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
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "sold") {
      // Celebratory major triad fanfare (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
};

const LiveAuctionArena = () => {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stage"); // "stage" | "purses" | "archive" | "analytics"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Team authentication state
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

  // Archive search & filter
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveCategory, setArchiveCategory] = useState("all");
  const [archiveStatus, setArchiveStatus] = useState("all");

  // Selected team squad modal
  const [inspectSquadTeam, setInspectSquadTeam] = useState(null);

  const prevBidRef = useRef(0);
  const prevHammerRef = useRef("");
  const canvasRef = useRef(null);

  // Canvas Confetti Generator on SOLD!
  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#d4a84f", "#f2d590", "#e74c3c", "#2ecc71", "#3498db", "#ffffff"];
    const particles = Array.from({ length: 90 }).map(() => ({
      x: canvas.width / 2,
      y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.35,
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= 0.012;
        p.rotation += p.rotSpeed;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });
      if (alive) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    render();
  }, []);

  // Poll auction state every 1.2s for real-time updates
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/auction/state", { cache: "no-store" });
      const data = await safeParse(res);
      if (res.ok) {
        setAuctionData(data);

        // Sound cues
        if (data.state?.currentBid && data.state.currentBid !== prevBidRef.current) {
          if (prevBidRef.current > 0) playAudioEffect("bid", isMuted);
          prevBidRef.current = data.state.currentBid;
        }

        if (data.state?.hammerStatus) {
          if (
            (data.state.hammerStatus === "going_once" || data.state.hammerStatus === "going_twice") &&
            data.state.hammerStatus !== prevHammerRef.current
          ) {
            playAudioEffect("hammer", isMuted);
          } else if (data.state.hammerStatus === "sold" && prevHammerRef.current !== "sold") {
            playAudioEffect("sold", isMuted);
            triggerConfetti();
          }
          prevHammerRef.current = data.state.hammerStatus;
        }
      }
    } catch {
      // silent network error on background poll
    } finally {
      setLoading(false);
    }
  }, [isMuted, triggerConfetti]);

  useEffect(() => {
    const timer = window.setTimeout(fetchState, 0);
    const interval = setInterval(fetchState, 1200);
    return () => {
      window.clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchState]);

  // Fullscreen toggle helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Team Login Handler
  const handleTeamLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/auction/team-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueKey: teamKeyInput }),
      });
      const data = await safeParse(res);
      if (!res.ok) throw new Error(data.error || "Invalid Team Key.");

      setBiddingTeam(data.team);
      localStorage.setItem("epl_bidding_team", JSON.stringify(data.team));
      setShowTeamModal(false);
      setTeamKeyInput("");
      await fetchState();
    } catch (err) {
      setLoginError(err.message || "Failed to authenticate team.");
    }
  };

  const handleTeamLogout = () => {
    setBiddingTeam(null);
    localStorage.removeItem("epl_bidding_team");
  };

  // Bid Handler
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
        body: JSON.stringify({ teamId: biddingTeam._id }),
      });
      const data = await safeParse(res);
      if (!res.ok) throw new Error(data.error || "Failed to place bid.");
      await fetchState();
    } catch (err) {
      setBidError(err.message || "Unable to place bid.");
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const state = auctionData?.state || {};
  const teams = auctionData?.teams || [];
  const rawAuctionedPlayers = auctionData?.auctionedPlayers;
  const auctionedPlayers = rawAuctionedPlayers || [];
  const stats = auctionData?.auctionStats || {};
  const currentQueue = state.players || [];
  const currentPlayer = currentQueue[state.currentPlayerIndex] || null;
  const isFifthPlayer = state.currentPlayerIndex === 4;

  const currentBasePrice = isFifthPlayer && state.fifthPlayerCalculatedBasePrice
    ? state.fifthPlayerCalculatedBasePrice
    : state.tierBasePrice || 500;

  const nextMinimumBid = auctionData?.nextMinimumBid || currentBasePrice;
  const incrementAmount = (state.currentBid || 0) < 10000 ? 500 : 2000;

  const currentTeamInfo = biddingTeam
    ? teams.find((t) => t._id === biddingTeam._id) || biddingTeam
    : null;

  const isLeadingBidder =
    biddingTeam &&
    state.currentBidderTeam &&
    state.currentBidderTeam.toString() === biddingTeam._id.toString();

  const hasEnoughPurse =
    currentTeamInfo && (currentTeamInfo.pointsRemaining || 0) >= nextMinimumBid;

  const isBiddingOpen =
    state.status === "in_progress" &&
    ["bidding_open", "going_once", "going_twice"].includes(state.hammerStatus);

  // Filtered Archive
  const filteredArchive = useMemo(() => {
    return (rawAuctionedPlayers || []).filter((p) => {
      const q = archiveSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        [p.fullName, p.playerId, p.team?.name, p.session].some((v) =>
          v?.toLowerCase().includes(q)
        );
      const matchCat =
        archiveCategory === "all" || (p.categories || []).includes(archiveCategory);
      const matchStatus =
        archiveStatus === "all" || p.auctionStatus === archiveStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [rawAuctionedPlayers, archiveSearch, archiveCategory, archiveStatus]);

  return (
    <div className="relative min-h-screen bg-[#02101b] text-white selection:bg-[#d4a84f] selection:text-black">
      {/* CONFETTI CANVAS */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 size-full"
      />

      {/* TOP BROADCAST TICKER & NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#031524]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          {/* TOURNAMENT LOGO & ON-AIR BADGE */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#8b979d] hover:text-white transition-colors"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">EPL Home</span>
            </Link>

            <div className="h-4 w-px bg-white/20" />

            <div className="flex items-center gap-2">
              <span className="relative flex size-3">
                {state.status === "in_progress" ? (
                  <>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full bg-red-600" />
                  </>
                ) : state.status === "paused" ? (
                  <>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex size-3 rounded-full bg-amber-500" />
                  </>
                ) : (
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                )}
              </span>
              <div className="leading-tight">
                <span className="block text-xs font-black tracking-widest text-[#d4a84f]">
                  EPL 2027
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-white">
                  {state.status === "in_progress"
                    ? "Live Auction Center"
                    : state.status === "paused"
                    ? "Auction Paused"
                    : state.status === "completed"
                    ? "Auction Concluded"
                    : "Live Auction Center"}
                </span>
              </div>
            </div>
          </div>

          {/* BROADCAST TABS */}
          <nav className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#02121f] p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("stage")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-all cursor-pointer ${
                activeTab === "stage"
                  ? "bg-[#b8872f] text-black shadow-md"
                  : "text-[#9faab2] hover:text-white"
              }`}
            >
              <FaGavel />
              Live Stage
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("purses")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-all cursor-pointer ${
                activeTab === "purses"
                  ? "bg-[#b8872f] text-black shadow-md"
                  : "text-[#9faab2] hover:text-white"
              }`}
            >
              <FaUsers />
              Team Purses &amp; Squads
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archive")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-all cursor-pointer ${
                activeTab === "archive"
                  ? "bg-[#b8872f] text-black shadow-md"
                  : "text-[#9faab2] hover:text-white"
              }`}
            >
              <FaTrophy />
              Sold Archive ({auctionedPlayers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-[#b8872f] text-black shadow-md"
                  : "text-[#9faab2] hover:text-white"
              }`}
            >
              <FaChartPie />
              Stats
            </button>
          </nav>

          {/* CONTROLS: AUDIO, FULLSCREEN & TEAM BIDDING LOGIN */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="grid size-8 place-items-center rounded-md border border-white/15 bg-white/5 text-[#d4a84f] hover:bg-white/10 cursor-pointer"
              title={isMuted ? "Unmute broadcast sound effects" : "Mute broadcast sounds"}
            >
              {isMuted ? <FaVolumeXmark /> : <FaVolumeHigh />}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden sm:grid size-8 place-items-center rounded-md border border-white/15 bg-white/5 text-white hover:bg-white/10 cursor-pointer"
              title="Toggle Fullscreen Projector / TV Mode"
            >
              <FaExpand />
            </button>

            {currentTeamInfo ? (
              <div className="flex items-center gap-2 rounded-lg border border-[#d4a84f]/40 bg-[#76511d]/30 px-3 py-1 text-xs">
                <div>
                  <span className="font-extrabold text-[#f2d590]">{currentTeamInfo.name}</span>
                  <span className="ml-2 font-mono font-bold text-white">
                    ৳ {currentTeamInfo.pointsRemaining?.toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleTeamLogout}
                  className="text-[#9faab2] hover:text-red-300 cursor-pointer"
                  title="Log out team"
                >
                  <FaRightFromBracket />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#b8872f] px-3.5 py-1.5 text-xs font-black uppercase text-black hover:brightness-110 shadow-lg cursor-pointer"
              >
                <FaKey />
                Team Bid Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* VIEWPORT BODY */}
      <main className="mx-auto max-w-[1500px] p-4">
        {loading ? (
          <div className="grid min-h-[65vh] place-items-center text-sm text-[#8b979d]">
            Connecting to high-definition auction live stream...
          </div>
        ) : activeTab === "stage" ? (
          /* ======================================================== */
          /* 1. LIVE ARENA BROADCAST STAGE                             */
          /* ======================================================== */
          (state.status === "in_progress" || state.status === "paused") && currentPlayer ? (
            <div className="grid gap-5 lg:grid-cols-12">
              {/* LEFT & CENTER SPOTLIGHT (COLS 8) */}
              <div className="space-y-4 lg:col-span-8">
                {/* HERO SPOTLIGHT PLAYER CARD */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-[#d4a84f]/50 bg-gradient-to-b from-[#041c30] via-[#021321] to-[#010b12] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                  {/* FLOODLIGHT ACCENT GLOW */}
                  <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-[#d4a84f]/15 blur-3xl" />
                  <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-blue-500/10 blur-3xl" />

                  {/* TOP STAGE BANNER */}
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-[#76511d] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#f2d590]">
                        {state.category}
                      </span>
                      <span className="rounded-md border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-bold text-white">
                        {state.tierName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#b8872f] px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow">
                        PLAYER {state.currentPlayerIndex + 1} OF {currentQueue.length}
                      </span>
                    </div>
                  </div>

                  {/* PAUSED BROADCAST CALLOUT */}
                  {state.status === "paused" && (
                    <div className="mb-5 rounded-xl border-2 border-amber-400/90 bg-gradient-to-r from-amber-950/95 via-amber-900/80 to-amber-950/95 p-4 text-center text-amber-200 shadow-xl animate-pulse">
                      <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider text-amber-300">
                        <FaStopwatch className="text-amber-400 text-base" />
                        Live Auction is Temporarily Paused
                      </div>
                      <p className="mt-1 text-xs text-[#ffd37f]">
                        The auctioneer has paused live bidding. Player clock and bidding controls are temporarily frozen.
                      </p>
                    </div>
                  )}

                  {/* 5TH PLAYER AVERAGE RULE SPOTLIGHT CALLOUT */}
                  {isFifthPlayer && (
                    <div className="mb-5 rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-amber-950/90 p-4 shadow-lg animate-pulse">
                      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-300">
                        <FaCoins className="text-amber-400 text-base" />
                        5th Player Special Tournament Rule Active!
                      </div>
                      <p className="mt-1 text-xs text-[#ffd37f]">
                        Starting price is automatically computed as the exact average of{" "}
                        <b>Player 3</b> (৳ {state.player3SoldPrice?.toLocaleString() || "Unsold"}) and{" "}
                        <b>Player 4</b> (৳ {state.player4SoldPrice?.toLocaleString() || "Unsold"}) ={" "}
                        <span className="inline-block rounded bg-black/40 px-2 py-0.5 text-sm font-extrabold text-white border border-amber-400/40">
                          ৳ {state.fifthPlayerCalculatedBasePrice?.toLocaleString() || 500}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* PLAYER PROFILE ROW */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative group shrink-0">
                      {currentPlayer.photoUrl ? (
                        <img
                          src={currentPlayer.photoUrl}
                          alt={currentPlayer.fullName}
                          className="size-36 sm:size-40 rounded-2xl border-2 border-[#d4a84f] object-cover shadow-2xl transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-36 sm:size-40 place-items-center rounded-2xl border-2 border-[#d4a84f] bg-white/10 text-4xl font-black text-[#d4a84f] shadow-2xl">
                          {currentPlayer.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-2 inset-x-0 mx-auto w-fit rounded-full bg-[#d4a84f] px-2.5 py-0.5 text-[9px] font-black uppercase text-black shadow">
                        ON THE BLOCK
                      </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-3xl sm:text-4xl font-black tracking-wide text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                        {currentPlayer.fullName}
                      </h2>

                      <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-[#9faab2]">
                        <span>
                          Student ID: <b className="text-white font-mono">{currentPlayer.playerId}</b>
                        </span>
                        <span>•</span>
                        <span>
                          Session: <b className="text-white">{currentPlayer.session}</b>
                        </span>
                        <span>•</span>
                        <span>
                          Reg. No: <b className="text-white font-mono">{currentPlayer.registrationNumber || "—"}</b>
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <div className="rounded-lg border border-white/10 bg-[#02121f] px-3 py-1.5 text-xs">
                          <span className="text-[#8b979d]">Base Starting Price: </span>
                          <b className="font-mono text-sm font-bold text-[#d4a84f]">
                            ৳ {currentBasePrice.toLocaleString()}
                          </b>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-[#02121f] px-3 py-1.5 text-xs text-[#9faab2]">
                          <span>Rule Increment: </span>
                          <b className="text-white">
                            {(state.currentBid || 0) < 10000 ? "+৳ 500" : "+৳ 2,000"}
                          </b>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BROADCAST SCOREBOARD (LED DISPLAY) */}
                  <div className="mt-7 grid gap-4 rounded-xl border border-white/15 bg-gradient-to-b from-[#021424] to-[#010c17] p-5 sm:grid-cols-2 text-center shadow-inner">
                    <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#8b979d]">
                        CURRENT HIGHEST BID
                      </p>
                      <p className="mt-1 text-4xl sm:text-6xl font-black text-[#d4a84f] drop-shadow-[0_0_20px_rgba(212,168,79,0.4)] font-mono">
                        ৳ {state.currentBid ? state.currentBid.toLocaleString() : "0"}
                      </p>
                      <p className="mt-1 text-[11px] text-[#7c8790]">
                        {state.currentBid >= 10000
                          ? "After ৳ 10,000: Bids raise by +৳ 2,000"
                          : "Until ৳ 10,000: Bids raise by +৳ 500"}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#8b979d]">
                        LEADING BIDDER
                      </p>
                      <p className="mt-2 text-2xl sm:text-3xl font-black text-white truncate">
                        {state.currentBidderTeamName || "Waiting for Opening Bid"}
                      </p>
                      <div className="mt-2.5 flex items-center justify-center gap-2">
                        <span
                          className={`rounded-full border px-3.5 py-1 text-xs uppercase font-extrabold tracking-wider ${
                            state.hammerStatus === "bidding_open"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500 animate-pulse"
                              : state.hammerStatus === "going_once"
                              ? "bg-amber-950/80 text-amber-300 border-amber-400 animate-pulse"
                              : state.hammerStatus === "going_twice"
                              ? "bg-red-950/80 text-red-300 border-red-500 animate-pulse"
                              : state.hammerStatus === "sold"
                              ? "bg-emerald-600 text-white border-emerald-400 font-black shadow-lg"
                              : "bg-white/10 text-white border-white/20"
                          }`}
                        >
                          <FaGavel className="inline mr-1.5 text-xs" />
                          {state.hammerStatus?.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE BID PLACER BAR */}
                  <div className="mt-6">
                    {bidError && (
                      <div className="mb-3 rounded-lg border border-red-500/50 bg-red-950/70 p-3 text-xs text-red-200 text-center font-bold">
                        {bidError}
                      </div>
                    )}

                    {isBiddingOpen ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={handlePlaceBid}
                          disabled={
                            isSubmittingBid ||
                            isLeadingBidder ||
                            (currentTeamInfo && !hasEnoughPurse)
                          }
                          className={`w-full rounded-xl py-4 text-lg sm:text-xl font-black tracking-wide uppercase transition-all shadow-2xl cursor-pointer ${
                            isLeadingBidder
                              ? "border-2 border-emerald-500 bg-emerald-950/80 text-emerald-300 cursor-not-allowed"
                              : currentTeamInfo && !hasEnoughPurse
                              ? "bg-red-900/60 text-red-300 border border-red-500/40 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#b8872f] via-[#d4a84f] to-[#b8872f] text-black hover:brightness-110 active:scale-[0.99] shadow-[0_0_25px_rgba(212,168,79,0.4)]"
                          }`}
                        >
                          {isLeadingBidder ? (
                            "✅ Your Team is Highest Bidder"
                          ) : currentTeamInfo && !hasEnoughPurse ? (
                            `⚠️ Insufficient Points (Need ৳ ${nextMinimumBid.toLocaleString()})`
                          ) : (
                            `PLACE BID: ৳ ${nextMinimumBid.toLocaleString()} (+৳ ${incrementAmount.toLocaleString()})`
                          )}
                        </button>

                        <div className="flex flex-wrap items-center justify-between text-xs text-[#8b979d] px-1">
                          {currentTeamInfo ? (
                            <span>
                              Authenticated as <b className="text-white">{currentTeamInfo.name}</b> • Purse Remaining:{" "}
                              <b className="text-[#d4a84f]">
                                ৳ {currentTeamInfo.pointsRemaining?.toLocaleString()}
                              </b>{" "}
                              / 50,000 pts
                            </span>
                          ) : (
                            <span className="text-[#d4a84f]">
                              Spectator Mode: Login with Team Key to bid on behalf of your team.
                            </span>
                          )}

                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <FaStopwatch /> Timer: {state.timerSeconds || 15}s
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-white/15 bg-[#02121f] p-5 text-center">
                        <p className="text-base font-extrabold text-[#f2d590]">
                          {state.hammerStatus === "sold"
                            ? `🏆 SOLD TO ${state.currentBidderTeamName} for ৳ ${state.currentBid?.toLocaleString()}!`
                            : state.hammerStatus === "unsold"
                            ? "PLAYER UNSOLD"
                            : "BIDDING WAITING"}
                        </p>
                        <p className="text-xs text-[#7c8790] mt-1">
                          Waiting for auctioneer to open next player...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5-PLAYER QUEUE SET PROGRESSION TRACKER */}
                <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#d4a84f] mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FaLayerGroup />
                      {state.tierName} Set Sequence (5 Players)
                    </span>
                    <span className="text-[10px] text-[#8b979d]">
                      Rule: Player 5 base = (P3 + P4) / 2
                    </span>
                  </h3>

                  <div className="grid gap-2 sm:grid-cols-5">
                    {currentQueue.map((item, idx) => {
                      const isCurrent = idx === state.currentPlayerIndex;
                      return (
                        <div
                          key={item.player || idx}
                          className={`flex flex-col justify-between rounded-xl border p-2.5 text-xs transition-all ${
                            isCurrent
                              ? "border-[#d4a84f] bg-[#d4a84f]/15 shadow-md ring-1 ring-[#d4a84f]"
                              : item.status === "sold"
                              ? "border-emerald-500/40 bg-emerald-950/20"
                              : "border-white/5 bg-[#02121f]"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="grid size-5 place-items-center rounded bg-white/10 text-[9px] font-black">
                                #{idx + 1}
                              </span>
                              {idx === 4 && (
                                <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[8px] font-bold text-amber-300">
                                  Avg Rule
                                </span>
                              )}
                            </div>

                            <p className="font-bold text-white truncate text-[11px]">
                              {item.fullName}
                            </p>
                            <p className="text-[10px] text-[#8b979d] truncate">
                              ID: {item.playerId}
                            </p>
                          </div>

                          <div className="mt-2 border-t border-white/5 pt-1.5 text-right">
                            {item.status === "sold" ? (
                              <div>
                                <span className="text-[10px] font-bold text-emerald-400 block truncate">
                                  ৳ {item.soldPrice?.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-[#8b979d] block truncate">
                                  {item.soldToTeamName}
                                </span>
                              </div>
                            ) : item.status === "unsold" ? (
                              <span className="text-[10px] font-bold text-red-400">UNSOLD</span>
                            ) : isCurrent ? (
                              <span className="text-[10px] font-extrabold text-[#d4a84f] animate-pulse">
                                BIDDING
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#7c8790]">
                                ৳ {item.basePrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT BROADCAST SIDEBAR (COLS 4) */}
              <div className="space-y-4 lg:col-span-4">
                {/* TEAMS REMAINING PURSES & SQUADS */}
                <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#d4a84f] mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FaShieldHalved />
                      Team Purses (50k pts)
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("purses")}
                      className="text-[10px] text-[#d4a84f] hover:underline"
                    >
                      View All Squads →
                    </button>
                  </h3>

                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {teams.map((t) => {
                      const percent = Math.round((t.pointsRemaining / 50000) * 100);
                      const isLeading = state.currentBidderTeam?.toString() === t._id.toString();

                      return (
                        <div
                          key={t._id}
                          className={`rounded-xl border p-2.5 text-xs transition-all cursor-pointer hover:border-white/20 ${
                            isLeading
                              ? "border-[#d4a84f] bg-[#d4a84f]/15"
                              : "border-white/10 bg-[#02121f]"
                          }`}
                          onClick={() => setInspectSquadTeam(t)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {t.name}
                              {isLeading && (
                                <span className="rounded bg-[#b8872f] px-1 py-0.2 text-[8px] text-black font-black">
                                  LEAD
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-bold text-[#d4a84f]">
                              ৳ {t.pointsRemaining?.toLocaleString()}
                            </span>
                          </div>

                          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                percent > 40
                                  ? "bg-emerald-500"
                                  : percent > 15
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[10px] text-[#8b979d]">
                            <span>{t.playerCount} player(s) acquired</span>
                            <span>Spent: ৳ {t.pointsSpent?.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* LIVE BID STREAM */}
                <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#d4a84f] mb-3 flex items-center gap-1.5">
                    <FaTrophy />
                    Live Bids Stream
                  </h3>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {(state.bidHistory || []).length === 0 ? (
                      <p className="text-center py-6 text-xs text-[#7c8790]">
                        No bids placed in this round yet.
                      </p>
                    ) : (
                      state.bidHistory.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-[#02121f] px-3 py-2 text-xs"
                        >
                          <span className="font-bold text-white">{b.teamName}</span>
                          <span className="font-mono font-black text-[#d4a84f]">
                            ৳ {b.amount?.toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* IDLE ARENA SCREEN */
            <div className="rounded-2xl border border-white/10 bg-[#031827] p-12 text-center space-y-4 shadow-xl">
              <FaGavel className="mx-auto text-5xl text-[#d4a84f]" />
              <h2 className="text-2xl font-black text-white">Live Tournament Auction Arena</h2>
              <p className="max-w-[560px] mx-auto text-xs text-[#9faab2]">
                The auctioneer has not opened a player tier on the auction block yet. Stay on this screen — when the auction begins, the spotlight player and live bidding board will appear automatically in real-time!
              </p>

              <div className="flex justify-center gap-3 pt-3">
                {!biddingTeam && (
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#b8872f] px-5 py-2.5 text-xs font-black uppercase text-black hover:brightness-110 shadow-lg cursor-pointer"
                  >
                    <FaKey />
                    Team Login to Prepare Bidding
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab("purses")}
                  className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                >
                  View Team Purses &amp; Squads
                </button>
              </div>
            </div>
          )
        ) : activeTab === "purses" ? (
          /* ======================================================== */
          /* 2. TEAMS PURSES & SQUADS VIEW                             */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#031827] p-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FaShieldHalved className="text-[#d4a84f]" />
                  TEAMS PURSE BUDGETS &amp; ROSTERS
                </h3>
                <p className="text-xs text-[#8b979d]">
                  Each team starts with 50,000 points. Click on any team to inspect their full acquired player squad.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((t) => {
                const percent = Math.round((t.pointsRemaining / 50000) * 100);
                return (
                  <div
                    key={t._id}
                    className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg hover:border-[#d4a84f]/50 transition-all cursor-pointer"
                    onClick={() => setInspectSquadTeam(t)}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h4 className="text-base font-black text-white">{t.name}</h4>
                        <p className="text-xs text-[#8b979d]">
                          Managers: {t.managers?.map((m) => m.name).join(", ") || "—"}
                        </p>
                      </div>
                      <span className="rounded bg-[#76511d] px-2 py-0.5 text-xs font-bold text-[#f2d590]">
                        {t.playerCount} Players
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8b979d]">Remaining Purse:</span>
                        <b className="font-mono text-base font-bold text-[#d4a84f]">
                          ৳ {t.pointsRemaining?.toLocaleString()}
                        </b>
                      </div>

                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            percent > 40
                              ? "bg-emerald-500"
                              : percent > 15
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#8b979d]">
                        <span>Spent: ৳ {t.pointsSpent?.toLocaleString()}</span>
                        <span>{percent}% Remaining</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-4 w-full rounded-lg border border-white/15 bg-white/5 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-white/10"
                    >
                      Inspect Squad Roster ({t.playerCount}) →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === "archive" ? (
          /* ======================================================== */
          /* 3. SOLD & UNSOLD PLAYER ARCHIVE                           */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#031827] p-4">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <FaTrophy className="text-[#d4a84f]" />
                  AUCTION PLAYER ARCHIVE ({auctionedPlayers.length} Auctioned)
                </h3>
                <p className="text-xs text-[#8b979d]">
                  Complete list of players that have gone under the hammer in this tournament.
                </p>
              </div>

              {/* ARCHIVE FILTERS */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-xs text-[#aeb9bf]">
                  <FaMagnifyingGlass />
                  <input
                    className="w-40 sm:w-56 bg-transparent text-white outline-none placeholder:text-[#7c8790]"
                    placeholder="Search player or team..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                  />
                </div>

                <select
                  className="rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                  value={archiveStatus}
                  onChange={(e) => setArchiveStatus(e.target.value)}
                >
                  <option value="all">All Outcomes</option>
                  <option value="sold">Sold Only</option>
                  <option value="unsold">Unsold Only</option>
                </select>
              </div>
            </div>

            {/* ARCHIVE TABLE */}
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#031827] p-2">
              {filteredArchive.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#7c8790]">
                  No auctioned players match your filters yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-[#8b979d]">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Player</th>
                      <th className="px-3 py-2.5">Student ID</th>
                      <th className="px-3 py-2.5">Category</th>
                      <th className="px-3 py-2.5">Tier</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Winning Team</th>
                      <th className="px-3 py-2.5 text-right">Sold Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredArchive.map((p, idx) => (
                      <tr key={p._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-2.5 text-[#8b979d]">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {p.photoUrl ? (
                              <img
                                src={p.photoUrl}
                                alt={p.fullName}
                                className="size-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="grid size-7 place-items-center rounded-full bg-white/10 text-[9px] font-bold">
                                {p.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="font-bold text-white">{p.fullName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[#8b979d]">{p.playerId}</td>
                        <td className="px-3 py-2.5">
                          <span className="rounded bg-[#76511d] px-2 py-0.5 text-[10px] font-bold text-[#f2d590]">
                            {(p.categories || []).join(", ")}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-[#8b979d]">{p.auctionTier?.name || p.tier || "—"}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              p.auctionStatus === "sold"
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-950/80 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {p.auctionStatus}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-white">
                          {p.team?.name || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold text-[#d4a84f]">
                          {p.soldPrice ? `৳ ${p.soldPrice.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 4. AUCTION ANALYTICS VIEW                                 */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                <p className="text-xs font-bold uppercase text-[#8b979d]">Total Points Spent</p>
                <p className="mt-1 text-3xl font-black text-[#d4a84f] font-mono">
                  ৳ {stats.totalSpend?.toLocaleString() || 0}
                </p>
                <p className="text-[11px] text-[#7c8790] mt-0.5">Across all teams</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                <p className="text-xs font-bold uppercase text-[#8b979d]">Players Sold / Unsold</p>
                <p className="mt-1 text-3xl font-black text-white font-mono">
                  <span className="text-emerald-400">{stats.totalSold || 0}</span>
                  <span className="text-[#7c8790] text-xl"> / </span>
                  <span className="text-red-400">{stats.totalUnsold || 0}</span>
                </p>
                <p className="text-[11px] text-[#7c8790] mt-0.5">Sold vs Unsold</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                <p className="text-xs font-bold uppercase text-[#8b979d]">Highest Bid of Tournament</p>
                <p className="mt-1 text-3xl font-black text-[#f2d590] font-mono">
                  ৳ {stats.highestBid?.toLocaleString() || 0}
                </p>
                <p className="text-[11px] text-[#7c8790] mt-0.5 truncate">
                  {stats.highestBidPlayer ? `${stats.highestBidPlayer.name} (${stats.highestBidPlayer.teamName})` : "None yet"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#031827] p-5 shadow-lg">
                <p className="text-xs font-bold uppercase text-[#8b979d]">Average Player Value</p>
                <p className="mt-1 text-3xl font-black text-white font-mono">
                  ৳ {stats.averagePrice?.toLocaleString() || 0}
                </p>
                <p className="text-[11px] text-[#7c8790] mt-0.5">Per sold player</p>
              </div>
            </div>

            {/* HIGHEST VALUED PLAYER SHOWCASE */}
            {stats.highestBidPlayer && (
              <div className="rounded-2xl border border-[#d4a84f]/40 bg-gradient-to-r from-[#031827] to-[#02121f] p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {stats.highestBidPlayer.photoUrl ? (
                    <img
                      src={stats.highestBidPlayer.photoUrl}
                      alt={stats.highestBidPlayer.name}
                      className="size-16 rounded-xl border-2 border-[#d4a84f] object-cover"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-xl bg-white/10 text-2xl font-bold text-[#d4a84f]">
                      <FaTrophy />
                    </div>
                  )}
                  <div>
                    <span className="rounded bg-[#d4a84f] px-2 py-0.5 text-[10px] font-black uppercase text-black">
                      TOP TOURNAMENT SIGNING
                    </span>
                    <h4 className="text-xl font-black text-white mt-1">
                      {stats.highestBidPlayer.name}
                    </h4>
                    <p className="text-xs text-[#8b979d]">
                      Category: {stats.highestBidPlayer.category} • Team:{" "}
                      <b className="text-white">{stats.highestBidPlayer.teamName}</b>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase text-[#8b979d] font-bold block">
                    Record Winning Bid
                  </span>
                  <span className="text-3xl font-black text-[#d4a84f] font-mono">
                    ৳ {stats.highestBidPlayer.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* SQUAD ROSTER INSPECTOR MODAL */}
      {inspectSquadTeam && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setInspectSquadTeam(null)}
        >
          <div
            className="w-full max-w-[620px] rounded-2xl border border-white/20 bg-[#031827] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <FaShieldHalved className="text-[#d4a84f]" />
                  {inspectSquadTeam.name} Squad Roster
                </h3>
                <p className="text-xs text-[#8b979d] mt-0.5">
                  Remaining Purse:{" "}
                  <b className="text-[#d4a84f]">
                    ৳ {inspectSquadTeam.pointsRemaining?.toLocaleString()}
                  </b>{" "}
                  • Spent: ৳ {inspectSquadTeam.pointsSpent?.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectSquadTeam(null)}
                className="text-[#9faab2] hover:text-white"
              >
                <FaXmark className="text-lg" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
              {(inspectSquadTeam.players || []).length === 0 ? (
                <div className="py-10 text-center text-xs text-[#7c8790]">
                  No players acquired by {inspectSquadTeam.name} yet.
                </div>
              ) : (
                inspectSquadTeam.players.map((p, i) => (
                  <div
                    key={p._id || i}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-[#02121f] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded bg-white/10 text-[10px] font-bold">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">{p.fullName}</p>
                        <p className="text-[10px] text-[#8b979d]">
                          ID: {p.playerId} • {p.categories?.join(", ")}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-[#d4a84f] text-sm">
                        ৳ {p.soldPrice?.toLocaleString() || "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TEAM LOGIN MODAL */}
      {showTeamModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowTeamModal(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl border border-white/20 bg-[#031827] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FaLock className="text-[#d4a84f]" />
                Team Bidding Authentication
              </h3>
              <button
                type="button"
                onClick={() => setShowTeamModal(false)}
                className="text-[#9faab2] hover:text-white"
              >
                <FaXmark />
              </button>
            </div>

            <p className="text-xs text-[#9faab2] mb-4">
              Enter your team&apos;s unique 6-character registration key to bid with your 50,000 points budget.
            </p>

            {loginError && (
              <div className="mb-3 rounded-lg border border-red-500/50 bg-red-950/70 p-2.5 text-xs text-red-200">
                {loginError}
              </div>
            )}

            <form onSubmit={handleTeamLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8b979d] mb-1 uppercase tracking-wider">
                  Team Unique Key
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2.5 font-mono text-base uppercase tracking-widest text-white outline-none focus:border-[#d4a84f]"
                  placeholder="e.g. K9X2P1"
                  value={teamKeyInput}
                  onChange={(e) => setTeamKeyInput(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold text-[#ccd4d8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#b8872f] px-5 py-2 text-xs font-black uppercase text-black hover:brightness-110 shadow-lg"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAuctionArena;
