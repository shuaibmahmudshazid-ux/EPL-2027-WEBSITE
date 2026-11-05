"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  FaCheck,
  FaCoins,
  FaForward,
  FaGavel,
  FaLayerGroup,
  FaPause,
  FaPlay,
  FaRotateLeft,
  FaRotateRight,
  FaStop,
  FaStopwatch,
  FaTrophy,
  FaUsers,
  FaXmark,
  FaCompress,
  FaExpand,
} from "react-icons/fa6";
import PlayerStageRevealCard from "./player-stage-reveal-card";
import AdjustCoinsModal from "./admin-adjust-coins-modal";
import { getBidIncrement } from "../lib/auctionRules";

const safeParse = async (response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const hammerColors = {
  waiting: "bg-white/10 text-[#9faab2]",
  bidding_open: "bg-[#76511d] text-[#f2d590] border-amber-500/50 animate-pulse",
  going_once: "bg-[#b8872f] text-white border-amber-400 font-bold animate-pulse",
  going_twice: "bg-[#c0392b] text-white border-red-400 font-bold animate-pulse",
  sold: "bg-[#27ae60] text-white border-emerald-400 font-bold",
  unsold: "bg-[#7f1d1d] text-[#ff9d9d] border-red-500",
};

const AdminLiveAuctionView = () => {
  const [tiers, setTiers] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [auctionData, setAuctionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Setup Tier Modal state
  const [selectedTierId, setSelectedTierId] = useState("");
  const [showStartModal, setShowStartModal] = useState(false);
  const [customPlayersQueue, setCustomPlayersQueue] = useState([]);

  // 2 Unsold Players Lottery Modal state
  const [showLotteryModal, setShowLotteryModal] = useState(false);
  const [lotteryAssignments, setLotteryAssignments] = useState([]);

  // Stop & Reset Modals state
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCategoryTarget, setResetCategoryTarget] = useState("Batsman");
  const [showStagePreview, setShowStagePreview] = useState(false);

  // Manual bid trigger state
  const [manualBidTeamId, setManualBidTeamId] = useState("");

  // Manage Team Coins Modal state
  const [coinModalTeam, setCoinModalTeam] = useState(null);

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
      if ((e.key === "f" || e.key === "F") && !["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName)) {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  const pollRef = useRef(null);

  // Load initial data and live auction state
  const fetchAuctionState = async () => {
    try {
      const res = await fetch("/api/auction/state", { cache: "no-store" });
      const data = await safeParse(res);
      if (res.ok) {
        setAuctionData(data);
      }
    } catch {
      // silent polling error
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tiersRes, playersRes, stateRes] = await Promise.all([
        fetch("/api/admin/auction-tiers", { cache: "no-store" }),
        fetch("/api/players", { cache: "no-store" }),
        fetch("/api/auction/state", { cache: "no-store" }),
      ]);

      const tiersData = await safeParse(tiersRes);
      const playersData = await safeParse(playersRes);
      const stateData = await safeParse(stateRes);

      if (tiersRes.ok) setTiers(tiersData.tiers || []);
      if (playersRes.ok) setAllPlayers(playersData.players || []);
      if (stateRes.ok) setAuctionData(stateData);
    } catch (err) {
      setError(err.message || "Failed to load auction data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadInitialData, 0);
    pollRef.current = setInterval(fetchAuctionState, 1500);
    return () => {
      window.clearTimeout(timer);
      clearInterval(pollRef.current);
    };
  }, []);

  const showFeedback = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  // Dispatch control actions
  const sendControlAction = async (action, payload = {}) => {
    try {
      setSubmittingAction(true);
      setError("");

      const res = await fetch("/api/auction/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const result = await safeParse(res);
      if (!res.ok) {
        throw new Error(result.error || `Failed to perform action: ${action}`);
      }

      showFeedback(result.message || `Action ${action} executed.`);
      await fetchAuctionState();
    } catch (err) {
      setError(err.message || "Auction control failed.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Place manual bid on behalf of a team
  const placeManualBid = async () => {
    if (!manualBidTeamId) return;
    const selectedTeam = teams.find((t) => t._id === manualBidTeamId);
    if (selectedTeam?.hasWonInCurrentTier) {
      setError(
        `Tier Quota Reached: ${selectedTeam.name} already acquired ${selectedTeam.wonPlayerInCurrentTier?.fullName || "a player"} in this tier (${state.tierName || "Current Tier"}). You cannot place a bid for them until the next tier starts.`
      );
      return;
    }
    try {
      setSubmittingAction(true);
      const res = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: manualBidTeamId }),
      });

      const result = await safeParse(res);
      if (!res.ok) {
        throw new Error(result.error || "Failed to place bid.");
      }

      showFeedback(result.message || "Bid placed successfully!");
      setManualBidTeamId("");
      await fetchAuctionState();
    } catch (err) {
      setError(err.message || "Failed to place bid.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Start Tier Modal with preselected players
  const handleOpenStartModal = (tierId) => {
    setSelectedTierId(tierId);
    const targetTier = tiers.find((t) => t._id === tierId);
    if (!targetTier) return;

    // Pick players strictly assigned to this tier
    const tierPlayers = allPlayers.filter((p) => {
      // 1. Explicit auctionTier match (populated object or ID string)
      if (p.auctionTier) {
        const pTierId =
          typeof p.auctionTier === "object" ? p.auctionTier._id : p.auctionTier;
        if (String(pTierId) === String(tierId)) return true;
        return false; // Assigned to another tier, so DO NOT include
      }
      // 2. Fallback only if unassigned by ID: must match BOTH tier name and category
      const tierMatches =
        p.tier && p.tier.toLowerCase() === targetTier.name.toLowerCase();
      const categoryMatches = (p.categories || [])
        .map((c) => c.toLowerCase())
        .includes(targetTier.category.toLowerCase());
      return Boolean(tierMatches && categoryMatches);
    });

    // Limit to 5 players
    setCustomPlayersQueue(tierPlayers.slice(0, 5).map((p) => p._id));
    setShowStartModal(true);
  };

  const handleConfirmStartTier = async () => {
    if (!selectedTierId) return;
    await sendControlAction("START_TIER", {
      tierId: selectedTierId,
      selectedPlayerIds: customPlayersQueue,
    });
    setShowStartModal(false);
  };

  const state = auctionData?.state || {};
  const teams = auctionData?.teams || [];
  const currentQueue = state.players || [];
  const currentPlayer = currentQueue[state.currentPlayerIndex] || null;
  const isFifthPlayer = state.currentPlayerIndex === 4;

  const currentBasePrice = isFifthPlayer && state.fifthPlayerCalculatedBasePrice
    ? state.fifthPlayerCalculatedBasePrice
    : currentPlayer?.basePrice || state.tierBasePrice || 500;

  return (
    <div className="space-y-4 text-white">
      {/* HEADER SECTION */}
      <section className="rounded-2xl border border-[#aeac78]/30 bg-gradient-to-br from-[#383230]/95 to-[#241f1e]/95 p-5 sm:p-6 shadow-xl backdrop-blur-xl text-[#fcf0da]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#aeac78]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <i className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#f2c46a] to-[#c89632] text-lg text-[#221d1c]">
              <FaGavel />
            </i>
            <div>
              <h2 className="text-lg font-black tracking-wide text-[#fcf0da] flex items-center gap-2">
                AUCTIONEER LIVE CONSOLE
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                    state.status === "in_progress"
                      ? "bg-[#aeac78]/25 text-[#fcf0da] border-[#aeac78]/50"
                      : state.status === "paused"
                      ? "bg-[#f2c46a]/20 text-[#f2c46a] border-[#f2c46a]/50 animate-pulse"
                      : state.status === "completed"
                      ? "bg-[#aeac78]/20 text-[#aeac78] border-[#aeac78]/40"
                      : "bg-white/10 text-[#aeac78] border-white/15"
                  }`}
                >
                  {state.status === "in_progress"
                    ? "● LIVE IN PROGRESS"
                    : state.status === "paused"
                    ? "⏸ PAUSED"
                    : state.status === "completed"
                    ? "✓ COMPLETED"
                    : state.status || "IDLE"}
                </span>
              </h2>
              <p className="text-xs text-[#9faab2]">
                Real-time tournament auction controller: Progressive bid increments (+50 up to 1k, +100 up to 2k, +200 up to 3k, +250 up to 4k, +500 above 4k), 10,000 team purse, and 5th player average rule.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* QUICK CONTROL BUTTONS (STOP / RESET / PAUSE / RESUME) */}
            {(state.status === "in_progress" || state.status === "paused") && (
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#02121f] p-1">
                {state.status === "in_progress" ? (
                  <button
                    type="button"
                    onClick={() => sendControlAction("PAUSE")}
                    disabled={submittingAction}
                    className="flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 cursor-pointer transition-colors"
                    title="Pause live auction"
                  >
                    <FaPause className="text-[10px]" />
                    Pause
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => sendControlAction("RESUME")}
                    disabled={submittingAction}
                    className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer animate-pulse transition-colors"
                    title="Resume live auction"
                  >
                    <FaPlay className="text-[10px]" />
                    Resume
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowStopModal(true)}
                  disabled={submittingAction}
                  className="flex items-center gap-1 rounded bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 hover:bg-red-500/30 cursor-pointer transition-colors"
                  title="Stop live auction"
                >
                  <FaStop className="text-[10px]" />
                  Stop
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={submittingAction}
                  className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-bold text-[#ccd4d8] hover:bg-white/20 cursor-pointer transition-colors"
                  title="Reset auction options"
                >
                  <FaRotateLeft className="text-[10px]" />
                  Reset
                </button>
              </div>
            )}

            {/* IF IDLE OR COMPLETED, ALLOW FULL RESET ANYTIME */}
            {state.status && state.status !== "idle" && state.status !== "in_progress" && state.status !== "paused" && (
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={submittingAction}
                className="flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-bold text-[#ccd4d8] hover:bg-white/10 cursor-pointer"
                title="Reset auction to Idle"
              >
                <FaRotateLeft className="text-[10px]" />
                Reset Console
              </button>
            )}

            <a
              href="/auction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded border border-[#d4a84f]/60 bg-[#76511d]/40 px-3 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#76511d] transition-colors"
            >
              Public Arena ↗
            </a>
            <a
              href="/auction/stage"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded border border-cyan-400/60 bg-cyan-950/60 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/80 transition-colors"
              title="Open Stage Projector screen for auditorium display"
            >
              Auditorium Stage ↗
            </a>
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? "border-emerald-500/70 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/80"
                  : "border-white/20 bg-white/5 text-[#ccd4d8] hover:bg-white/10"
              }`}
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <FaCompress className="text-[11px]" /> : <FaExpand className="text-[11px]" />}
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              <kbd className="hidden md:inline-block ml-0.5 rounded bg-black/40 px-1 py-0.2 text-[9px] font-mono text-[#8b979d] border border-white/10">F</kbd>
            </button>
            <button
              type="button"
              onClick={fetchAuctionState}
              className="grid size-8 place-items-center rounded border border-white/20 text-[#d4a84f] hover:bg-white/10"
              title="Refresh State"
            >
              <FaRotateRight className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {error && (
          <div className="mt-3 flex items-center justify-between rounded border border-red-500/40 bg-red-950/40 p-2 text-xs text-red-200">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <FaXmark />
            </button>
          </div>
        )}
        {actionMessage && (
          <div className="mt-3 flex items-center gap-2 rounded border border-[#d4a84f]/40 bg-[#76511d]/40 p-2 text-xs text-[#f2d590]">
            <FaCheck />
            <span>{actionMessage}</span>
          </div>
        )}
      </section>

      {/* ACTIVE AUCTION STAGE OR SETUP PROMPT */}
      {(state.status === "in_progress" || state.status === "paused") && currentPlayer ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* MAIN STAGE (LEFT 2 COLS) */}
          <div className="space-y-4 lg:col-span-2">
            {/* CURRENT PLAYER AUCTION CARD */}
            <div className="relative overflow-hidden rounded-lg border border-[#d4a84f]/40 bg-[#02121f] p-5 shadow-2xl">
              <div className="absolute right-0 top-0 rounded-bl-lg bg-[#b8872f] px-3 py-1 text-[11px] font-extrabold uppercase text-black">
                PLAYER {state.currentPlayerIndex + 1} OF {currentQueue.length}
              </div>

              {/* PAUSED NOTICE BANNER */}
              {state.status === "paused" && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/90 via-amber-900/80 to-amber-950/90 p-3.5 text-amber-200 shadow-lg animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-lg bg-amber-500 text-black text-sm font-black">
                      <FaPause />
                    </div>
                    <div>
                      <p className="font-black text-sm text-white uppercase tracking-wider">
                        AUCTION CURRENTLY PAUSED
                      </p>
                      <p className="text-xs text-amber-200/90">
                        Public team bidding is suspended and the countdown timer is halted.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sendControlAction("RESUME")}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-black text-white hover:bg-emerald-500 shadow cursor-pointer"
                    >
                      <FaPlay />
                      Resume Bidding
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStopModal(true)}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 rounded-md bg-red-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                    >
                      <FaStop />
                      Stop Session
                    </button>
                  </div>
                </div>
              )}

              {/* 2 UNSOLD PLAYERS SPECIAL RULE BANNER (Re-Auction or Lottery) */}
              {currentQueue.filter((p) => p.status === "unsold").length === 2 &&
                currentQueue.filter((p) => p.status === "sold").length === 3 && (
                  <div className="mb-4 rounded-xl border-2 border-purple-400/80 bg-gradient-to-r from-purple-950/95 via-indigo-950/90 to-purple-950/95 p-4 text-xs shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 font-black text-purple-200 text-sm">
                        <span className="size-2.5 rounded-full bg-purple-400 animate-ping" />
                        <span>🎲 2 Players Unsold in Tier Rule Active!</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => sendControlAction("REAUCTION_UNSOLD_PLAYERS")}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-1.5 text-xs font-black text-white hover:brightness-110 shadow-md cursor-pointer transition-all"
                        >
                          <FaRotateRight className="text-[10px]" />
                          Re-Auction 2 Unsold Players Now
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            // Prepare remaining 2 teams and 2 unsold players for lottery
                            const unsold = currentQueue.filter((p) => p.status === "unsold");
                            const soldTeamIds = new Set(
                              currentQueue.filter((p) => p.status === "sold" && p.soldToTeam).map((p) => p.soldToTeam.toString())
                            );
                            const remTeams = teams.filter((t) => !soldTeamIds.has(t._id.toString()));
                            setLotteryAssignments([
                              { playerId: unsold[0]?.player, teamId: remTeams[0]?._id || "" },
                              { playerId: unsold[1]?.player, teamId: remTeams[1]?._id || "" },
                            ]);
                            setShowLotteryModal(true);
                          }}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-1.5 text-xs font-black text-slate-950 hover:brightness-110 shadow-md cursor-pointer transition-all"
                        >
                          <FaCoins className="text-[10px]" />
                          Execute Team Lottery Draw 🎲
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-purple-200/90 leading-relaxed">
                      Tournament Rule: The 2 unsold players can be auctioned again. If they still remain unsold, a lottery takes place between the 2 remaining teams with price = <b>((Player 1 + Player 2 + Player 3) / 3)</b>.
                    </p>
                  </div>
                )}

              {/* 5TH / REMAINING PLAYER SPECIAL RULE BANNER */}
              {((isFifthPlayer && currentPlayer?.status !== "sold") ||
                (currentQueue.filter((p) => p.status === "sold").length === 4 &&
                  currentQueue.some((p) => p.status === "unsold" || p.status === "upcoming"))) && (
                <div className="mb-4 rounded-xl border border-amber-400/60 bg-gradient-to-r from-amber-950/90 via-amber-900/60 to-amber-950/90 p-3.5 text-xs shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-black text-amber-300">
                      <FaCoins className="text-amber-400 text-sm" />
                      5th / Remaining Player Rule Active!
                    </div>
                    {currentQueue.filter((p) => p.status === "sold").length < 5 && (
                      <button
                        type="button"
                        onClick={() => sendControlAction("AUTO_ASSIGN_5TH_PLAYER")}
                        disabled={submittingAction}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs font-black text-slate-950 hover:brightness-110 shadow-md cursor-pointer active:scale-95 transition-all"
                      >
                        <FaGavel className="text-[10px]" />
                        Auto-Assign to Remaining Team
                      </button>
                    )}
                  </div>
                  <p className="mt-1.5 text-[#ffd37f]">
                    4 teams have acquired players in this tier. The remaining unsold player automatically goes to the remaining 5th team at the calculated average price (৳ {state.fifthPlayerCalculatedBasePrice?.toLocaleString() || 500}).
                  </p>
                </div>
              )}

              {/* PLAYER PROFILE ROW */}
              <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
                <div className="relative shrink-0">
                  {currentPlayer.photoUrl ? (
                    <img
                      src={currentPlayer.photoUrl}
                      alt={currentPlayer.fullName}
                      className="size-20 rounded-full border-2 border-[#d4a84f] object-cover shadow-lg"
                    />
                  ) : (
                    <div className="grid size-20 place-items-center rounded-full border-2 border-[#d4a84f] bg-white/10 text-xl font-bold text-[#d4a84f]">
                      {currentPlayer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">{currentPlayer.fullName}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8b979d]">
                    <span className="rounded bg-[#76511d] px-2 py-0.5 font-bold text-[#f2d590]">
                      {state.category}
                    </span>
                    <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5">
                      {state.tierName}
                    </span>
                    <span>Student ID: <b className="text-white">{currentPlayer.playerId}</b></span>
                    <span>Session: <b className="text-white">{currentPlayer.session}</b></span>
                  </div>
                  <p className="mt-2 text-xs text-[#9faab2]">
                    Base Price: <b className="text-[#d4a84f] text-sm">৳ {currentBasePrice.toLocaleString()}</b>
                  </p>
                </div>
              </div>

              {/* LIVE BIDDING STATUS BOX */}
              <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-[#031827] p-4 sm:grid-cols-3 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase text-[#8b979d]">Current Bid</p>
                  <p className="text-3xl font-black text-[#d4a84f]">
                    ৳ {state.currentBid ? state.currentBid.toLocaleString() : "0"}
                  </p>
                  <p className="text-[10px] text-[#7c8790]">
                    Next increment: +৳ {getBidIncrement(state.currentBid).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-[#8b979d]">Leading Bidder</p>
                  <p className="text-lg font-bold text-white truncate">
                    {state.currentBidderTeamName || "No Bids Yet"}
                  </p>
                  <p className="text-[10px] text-[#7c8790]">
                    {state.currentBidderTeamName ? "Highest Bid" : "Awaiting First Bid"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase text-[#8b979d]">Hammer Status</p>
                  <div
                    className={`mt-1 inline-block rounded-md border px-3 py-1 text-xs uppercase ${
                      hammerColors[state.hammerStatus] || hammerColors.waiting
                    }`}
                  >
                    {state.hammerStatus?.replace("_", " ")}
                  </div>
                </div>
              </div>

              {/* HAMMER & AUCTION CONTROL BUTTONS */}
              {state.hammerStatus === "waiting" ? (
                /* STAGE SPOTLIGHT REVEAL CONTROLLER (BEFORE BIDDING STARTS) */
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border-2 border-emerald-500/70 bg-gradient-to-r from-emerald-950/90 via-[#011a0e] to-emerald-950/90 p-4 text-center shadow-xl">
                    <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider text-emerald-300">
                      <span className="size-2.5 rounded-full bg-emerald-400 animate-ping" />
                      STAGE SPOTLIGHT REVEAL ACTIVE
                    </div>
                    <p className="mt-1 text-xs text-emerald-200">
                      Public and auditorium screens are displaying <b>{currentPlayer.fullName}</b> with base price <b>৳ {currentBasePrice.toLocaleString()}</b>.
                    </p>
                    <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => sendControlAction("OPEN_BIDDING")}
                        disabled={submittingAction}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2.5 text-xs font-black uppercase text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-98 cursor-pointer disabled:opacity-50"
                      >
                        <FaPlay />
                        OPEN BIDDING NOW
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowStagePreview(!showStagePreview)}
                        className="rounded-xl border border-cyan-400/50 bg-cyan-950/50 px-3.5 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 cursor-pointer"
                      >
                        {showStagePreview ? "Hide Preview" : "Preview Stage Display 👁"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      {state.status === "in_progress" ? (
                        <button
                          type="button"
                          onClick={() => sendControlAction("PAUSE")}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded border border-amber-500/60 bg-amber-950/60 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/80 cursor-pointer transition-colors"
                          title="Pause live auction"
                        >
                          <FaPause className="text-[11px]" />
                          Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendControlAction("RESUME")}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded border border-emerald-500/60 bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 cursor-pointer shadow animate-pulse transition-colors"
                          title="Resume live auction"
                        >
                          <FaPlay className="text-[11px]" />
                          Resume
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setShowStopModal(true)}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded border border-red-500/60 bg-red-950/60 px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/80 cursor-pointer transition-colors"
                        title="Stop ongoing live auction"
                      >
                        <FaStop className="text-[11px]" />
                        Stop
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-[#ccd4d8] hover:bg-white/10 cursor-pointer transition-colors"
                        title="Reset current player bids or entire auction"
                      >
                        <FaRotateLeft className="text-[11px]" />
                        Reset...
                      </button>
                    </div>

                    {state.currentPlayerIndex === 4 && state.hammerStatus === "sold" ? (
                      <button
                        type="button"
                        onClick={() => sendControlAction("STOP")}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-black text-white cursor-pointer shadow"
                      >
                        COMPLETE TIER AUCTION ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendControlAction("NEXT_PLAYER")}
                        disabled={submittingAction || (state.hammerStatus !== "sold" && state.hammerStatus !== "unsold")}
                        className="flex items-center gap-1.5 rounded bg-[#b8872f] px-4 py-2 text-xs font-black text-white hover:brightness-110 disabled:opacity-40 cursor-pointer shadow"
                      >
                        NEXT PLAYER ({state.currentPlayerIndex + 1}/{currentQueue.length})
                        <FaForward />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ACTIVE BIDDING CONTROLS */
                <div className="mt-5 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => sendControlAction("HAMMER_SOLD")}
                      disabled={submittingAction || state.currentBid <= 0 || !state.currentBidderTeam}
                      className="sm:col-span-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-3.5 text-sm font-black uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-40 shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>SOLD! 🏆</span>
                      {state.currentBid > 0 && state.currentBidderTeamName && (
                        <span className="text-xs font-normal opacity-90">
                          (৳ {state.currentBid.toLocaleString()} to {state.currentBidderTeamName})
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => sendControlAction("HAMMER_UNSOLD")}
                      disabled={submittingAction}
                      className="rounded-xl border border-red-500/40 bg-red-950/70 py-3.5 text-xs font-bold uppercase tracking-wider text-red-200 hover:bg-red-900/80 disabled:opacity-40 cursor-pointer"
                    >
                      PASS / UNSOLD ✕
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-2">
                      {state.status === "in_progress" ? (
                        <button
                          type="button"
                          onClick={() => sendControlAction("PAUSE")}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded border border-amber-500/60 bg-amber-950/60 px-3.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/80 cursor-pointer transition-colors"
                          title="Pause live auction"
                        >
                          <FaPause className="text-[11px]" />
                          Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendControlAction("RESUME")}
                          disabled={submittingAction}
                          className="flex items-center gap-1.5 rounded border border-emerald-500/60 bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 cursor-pointer shadow animate-pulse transition-colors"
                          title="Resume live auction"
                        >
                          <FaPlay className="text-[11px]" />
                          Resume
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => sendControlAction("REVEAL_PLAYER")}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded border border-cyan-500/60 bg-cyan-950/60 px-3.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/80 cursor-pointer transition-colors"
                        title="Re-show player spotlight reveal screen on public display"
                      >
                        📺 Re-show Reveal Screen
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowStagePreview(!showStagePreview)}
                        className="rounded border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                      >
                        {showStagePreview ? "Hide Preview" : "Preview Stage 👁"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowStopModal(true)}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded border border-red-500/60 bg-red-950/60 px-3.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/80 cursor-pointer transition-colors"
                        title="Stop ongoing live auction"
                      >
                        <FaStop className="text-[11px]" />
                        Stop
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-[#ccd4d8] hover:bg-white/10 cursor-pointer transition-colors"
                        title="Reset current player bids or entire auction"
                      >
                        <FaRotateLeft className="text-[11px]" />
                        Reset...
                      </button>
                    </div>

                    {state.currentPlayerIndex === 4 && state.hammerStatus === "sold" ? (
                      <button
                        type="button"
                        onClick={() => sendControlAction("STOP")}
                        disabled={submittingAction}
                        className="flex items-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-black text-white cursor-pointer shadow"
                      >
                        COMPLETE TIER AUCTION ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendControlAction("NEXT_PLAYER")}
                        disabled={submittingAction || (state.hammerStatus !== "sold" && state.hammerStatus !== "unsold")}
                        className="flex items-center gap-1.5 rounded bg-[#b8872f] px-4 py-2 text-xs font-black text-white hover:brightness-110 disabled:opacity-40 cursor-pointer shadow"
                      >
                        NEXT PLAYER ({state.currentPlayerIndex + 1}/{currentQueue.length})
                        <FaForward />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* LIVE STAGE DISPLAY PREVIEW INSIDE CONSOLE */}
              {showStagePreview && (
                <div className="mt-4 rounded-2xl border-2 border-cyan-400/40 bg-black/60 p-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                      Auditorium Stage Screen Preview (Live Audience View)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStagePreview(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕ Close Preview
                    </button>
                  </div>
                  <PlayerStageRevealCard
                    player={currentPlayer}
                    basePrice={currentBasePrice}
                    tierName={state.tierName}
                    categoryName={state.category}
                    playerIndex={state.currentPlayerIndex}
                    totalPlayers={currentQueue.length}
                    isFifthPlayer={isFifthPlayer}
                    isProjectorMode={false}
                    isBiddingOpen={["bidding_open", "going_once", "going_twice"].includes(state.hammerStatus)}
                  />
                </div>
              )}

              {/* MANUAL BID PLACER BAR (For Admin to trigger bids from console) */}
              <div className="mt-4 rounded-md border border-white/10 bg-[#031827] p-3">
                <p className="text-[11px] font-bold uppercase text-[#8b979d] mb-1.5">
                  Admin Manual Bid Assist (Place bid on behalf of team in room)
                </p>
                <div className="flex gap-2">
                  <select
                    className="flex-1 rounded border border-white/20 bg-[#02121f] px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
                    value={manualBidTeamId}
                    onChange={(e) => setManualBidTeamId(e.target.value)}
                  >
                    <option value="">-- Select Team --</option>
                    {teams.map((t) => (
                      <option key={t._id} value={t._id} disabled={t.hasWonInCurrentTier}>
                        {t.name} (৳ {t.pointsRemaining?.toLocaleString()} left)
                        {t.hasWonInCurrentTier
                          ? ` — 🔒 Quota Met (${t.wonPlayerInCurrentTier?.fullName || "Player Won"})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={placeManualBid}
                    disabled={!manualBidTeamId || submittingAction}
                    className="flex items-center gap-1.5 rounded bg-[#76511d] px-4 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#b8872f] hover:text-white disabled:opacity-40 cursor-pointer"
                  >
                    <FaCoins />
                    Trigger Next Bid (৳ {auctionData?.nextMinimumBid?.toLocaleString() || "—"})
                  </button>
                </div>
              </div>
            </div>

            {/* 5-PLAYER QUEUE LIST */}
            <div className="rounded-lg border border-white/15 bg-[#031827] p-4">
              <h4 className="text-xs font-bold uppercase text-[#d4a84f] tracking-wider mb-2 flex items-center gap-2">
                <FaLayerGroup />
                {state.tierName} Queue ({currentQueue.length} Players)
              </h4>
              <div className="space-y-1.5">
                {currentQueue.map((item, idx) => {
                  const isCurrent = idx === state.currentPlayerIndex;
                  return (
                    <div
                      key={item.player || idx}
                      className={`flex items-center justify-between gap-3 rounded border p-2 text-xs transition-all ${
                        isCurrent
                          ? "border-[#d4a84f] bg-[#d4a84f]/15"
                          : "border-white/5 bg-[#02121f]/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-6 place-items-center rounded bg-white/10 text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <div className="relative shrink-0">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt={item.fullName}
                              className="size-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="grid size-7 place-items-center rounded-full bg-white/10 text-[9px] font-bold">
                              {item.fullName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {item.fullName}
                            {idx === 4 && (
                              <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                                5th (Avg P3 &amp; P4)
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#8b979d]">
                            ID: {item.playerId} • Base: ৳ {item.basePrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {item.status === "sold" ? (
                          <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            SOLD: ৳ {item.soldPrice?.toLocaleString()} ({item.soldToTeamName})
                          </span>
                        ) : item.status === "unsold" ? (
                          <span className="rounded bg-red-950/80 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-300">
                            UNSOLD
                          </span>
                        ) : isCurrent ? (
                          <span className="rounded bg-[#76511d] px-2 py-0.5 text-[10px] font-bold text-[#f2d590] animate-pulse">
                            BIDDING NOW
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#7c8790]">Upcoming</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TEAMS LEADERBOARD & PURSES */}
          <div className="space-y-4">
            <div className="rounded-lg border border-white/15 bg-[#031827] p-4 shadow-lg">
              <h4 className="text-xs font-bold uppercase text-[#d4a84f] tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FaUsers />
                  Teams Purse Status
                </span>
                <span className="text-[10px] text-[#8b979d]">Max 10,000 pts</span>
              </h4>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {teams.map((team) => {
                  const percentLeft = Math.round((team.pointsRemaining / 10000) * 100);
                  const isLeading = state.currentBidderTeam?.toString() === team._id.toString();

                  return (
                    <div
                      key={team._id}
                      className={`rounded border p-2.5 transition-all text-xs ${
                        isLeading
                          ? "border-[#d4a84f] bg-[#d4a84f]/15"
                          : "border-white/10 bg-[#02121f]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                          {team.name}
                          {isLeading && (
                            <span className="rounded bg-[#b8872f] px-1.5 py-0.2 text-[9px] text-black font-extrabold">
                              LEAD
                            </span>
                          )}
                          {team.hasWonInCurrentTier && (
                            <span
                              className="rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 text-[8px] text-amber-300 font-bold"
                              title={`Acquired ${team.wonPlayerInCurrentTier?.fullName || "player"} in this tier`}
                            >
                              🔒 TIER QUOTA
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#d4a84f]">
                            ৳ {team.pointsRemaining?.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCoinModalTeam(team)}
                            className="rounded bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/35 px-2 py-0.5 text-[10px] font-bold text-amber-300 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                            title={`Add points for ${team.name}`}
                          >
                            <FaCoins className="text-[9px]" />
                            <span>+ Add Point</span>
                          </button>
                        </div>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            percentLeft > 40
                              ? "bg-emerald-500"
                              : percentLeft > 15
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${percentLeft}%` }}
                        />
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-[#8b979d]">
                        <span>Squad: {team.playerCount} player(s)</span>
                        <span>Spent: ৳ {team.pointsSpent?.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE BID HISTORY STREAM */}
            <div className="rounded-lg border border-white/15 bg-[#031827] p-4 shadow-lg">
              <h4 className="text-xs font-bold uppercase text-[#d4a84f] tracking-wider mb-2 flex items-center gap-1.5">
                <FaTrophy />
                Recent Bids Log
              </h4>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto text-xs pr-1">
                {(state.bidHistory || []).length === 0 ? (
                  <p className="text-center py-4 text-[11px] text-[#7c8790]">No bids recorded yet</p>
                ) : (
                  state.bidHistory.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded bg-[#02121f] px-2.5 py-1.5 text-[11px]"
                    >
                      <span className="font-semibold text-white">{b.teamName}</span>
                      <span className="font-mono font-bold text-[#d4a84f]">
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
        /* AUCTION SETUP / START TIER SELECTOR */
        <div className="rounded-lg border border-white/15 bg-[#031827] p-6 text-center space-y-4">
          <FaGavel className="mx-auto text-4xl text-[#d4a84f]" />
          <h3 className="text-lg font-bold text-white">Select a Category Tier to Begin Auction</h3>
          <p className="max-w-[560px] mx-auto text-xs text-[#9faab2]">
            Each tier consists of 5 players. Base prices are set per tier. Progressive bid increments apply: +৳50 (up to 1,000), +৳100 (up to 2,000), +৳200 (up to 3,000), +৳250 (up to 4,000), and +৳500 thereafter. The 5th player&apos;s starting price will automatically be the average of the 3rd and 4th sold players.
          </p>

          <div className="max-w-[700px] mx-auto grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-3">
            {tiers.map((t) => (
              <div
                key={t._id}
                className="rounded-lg border border-white/10 bg-[#02121f] p-4 text-left hover:border-[#d4a84f] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#76511d] px-2 py-0.5 text-[10px] font-bold text-[#f2d590]">
                    {t.category}
                  </span>
                  <span className="text-xs font-bold text-white">{t.name}</span>
                </div>
                <p className="mt-2 text-xs text-[#d4a84f] font-mono">
                  Base Price: ৳ {t.basePrice?.toLocaleString()}
                </p>
                <p className="text-[10px] text-[#8b979d] mt-0.5">
                  {t.playerCount || 0} players configured
                </p>

                <button
                  type="button"
                  onClick={() => handleOpenStartModal(t._id)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 rounded bg-[#b8872f] py-1.5 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
                >
                  <FaPlay className="text-[10px]" />
                  Launch Tier Auction
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* START TIER CONFIRMATION & 5-PLAYER QUEUE MODAL */}
      {showStartModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
          onClick={() => setShowStartModal(false)}
        >
          <div
            className="w-full max-w-[560px] rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FaPlay className="text-[#d4a84f] text-xs" />
                Configure 5-Player Auction Set
              </h3>
              <button
                type="button"
                className="text-[#9faab2] hover:text-white"
                onClick={() => setShowStartModal(false)}
              >
                <FaXmark />
              </button>
            </div>

            <p className="text-xs text-[#9faab2] mb-3">
              The tournament rules state that each tier has 5 players auctioned sequentially.
              The 5th player&apos;s base price will automatically be the average of Player 3 and Player 4 final bid prices.
            </p>

            <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
              <p className="text-[11px] font-bold uppercase text-[#d4a84f]">
                Selected Players Queue ({customPlayersQueue.length} of 5):
              </p>
              {customPlayersQueue.map((pid, idx) => {
                const player = allPlayers.find((p) => p._id === pid);
                if (!player) return null;
                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between rounded border border-white/10 bg-[#02121f] p-2 text-xs"
                  >
                    <span className="flex items-center gap-2">
                      <b className="text-[#d4a84f]">#{idx + 1}</b>
                      {player.fullName} ({player.playerId})
                      {idx === 4 && (
                        <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                          5th Player (Average Rule)
                        </span>
                      )}
                    </span>
                    <span className="text-[#8b979d]">{player.session}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="rounded border border-white/20 px-3 py-1.5 text-xs text-[#ccd4d8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStartTier}
                disabled={submittingAction}
                className="rounded bg-[#b8872f] px-4 py-1.5 text-xs font-bold text-white hover:brightness-110"
              >
                Start Live Auction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOP AUCTION CONFIRMATION MODAL */}
      {showStopModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowStopModal(false)}
        >
          <div
            className="w-full max-w-[460px] rounded-lg border border-red-500/40 bg-[#031827] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <FaStop className="text-red-400 text-sm" />
                Stop Live Auction
              </h3>
              <button
                type="button"
                className="text-[#9faab2] hover:text-white"
                onClick={() => setShowStopModal(false)}
              >
                <FaXmark />
              </button>
            </div>

            <p className="text-xs text-[#ccd4d8] leading-relaxed mb-4">
              Are you sure you want to <b>STOP</b> this live auction session
              {state.category && state.tierName ? (
                <> for <b className="text-white">{state.category} - {state.tierName}</b></>
              ) : null}?
              <br />
              This will stop the countdown timer, close public bidding, and finalize the live tier session.
            </p>

            <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="rounded border border-white/20 px-3 py-1.5 text-xs text-[#ccd4d8] hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await sendControlAction("STOP");
                  setShowStopModal(false);
                }}
                disabled={submittingAction}
                className="flex items-center gap-1.5 rounded bg-red-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-600 shadow cursor-pointer"
              >
                <FaStop className="text-[10px]" />
                Confirm Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET AUCTION MODAL (SCOPE SELECTION) */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-lg border border-[#b8a18055] bg-[#031827] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FaRotateLeft className="text-[#d4a84f] text-sm" />
                Auction Reset Options
              </h3>
              <button
                type="button"
                className="text-[#9faab2] hover:text-white"
                onClick={() => setShowResetModal(false)}
              >
                <FaXmark />
              </button>
            </div>

            <p className="text-xs text-[#9faab2] mb-4">
              Choose the reset scope depending on whether you need to fix a mistake on the current player or reset the entire auction.
            </p>

            <div className="space-y-3 mb-4">
              {/* OPTION 1: CURRENT PLAYER RESET */}
              {currentPlayer && (
                <div className="rounded-lg border border-white/10 bg-[#02121f] p-3 hover:border-amber-400/50 transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-amber-300">
                      Option 1: Reset Current Player Only
                    </h4>
                    <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      Undo Bids
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b979d] leading-relaxed mb-2.5">
                    Resets {currentPlayer.fullName}&apos;s current bid back to ৳ 0 and reopens bidding. The 5-player tier sequence is preserved. If the player was already marked SOLD, the points spent are refunded to the team.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await sendControlAction("RESET", { scope: "CURRENT_PLAYER" });
                      setShowResetModal(false);
                    }}
                    disabled={submittingAction}
                    className="flex items-center gap-1.5 rounded bg-[#76511d] px-3.5 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#b8872f] hover:text-white cursor-pointer"
                  >
                    <FaRotateLeft className="text-[10px]" />
                    Reset Current Player (৳ 0)
                  </button>
                </div>
              )}

              {/* OPTION 2: RESET BY CATEGORY */}
              <div className="rounded-lg border border-purple-500/20 bg-[#02121f] p-3 hover:border-purple-400/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-purple-300">
                    Option 2: Reset Specific Category
                  </h4>
                  <span className="rounded bg-purple-400/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    Category Refund
                  </span>
                </div>
                <p className="text-[11px] text-[#8b979d] leading-relaxed mb-2.5">
                  Resets only players in the selected category to UPCOMING and refunds all money spent on this category back to the respective team purses. All other categories remain completely intact.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={resetCategoryTarget}
                    onChange={(e) => setResetCategoryTarget(e.target.value)}
                    className="rounded border border-purple-500/40 bg-[#061e30] px-3 py-1.5 text-xs font-semibold text-purple-200 outline-none focus:border-purple-400"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="ALL ROUNDER">ALL ROUNDER</option>
                    <option value="Wicket Keeper (Batsman)">Wicket Keeper (Batsman)</option>
                    <option value="ICON PLAYER">ICON PLAYER</option>
                  </select>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Are you sure you want to reset all players in category "${resetCategoryTarget}"? Money spent on this category will be refunded to teams.`)) return;
                      await sendControlAction("RESET", { scope: "CATEGORY", targetCategory: resetCategoryTarget });
                      setShowResetModal(false);
                    }}
                    disabled={submittingAction}
                    className="flex items-center gap-1.5 rounded bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 px-3.5 py-1.5 text-xs font-bold text-purple-100 cursor-pointer"
                  >
                    <FaRotateLeft className="text-[10px]" />
                    Reset {resetCategoryTarget} Category
                  </button>
                </div>
              </div>

              {/* OPTION 3: RESET ACTIVE LIVE SESSION */}
              <div className="rounded-lg border border-amber-500/20 bg-[#02121f] p-3 hover:border-amber-400/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-amber-300">
                    Option 3: Reset Active Tier Session
                  </h4>
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Active Session
                  </span>
                </div>
                <p className="text-[11px] text-[#8b979d] leading-relaxed mb-2.5">
                  Refunds sold players in the currently loaded 5-player tier, wipes the active queue, and returns the console to IDLE so you can pick or reload a tier.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await sendControlAction("RESET", { scope: "SESSION" });
                    setShowResetModal(false);
                  }}
                  disabled={submittingAction}
                  className="flex items-center gap-1.5 rounded bg-[#76511d] px-3.5 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#b8872f] hover:text-white cursor-pointer"
                >
                  <FaRotateLeft className="text-[10px]" />
                  Reset Active Session to Idle
                </button>
              </div>

              {/* OPTION 4: FULL TOURNAMENT RESET */}
              <div className="rounded-lg border border-red-500/20 bg-[#02121f] p-3 hover:border-red-400/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-red-300">
                    Option 4: Reset Entire Tournament Auction
                  </h4>
                  <span className="rounded bg-red-400/20 px-2 py-0.5 text-[10px] font-bold text-red-300">
                    Full Tournament Reset
                  </span>
                </div>
                <p className="text-[11px] text-[#8b979d] leading-relaxed mb-2.5">
                  Wipes all player sales across ALL tiers and categories, resets all team rosters, and restores all team points back to 10,000 PTS.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("⚠️ DANGER: Are you sure you want to completely RESET THE ENTIRE AUCTION? All teams will be refunded to 10,000 PTS and all player assignments will be wiped!")) return;
                    await sendControlAction("RESET", { scope: "FULL_TOURNAMENT" });
                    setShowResetModal(false);
                  }}
                  disabled={submittingAction}
                  className="flex items-center gap-1.5 rounded bg-red-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  <FaRotateLeft className="text-[10px]" />
                  Reset Full Tournament (10,000 PTS)
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded border border-white/20 px-3 py-1.5 text-xs text-[#ccd4d8] hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOTTERY DRAW MODAL FOR 2 REMAINING UNSOLD PLAYERS */}
      {showLotteryModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setShowLotteryModal(false)}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl border-2 border-purple-500/70 bg-[#061224] p-6 shadow-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                  🎲
                </div>
                <div>
                  <h3 className="text-base font-black uppercase text-white">
                    2-Player Lottery Draw System
                  </h3>
                  <p className="text-[11px] text-purple-300">
                    Remaining Unsold Players &amp; Remaining Teams
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowLotteryModal(false)}
              >
                <FaXmark />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-purple-400/30 bg-purple-950/40 p-3.5 text-xs text-purple-200">
              <p className="font-bold text-white mb-1">Lottery Price Rule:</p>
              <p className="font-mono text-purple-300">
                Price = ((Player 1 + Player 2 + Player 3) / 3) ={" "}
                <b className="text-amber-300 text-sm">
                  ৳ {(() => {
                    const sold = currentQueue.filter((p) => p.status === "sold" && p.soldPrice > 0);
                    const prices = sold.map((p) => p.soldPrice);
                    if (prices.length >= 3) {
                      return Math.round((prices[0] + prices[1] + prices[2]) / 3).toLocaleString();
                    }
                    if (prices.length > 0) {
                      return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length).toLocaleString();
                    }
                    return (state.tierBasePrice || 500).toLocaleString();
                  })()} PTS
                </b>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Both remaining teams will acquire their lottery player at this exact calculated price.
              </p>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase text-slate-300">
                  Assign Players to Remaining Teams:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // Random shuffle lottery
                    if (lotteryAssignments.length === 2) {
                      setLotteryAssignments([
                        { playerId: lotteryAssignments[0].playerId, teamId: lotteryAssignments[1].teamId },
                        { playerId: lotteryAssignments[1].playerId, teamId: lotteryAssignments[0].teamId },
                      ]);
                    }
                  }}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <FaRotateRight className="text-[10px]" />
                  Shuffle Teams
                </button>
              </div>

              {lotteryAssignments.map((a, idx) => {
                const playerObj = currentQueue.find(
                  (p) => (p.player?.toString() || p._id?.toString()) === a.playerId?.toString()
                );
                const soldTeamIds = new Set(
                  currentQueue.filter((p) => p.status === "sold" && p.soldToTeam).map((p) => p.soldToTeam.toString())
                );
                const eligibleTeams = teams.filter((t) => !soldTeamIds.has(t._id.toString()));

                return (
                  <div
                    key={a.playerId || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#020b18] p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-6 place-items-center rounded bg-purple-500/20 text-purple-300 font-bold">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-white">{playerObj?.fullName || "Unsold Player"}</p>
                        <p className="text-[10px] text-slate-400">ID: {playerObj?.playerId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">➔ Goes to:</span>
                      <select
                        value={a.teamId}
                        onChange={(e) => {
                          const newAssignments = [...lotteryAssignments];
                          newAssignments[idx].teamId = e.target.value;
                          setLotteryAssignments(newAssignments);
                        }}
                        className="rounded-lg border border-purple-500/40 bg-[#061e38] px-3 py-1.5 text-xs font-bold text-white outline-none cursor-pointer"
                      >
                        <option value="">-- Select Team --</option>
                        {eligibleTeams.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} (৳ {t.pointsRemaining?.toLocaleString()} left)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setShowLotteryModal(false)}
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (lotteryAssignments.some((a) => !a.teamId)) {
                    alert("Please assign both remaining teams to the players.");
                    return;
                  }
                  if (lotteryAssignments[0].teamId === lotteryAssignments[1].teamId) {
                    alert("Both players cannot go to the same team. Please select two different remaining teams.");
                    return;
                  }
                  await sendControlAction("LOTTERY_ASSIGN_REMAINING", {
                    teamAssignments: lotteryAssignments,
                  });
                  setShowLotteryModal(false);
                }}
                disabled={submittingAction}
                className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-600 px-5 py-2 text-xs font-black uppercase text-white hover:brightness-110 shadow-lg cursor-pointer"
              >
                Confirm &amp; Execute Lottery ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUALLY ADJUST COINS MODAL */}
      {coinModalTeam && (
        <AdjustCoinsModal
          team={coinModalTeam}
          onClose={() => setCoinModalTeam(null)}
          onCoinsUpdated={() => {
            fetchAuctionState();
          }}
        />
      )}

      {/* FLOATING QUICK FULLSCREEN BUTTON */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-amber-500/40 bg-[#161211]/90 px-3.5 py-2 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md hover:bg-[#251e1c] hover:border-amber-400 hover:scale-105 transition-all cursor-pointer"
        title="Toggle Fullscreen (F)"
      >
        {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
        <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
      </button>
    </div>
  );
};

export default AdminLiveAuctionView;
