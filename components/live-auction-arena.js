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
  FaCompress,
  FaExpand,
  FaCheck,
  FaXmark,
  FaCoins,
  FaTrophy,
} from "react-icons/fa6";
import SiteNavbar from "./site-navbar";
import TeamCrest from "./team-crest";
import AuctionRoundStamp from "./auction-round-stamp";
import CountdownCard from "./countdown-card";
import { calculateNextBid, getBidIncrement } from "../lib/auctionRules";

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

// Real-time Purchased Squad Section for Authenticated Team
function TeamPurchasedSquadSection({ team, players, title = null }) {
  if (!team) return null;

  return (
    <div id="my-purchased-squad" className="mb-8 w-full">
      <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0e1628]/95 via-[#0a101f]/90 to-[#060a14]/95 p-4 sm:p-6 lg:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        {/* Ambient Glow */}
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 size-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <TeamCrest
              name={team.name}
              logoUrl={team.logoUrl}
              className="size-11 sm:size-13 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="font-sans font-black text-base sm:text-xl text-white uppercase tracking-wide">
                  {title || `${team.name} — PURCHASED SQUAD`}
                </h2>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Official Roster • Real-time player acquisitions automatically added after every purchase
              </p>
            </div>
          </div>

          {/* Summary Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-center min-w-[70px]">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Players</span>
              <strong className="text-xs sm:text-sm font-black text-white font-mono">
                {players.length}
              </strong>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-1.5 text-center min-w-[85px]">
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Points Spent</span>
              <strong className="text-xs sm:text-sm font-black text-amber-400 font-mono">
                {(team.pointsSpent || 0).toLocaleString()} PTS
              </strong>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-center min-w-[85px]">
              <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Purse Left</span>
              <strong className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
                {(team.pointsRemaining || 0).toLocaleString()} PTS
              </strong>
            </div>
          </div>
        </div>

        {/* Purchased Players Grid */}
        {players.length > 0 ? (
          <div className="relative z-10 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {players.map((player, idx) => (
              <div
                key={player._id || player.playerId || idx}
                className="group relative rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#111c33]/90 to-[#091020]/90 p-3 sm:p-3.5 flex flex-col justify-between hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 shadow-lg"
              >
                {/* Top card bar: index badge & tier */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black uppercase text-amber-300 font-mono flex items-center gap-1">
                    <FaCheck className="text-[8px] text-emerald-400" />
                    #{idx + 1} ACQUIRED
                  </span>
                  {player.tier && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[9px] font-bold text-slate-300 uppercase font-mono">
                      {player.tier}
                    </span>
                  )}
                </div>

                {/* Middle: Player photo & details */}
                <div className="flex items-center gap-3 my-1">
                  {/* Player Photo */}
                  <div className="relative size-14 sm:size-16 rounded-xl overflow-hidden border border-amber-500/40 bg-[#060a14] shrink-0 shadow">
                    {player.photoUrl ? (
                      <Image
                        src={player.photoUrl}
                        alt={player.fullName}
                        fill
                        unoptimized
                        className="object-cover object-top group-hover:scale-105 transition-transform"
                        sizes="64px"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-amber-500/10 text-amber-400 text-sm font-black">
                        {player.fullName?.slice(0, 2).toUpperCase() || "PL"}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-sans font-black text-xs sm:text-sm text-white uppercase truncate group-hover:text-amber-300 transition-colors">
                      {player.fullName}
                    </h4>
                    <p className="text-[10px] text-amber-400 font-semibold truncate mt-0.5">
                      {player.playingRole || (Array.isArray(player.categories) ? player.categories[0] : player.category) || "Player"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">
                      ID: <span className="text-slate-200">{player.playerId || "—"}</span>
                      {player.session ? ` • ${player.session}` : ""}
                    </p>
                  </div>
                </div>

                {/* Bottom: Purchase price tag */}
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">PURCHASE PRICE:</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-amber-400 flex items-center gap-1 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                    <FaGavel className="text-[10px]" />
                    ৳ {Number(player.soldPrice || 0).toLocaleString()} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="relative z-10 py-10 text-center flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="size-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl mb-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <FaUserGroup />
            </div>
            <h3 className="font-sans font-black text-sm sm:text-base text-white uppercase tracking-wide">
              NO PLAYERS PURCHASED YET
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Your winning bids will automatically appear here immediately after the hammer falls. Bid on players on stage to build your championship squad!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiveAuctionArena() {
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

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
  const [inspectTeamSquad, setInspectTeamSquad] = useState(null);
  const [newlyPurchasedPlayer, setNewlyPurchasedPlayer] = useState(null);

  const prevBidRef = useRef(0);
  const prevPurchasedCountRef = useRef(null);

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
      }
    } catch (err) {
      console.error("Auction state fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [isMuted]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchState();
    }, 0);
    const interval = setInterval(fetchState, 1500);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchState]);

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
      category: p.category || (p.categories && p.categories[0]) || state.category || "Cricket",
      playerId: p.playerId || "—",
      registrationNumber: p.registrationNumber || null,
      batsman: p.batsman || "RHB",
      bowler: p.bowler || "RAM",
      session: p.session || "—",
      lastMatch: p.session ? `Session: ${p.session}` : "—",
      basePrice: state.tierBasePrice || p.basePrice || 0,
      currentBid: state.currentBid || state.tierBasePrice || p.basePrice || 0,
      currentBidderTeamName: state.currentBidderTeamName || null,
      currentBidderTeamLogo: state.currentBidderTeamLogo || null,
      soldToTeamName: state.soldToTeamName || p.soldToTeamName || null,
      soldToTeamLogo: state.soldToTeamLogo || p.soldToTeamLogo || null,
      status: state.hammerStatus ? state.hammerStatus.replace("_", " ").toUpperCase() : "BIDDING OPEN",
      tier: state.tierName || p.tier || "Tier",
    };
  }, [isAuctionActive, state]);

  // Upcoming players queue (ONLY REAL DATA FROM DB - hidden in view per requirement)
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
        pointsRemaining: t.pointsRemaining ?? 10000,
        pointsSpent: t.pointsSpent ?? 0,
        playerCount: t.playerCount || (t.players ? t.players.length : 0),
        players: t.players || [],
        ...theme,
      };
    });
  }, [auctionData]);

  // Live authenticated team synchronized with real-time auction polling
  const liveBiddingTeam = useMemo(() => {
    if (!biddingTeam) return null;
    const found = (auctionData?.teams || []).find(
      (t) => t._id?.toString() === biddingTeam._id?.toString()
    );
    if (found) {
      return {
        ...biddingTeam,
        ...found,
        playerCount: found.playerCount || (found.players ? found.players.length : 0),
        players: found.players || [],
        pointsRemaining: found.pointsRemaining,
        pointsSpent: found.pointsSpent,
      };
    }
    return biddingTeam;
  }, [biddingTeam, auctionData]);

  // Real-time purchased squad for the logged-in team (with optimistic active tier inclusion)
  const myPurchasedPlayers = useMemo(() => {
    if (!liveBiddingTeam) return [];
    const list = [...(liveBiddingTeam.players || [])];
    const existingIds = new Set(
      list.map((p) => p._id?.toString() || p.id?.toString() || p.playerId).filter(Boolean)
    );

    // If active player was just marked sold to this team, ensure immediate appearance
    if (
      activePlayer &&
      (state.hammerStatus || "").toLowerCase() === "sold" &&
      state.currentBidderTeam &&
      (state.currentBidderTeam === liveBiddingTeam._id ||
        state.currentBidderTeam.toString() === liveBiddingTeam._id?.toString())
    ) {
      const activeId = activePlayer.playerId || state.players?.[state.currentPlayerIndex]?.player;
      if (activeId && !existingIds.has(activeId?.toString())) {
        list.push({
          _id: activeId,
          fullName: activePlayer.fullName,
          photoUrl: activePlayer.photoUrl,
          categories: [activePlayer.category].filter(Boolean),
          playingRole: activePlayer.role,
          soldPrice: state.currentBid || activePlayer.currentBid,
          playerId: activePlayer.playerId,
          session: activePlayer.session,
          registrationNumber: activePlayer.registrationNumber,
          tier: activePlayer.tier,
        });
      }
    }
    return list;
  }, [liveBiddingTeam, activePlayer, state]);

  // Trigger celebration banner when newly purchased player is added
  useEffect(() => {
    if (!liveBiddingTeam) return;
    const currentCount = myPurchasedPlayers.length;
    if (prevPurchasedCountRef.current !== null && currentCount > prevPurchasedCountRef.current) {
      const lastPlayer = myPurchasedPlayers[myPurchasedPlayers.length - 1];
      if (lastPlayer) {
        const timer = setTimeout(() => {
          setNewlyPurchasedPlayer(lastPlayer);
          playAudioEffect("bid", isMuted);
        }, 0);
        const hideTimer = setTimeout(() => {
          setNewlyPurchasedPlayer(null);
        }, 7000);
        return () => {
          clearTimeout(timer);
          clearTimeout(hideTimer);
        };
      }
    }
    prevPurchasedCountRef.current = currentCount;
  }, [myPurchasedPlayers, liveBiddingTeam, isMuted]);

  // Winning or leading team details with robust fallback to teamsList
  const winningOrLeadingTeam = useMemo(() => {
    const isSold = (state.hammerStatus || "").toLowerCase() === "sold";
    const teamName = isSold
      ? (activePlayer?.soldToTeamName || activePlayer?.currentBidderTeamName || state.currentBidderTeamName)
      : (activePlayer?.currentBidderTeamName || state.currentBidderTeamName);
    if (!teamName) return null;
    const teamObj = teamsList.find(
      (t) => t.name?.toLowerCase() === teamName.toLowerCase()
    );
    return {
      name: teamName,
      logoUrl:
        teamObj?.logoUrl ||
        (isSold
          ? (activePlayer?.soldToTeamLogo || state.currentBidderTeamLogo)
          : (activePlayer?.currentBidderTeamLogo || state.currentBidderTeamLogo)),
    };
  }, [state, activePlayer, teamsList]);

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
    if (!liveBiddingTeam) {
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
          teamId: liveBiddingTeam._id,
          uniqueKey: liveBiddingTeam.uniqueKey,
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

  // Calculations for next bid amount & status
  const nextBidAmount = useMemo(() => {
    if (!activePlayer) return 0;
    let basePrice = state.tierBasePrice || activePlayer.basePrice || 500;
    if (state.currentPlayerIndex === 4 && state.fifthPlayerCalculatedBasePrice) {
      basePrice = state.fifthPlayerCalculatedBasePrice;
    }
    if (!state.currentBidderTeam || state.currentBid <= 0) {
      return basePrice;
    }
    return calculateNextBid(state.currentBid, basePrice);
  }, [activePlayer, state]);

  const isOpeningBid = !state.currentBidderTeam || state.currentBid <= 0;

  const isHighestBidder = Boolean(
    liveBiddingTeam &&
    state.currentBidderTeam &&
    (state.currentBidderTeam === liveBiddingTeam._id || state.currentBidderTeam.toString() === liveBiddingTeam._id?.toString())
  );

  const isTeamTierQuotaReached = useMemo(() => {
    if (!liveBiddingTeam || !Array.isArray(state.players)) return false;
    return state.players.some(
      (p) =>
        p.status === "sold" &&
        p.soldToTeam &&
        (p.soldToTeam === liveBiddingTeam._id || p.soldToTeam.toString() === liveBiddingTeam._id?.toString())
    );
  }, [liveBiddingTeam, state.players]);

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
              {liveBiddingTeam ? (
                <div className="flex items-center gap-2 sm:gap-2.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-md">
                  <TeamCrest name={liveBiddingTeam.name} logoUrl={liveBiddingTeam.logoUrl} className="size-6 shrink-0" />
                  <span className="truncate max-w-[130px] font-extrabold">{liveBiddingTeam.name}</span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-black text-amber-300">
                    {myPurchasedPlayers.length} {myPurchasedPlayers.length === 1 ? "player" : "players"}
                  </span>
                  <button
                    onClick={handleLogoutTeam}
                    className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer transition-colors"
                    title="Logout Team"
                  >
                    <FaRightFromBracket className="text-[11px]" />
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
            <div className="relative size-20 sm:size-24 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(245,158,11,0.35)]">
              <div className="pointer-events-none absolute -inset-3 rounded-3xl border border-amber-400/30 animate-crest-wave" />
              <FaGavel className="text-3xl sm:text-4xl text-amber-400 animate-gavel-strike filter drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
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

            {/* Countdown Clock to 5:30 PM BD Time with Fullscreen Capability */}
            <div className="w-full max-w-xl mx-auto mb-6 text-left">
              <CountdownCard className="w-full" />
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#0C1527]/80 px-4 py-2 text-xs font-mono text-slate-400 backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Broadcast receiver listening • Updates in real-time</span>
            </div>
          </div>

          {/* Real-time Purchased Squad for Authenticated Team on Standby Screen */}
          {liveBiddingTeam && (
            <div className="mt-4 mb-2">
              <TeamPurchasedSquadSection
                team={liveBiddingTeam}
                players={myPurchasedPlayers}
                title={`${liveBiddingTeam.name} — MY PURCHASED SQUAD`}
              />
            </div>
          )}

          {/* Teams Registered (Only shows real teams if admin has added them) */}
          <div className="mt-10 mb-8 w-full">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 flex items-center gap-2.5">
                <span className="size-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span>PARTICIPATING TEAMS &amp; PURSES {teamsList.length > 0 && `(${teamsList.length})`}</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Official Franchise Squads • Click team to view squad</span>
            </div>

            {teamsList.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                {teamsList.map((team, idx) => (
                  <div
                    key={team._id || idx}
                    onClick={() => setInspectTeamSquad(team)}
                    className={`relative rounded-3xl border-2 ${team.borderClass} bg-gradient-to-b ${team.cardBg} p-5 sm:p-6 text-center backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between min-h-[240px] sm:min-h-[270px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)] group cursor-pointer`}
                    title="Click to view team's purchased squad"
                  >
                    {/* Team Icon in large circle */}
                    <div className="my-2 group-hover:scale-105 transition-transform duration-300">
                      <TeamCrest name={team.name} logoUrl={team.logoUrl} className="size-20 sm:size-24 md:size-28" />
                    </div>

                    {/* Team Name - Larger & bold typography */}
                    <div className="w-full my-1">
                      <h3 className="font-sans font-black text-sm sm:text-base md:text-lg text-white uppercase tracking-tight leading-snug text-center drop-shadow-md truncate">
                        {team.name}
                      </h3>
                      <span className="inline-block mt-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                        {team.playerCount || (team.players ? team.players.length : 0)} Players • View Roster ➔
                      </span>
                    </div>

                    {/* Purse Section */}
                    <div className="mt-3.5 w-full pt-3 border-t border-white/10">
                      <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
                        REMAINING PURSES
                      </span>
                      <span className="block font-mono text-sm sm:text-base md:text-lg font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)] mt-0.5">
                        {team.pointsRemaining?.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-10 text-center text-xs text-slate-500 italic">
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
              {liveBiddingTeam ? (
                <div className="flex items-center gap-2 sm:gap-2.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-amber-300 shadow-md">
                  <TeamCrest name={liveBiddingTeam.name} logoUrl={liveBiddingTeam.logoUrl} className="size-6 shrink-0" />
                  <span className="truncate max-w-[130px] font-extrabold">{liveBiddingTeam.name}</span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-mono font-black text-amber-300">
                    {myPurchasedPlayers.length} {myPurchasedPlayers.length === 1 ? "player" : "players"}
                  </span>
                  <button
                    onClick={handleLogoutTeam}
                    className="text-slate-400 hover:text-rose-400 ml-0.5 cursor-pointer transition-colors"
                    title="Logout Team"
                  >
                    <FaRightFromBracket className="text-[11px]" />
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

          {/* Celebratory Banner on Newly Purchased Player */}
          {newlyPurchasedPlayer && (
            <div className="mb-5 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-black p-4 sm:p-5 shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-11 sm:size-13 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl sm:text-3xl text-emerald-300 shrink-0">
                  🎉
                </div>
                <div>
                  <span className="inline-block rounded bg-emerald-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-black font-mono">
                    NEW PLAYER PURCHASED &amp; ADDED TO SQUAD!
                  </span>
                  <h4 className="text-base sm:text-xl font-black uppercase text-white mt-0.5">
                    {newlyPurchasedPlayer.fullName} is now in your roster!
                  </h4>
                  <p className="text-xs text-emerald-300 font-mono">
                    Winning Bid: <strong className="text-white">৳ {Number(newlyPurchasedPlayer.soldPrice || 0).toLocaleString()} PTS</strong> • Added to your squad
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewlyPurchasedPlayer(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* MAIN BROADCAST ARENA: 3-COLUMN MODERN BROADCAST LAYOUT   */}
          {/* LEFT: PLAYER IDENTITY & LIVE BID HISTORY                 */}
          {/* MIDDLE: PLAYER IMAGE (COVERING 30% OF SCREEN)            */}
          {/* RIGHT: CATEGORY, BOUGHT BY LOGO, CONTROLS & TEAM PURSES  */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-6 sm:mb-8 items-start">
            
            {/* 1. LEFT PANEL: CURRENT PLAYER DETAILS & LIVE BID HISTORY */}
            <div className="lg:col-span-4 flex flex-col space-y-4 sm:space-y-5">
              
              {/* Player Details Card */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    CURRENT PLAYER DETAILS
                  </span>
                  {activePlayer?.tier && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                      {activePlayer.tier}
                    </span>
                  )}
                </div>

                {activePlayer ? (
                  <div className="space-y-3">
                    <div>
                      <h1 className="font-sans font-black text-xl sm:text-2xl xl:text-3xl text-white uppercase tracking-tight leading-tight drop-shadow-md">
                        {activePlayer.fullName}
                      </h1>
                      <p className="text-xs sm:text-sm font-semibold text-amber-300 mt-0.5">
                        {activePlayer.role || activePlayer.category}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Batsman</span>
                        <strong className="text-white font-extrabold">{activePlayer.batsman}</strong>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Bowler</span>
                        <strong className="text-white font-extrabold">{activePlayer.bowler}</strong>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Session</span>
                        <strong className="text-white font-extrabold">{activePlayer.session}</strong>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                        <span className="block text-[10px] text-slate-400 uppercase font-bold">Student ID</span>
                        <strong className="text-white font-mono font-extrabold">{activePlayer.playerId}</strong>
                      </div>
                    </div>

                    {activePlayer.registrationNumber && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        Registration No: <span className="text-white font-bold">{activePlayer.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 italic">
                    Waiting for player to take the stage...
                  </div>
                )}
              </div>

              {/* Live Bid History Card */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <FaGavel className="text-amber-400 text-xs" />
                    LIVE BID HISTORY
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Recent Bids</span>
                </div>

                {bidHistory.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {bidHistory.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                          <span className="truncate text-slate-200">
                            <strong className="text-amber-400 font-bold">{item.teamName}</strong> bid{" "}
                            <span className="text-white font-bold font-mono">{item.amount?.toLocaleString()} PTS</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
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

            </div>

            {/* 2. MIDDLE PANEL: PLAYER IMAGE (COVERING 30% OF SCREEN) */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-full relative rounded-2xl sm:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0c1626]/95 via-[#080f1c]/90 to-[#040810]/95 p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center">
                
                {/* Stadium atmospheric glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-sky-500/15 to-amber-500/20 blur-xl opacity-75 pointer-events-none" />

                {/* Floating Status Pill */}
                <div className="relative z-10 mb-3 flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-[#140e04]/90 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                    <span>{activePlayer ? activePlayer.status : "ON STAGE"}</span>
                  </div>
                </div>

                {/* Hero Cutout Portrait covering 30% of screen */}
                <div className="relative z-10 w-full aspect-[3/4] max-h-[460px] sm:max-h-[500px] rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-[#060a14] shadow-[0_15px_35px_rgba(0,0,0,0.85)] group flex items-center justify-center">
                  {activePlayer?.photoUrl ? (
                    <Image
                      src={activePlayer.photoUrl}
                      alt={activePlayer.fullName}
                      fill
                      priority
                      unoptimized
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 30vw"
                    />
                  ) : (
                    <div className="size-full flex flex-col items-center justify-center bg-gradient-to-b from-[#151c2e] to-[#080d19] text-amber-400 p-6">
                      <div className="size-24 rounded-full bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-4xl font-black mb-3 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                        {activePlayer?.fullName ? activePlayer.fullName.slice(0, 2).toUpperCase() : "PL"}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        OFFICIAL ATHLETE
                      </span>
                    </div>
                  )}

                  {/* Round Stamp Overlay for SOLD / UNSOLD */}
                  {["sold", "unsold"].includes((state.hammerStatus || "").toLowerCase()) && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-none">
                      <AuctionRoundStamp
                        status={state.hammerStatus}
                        size="responsive"
                        price={state.hammerStatus === "sold" ? (state.currentBid || activePlayer?.currentBid) : null}
                      />
                    </div>
                  )}

                  {/* Bottom subtle gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Player quick badge below image */}
                {activePlayer && (
                  <div className="relative z-10 mt-3 text-center">
                    <h3 className="font-sans font-black text-sm text-white uppercase tracking-wide truncate max-w-[280px]">
                      {activePlayer.fullName}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                      ID: <span className="text-white">{activePlayer.playerId}</span> • SESSION: <span className="text-white">{activePlayer.session}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. RIGHT PANEL: RIGHT TO PLAYER (CATEGORY & BOUGHT BY TEAM LOGO + CONTROLS) & TEAM REMAINING BALANCES */}
            <div className="lg:col-span-4 flex flex-col space-y-4 sm:space-y-5">
              
              {/* Card 1: Category, Bought by Team Logo & Bidding Details */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                
                {/* Category & Tier row */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CATEGORY:</span>
                    <span className="rounded-lg bg-amber-500/20 border border-amber-500/50 px-2.5 py-0.5 text-xs font-black text-amber-300 uppercase tracking-wide">
                      {activePlayer?.category || activePlayer?.role || "Cricket"}
                    </span>
                  </div>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase font-mono">
                    {activePlayer?.tier || "Tier"}
                  </span>
                </div>

                {/* Player Bought by Team Logo */}
                {state.hammerStatus === "sold" ? (
                  <div className="my-3 flex items-center gap-3.5 rounded-2xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-950/70 via-emerald-900/50 to-black p-3.5 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
                    <TeamCrest
                      name={winningOrLeadingTeam?.name || "Winning Team"}
                      logoUrl={winningOrLeadingTeam?.logoUrl}
                      className="size-14 sm:size-16 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="inline-block rounded bg-emerald-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black font-mono">
                        🏆 SOLD / BOUGHT BY
                      </span>
                      <h4 className="text-base sm:text-lg font-black uppercase text-white truncate drop-shadow mt-0.5">
                        {winningOrLeadingTeam?.name || "WINNING SQUAD"}
                      </h4>
                      <p className="font-mono text-xs sm:text-sm font-black text-amber-400">
                        ৳ {(state.currentBid || activePlayer?.currentBid || 0).toLocaleString()} PTS
                      </p>
                    </div>
                  </div>
                ) : winningOrLeadingTeam?.name ? (
                  <div className="my-3 flex items-center gap-3 rounded-2xl border border-amber-500/40 bg-white/5 p-3 shadow-inner">
                    <TeamCrest
                      name={winningOrLeadingTeam.name}
                      logoUrl={winningOrLeadingTeam.logoUrl}
                      className="size-11 sm:size-12 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="block text-[9px] font-black uppercase tracking-wider text-amber-400">
                        🔥 LEADING BIDDER
                      </span>
                      <h4 className="text-sm sm:text-base font-black uppercase text-white truncate">
                        {winningOrLeadingTeam.name}
                      </h4>
                    </div>
                  </div>
                ) : (
                  <div className="my-3 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-2.5 text-center text-xs text-slate-400 italic">
                    Waiting for Opening Bid
                  </div>
                )}

                {/* Base Price & Current Bid (Timing Cancelled) */}
                <div className="grid grid-cols-2 gap-3 my-2.5 p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      BASE PRICE
                    </span>
                    <strong className="block font-mono text-sm sm:text-base font-bold text-slate-200 mt-0.5">
                      {activePlayer?.basePrice?.toLocaleString()} PTS
                    </strong>
                  </div>
                  <div className="border-l border-white/10 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        CURRENT BID
                      </span>
                      {state.currentBid > 0 && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/40 rounded px-1.5 py-0.5">
                          +৳ {getBidIncrement(state.currentBid).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <strong className="block font-mono text-xl sm:text-2xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] mt-0.5 leading-none">
                      {activePlayer?.currentBid?.toLocaleString()} PTS
                    </strong>
                  </div>
                </div>

                {/* Bidding Control Bar */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  {biddingTeam ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Team: <b className="text-amber-400">{biddingTeam.name}</b>
                        </span>
                        <span className="text-white font-mono font-bold">
                          Purse: {biddingTeam.pointsRemaining?.toLocaleString() || "10,000"} PTS
                        </span>
                      </div>

                      {isTeamTierQuotaReached ? (
                        <div className="rounded-xl border border-amber-500/40 bg-amber-500/15 p-2 text-center text-xs font-bold text-amber-300">
                          🔒 Tier Quota Reached (Wait for next tier)
                        </div>
                      ) : isHighestBidder ? (
                        <button
                          type="button"
                          disabled
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/70 py-2.5 text-xs font-bold text-emerald-300 shadow cursor-not-allowed"
                        >
                          <span className="size-2 rounded-full bg-emerald-400 animate-ping mr-1" />
                          <span>Highest Bidder ({state.currentBid?.toLocaleString()} PTS)</span>
                        </button>
                      ) : isOpeningBid ? (
                        <button
                          type="button"
                          onClick={handlePlaceBid}
                          disabled={isSubmittingBid}
                          className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                        >
                          <FaGavel className="text-xs" />
                          <span>{isSubmittingBid ? "Starting..." : `Start Bidding (${nextBidAmount?.toLocaleString()} PTS)`}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePlaceBid}
                          disabled={isSubmittingBid}
                          className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 py-2.5 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
                        >
                          <FaGavel className="text-xs" />
                          <span>{isSubmittingBid ? "Bidding..." : `Place Next Bid (${nextBidAmount?.toLocaleString()} PTS)`}</span>
                        </button>
                      )}
                      {/* Quick Squad Peek */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 mt-1">
                        <span>Squad: <strong className="text-white font-mono">{myPurchasedPlayers.length}</strong> {myPurchasedPlayers.length === 1 ? "player" : "players"} bought</span>
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById("my-purchased-squad");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-amber-400 hover:text-white font-bold underline cursor-pointer"
                        >
                          View My Players ➔
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Team manager? Login to bid:</span>
                      <button
                        type="button"
                        onClick={() => setShowTeamModal(true)}
                        className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0A0F1D] shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-105 active:scale-95 transition-all"
                      >
                        <FaKey className="text-xs" />
                        <span>Team Login to Bid</span>
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

              {/* Card 2: Team Remaining Balances */}
              <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626]/90 via-[#0a1220]/85 to-[#070d18]/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/10">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>TEAM REMAINING PURSES {teamsList.length > 0 && `(${teamsList.length})`}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Live Balances • Click to View Squad</span>
                </div>

                {teamsList.length > 0 ? (
                  <div className="space-y-2">
                    {teamsList.map((team, idx) => {
                      const isMyTeam = liveBiddingTeam && (liveBiddingTeam._id === team._id || liveBiddingTeam._id?.toString() === team._id?.toString());
                      return (
                        <div
                          key={team._id || idx}
                          onClick={() => setInspectTeamSquad(team)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border ${team.borderClass || "border-white/10"} ${isMyTeam ? "ring-2 ring-amber-400/60 bg-amber-500/10" : `bg-gradient-to-r ${team.cardBg || "from-[#0a1220] to-[#050914]"}`} hover:border-amber-500/60 transition-all shadow-sm cursor-pointer group`}
                          title="Click to view team's purchased squad"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <TeamCrest name={team.name} logoUrl={team.logoUrl} className="size-8 shrink-0 group-hover:scale-105 transition-transform" />
                            <div className="min-w-0">
                              <span className="font-extrabold text-xs text-white uppercase truncate flex items-center gap-1.5 leading-tight">
                                {team.name}
                                {isMyTeam && (
                                  <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-1 rounded">YOU</span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5 group-hover:text-amber-300 transition-colors">
                                {team.playerCount || (team.players ? team.players.length : 0)} players bought • View squad ➔
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="block font-mono text-xs sm:text-sm font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                              {team.pointsRemaining?.toLocaleString()} PTS
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    No teams registered yet.
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ======================================================== */}
          {/* SECTION: TEAM'S PURCHASED SQUAD (DYNAMIC ROSTER)          */}
          {/* ======================================================== */}
          {liveBiddingTeam && (
            <TeamPurchasedSquadSection
              team={liveBiddingTeam}
              players={myPurchasedPlayers}
              title={`${liveBiddingTeam.name} — MY PURCHASED SQUAD`}
            />
          )}

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

      {/* Inspect Team Squad Modal */}
      {inspectTeamSquad && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setInspectTeamSquad(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-amber-500/40 bg-[#0A0F1D] p-5 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <TeamCrest name={inspectTeamSquad.name} logoUrl={inspectTeamSquad.logoUrl} className="size-10 sm:size-12 shrink-0" />
                <div>
                  <h3 className="font-sans font-black text-base sm:text-xl text-white uppercase tracking-wide">
                    {inspectTeamSquad.name} — SQUAD ROSTER
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Purse Left: <strong className="text-emerald-400">{inspectTeamSquad.pointsRemaining?.toLocaleString()} PTS</strong> • Spent: <strong className="text-amber-400">{(inspectTeamSquad.pointsSpent || 0).toLocaleString()} PTS</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectTeamSquad(null)}
                className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <FaXmark className="text-sm" />
              </button>
            </div>

            {/* Players List in Modal */}
            <div className="flex-1 overflow-y-auto my-4 pr-1">
              {(inspectTeamSquad.players || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inspectTeamSquad.players.map((p, idx) => (
                    <div key={p._id || idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3 hover:border-amber-500/40 transition-colors">
                      <div className="relative size-14 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                        {p.photoUrl ? (
                          <Image src={p.photoUrl} alt={p.fullName} fill unoptimized className="object-cover object-top" sizes="56px" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-xs font-bold text-amber-400 bg-amber-500/10">
                            {p.fullName?.slice(0, 2).toUpperCase() || "PL"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-black text-amber-400 font-mono uppercase">#{idx + 1} ACQUIRED</span>
                        <h4 className="font-sans font-black text-xs sm:text-sm text-white uppercase truncate">{p.fullName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {p.playingRole || (Array.isArray(p.categories) ? p.categories[0] : p.category) || "Player"}
                        </p>
                        <p className="text-xs font-mono font-black text-amber-400 mt-1">
                          ৳ {Number(p.soldPrice || 0).toLocaleString()} PTS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  This team has not acquired any players yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 text-right">
              <button
                type="button"
                onClick={() => setInspectTeamSquad(null)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold text-white hover:bg-white/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
