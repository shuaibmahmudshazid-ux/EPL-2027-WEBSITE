"use client";

import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import {
  FaCheck,
  FaForward,
  FaBackward,
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
  FaMagnifyingGlass,
  FaBolt,
  FaArrowRotateLeft,
  FaToggleOn,
  FaToggleOff,
  FaPenToSquare,
} from "react-icons/fa6";
import PlayerStageRevealCard from "./player-stage-reveal-card";

const safeParse = async (response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const hammerColors = {
  waiting: "bg-white/10 text-[#9faab2] border-white/20",
  bidding_open: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50 animate-pulse",
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

  // Player search & selection state
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [playerFilterTab, setPlayerFilterTab] = useState("available"); // available | unsold | all | by_tier
  const [selectedTierFilter, setSelectedTierFilter] = useState("ALL");

  // Admin Bidding Controller state (PERSISTENT selected team)
  const [selectedBidTeamId, setSelectedBidTeamId] = useState("");
  const [customBidInput, setCustomBidInput] = useState("");
  const [showCustomBidInput, setShowCustomBidInput] = useState(false);
  const [showBasePriceEdit, setShowBasePriceEdit] = useState(false);
  const [editBasePriceVal, setEditBasePriceVal] = useState("");

  // Modals & previews
  const [showStopModal, setShowStopModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showStagePreview, setShowStagePreview] = useState(false);
  const [showTierBatchModal, setShowTierBatchModal] = useState(false);

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

  // Fetch auction state
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

  const state = auctionData?.state || {};
  const teams = auctionData?.teams || [];
  const currentQueue = state.players || [];
  const currentPlayer = currentQueue[state.currentPlayerIndex] || null;
  const isFifthPlayer = state.currentPlayerIndex === 4;

  const currentBasePrice = isFifthPlayer && state.fifthPlayerCalculatedBasePrice
    ? state.fifthPlayerCalculatedBasePrice
    : currentPlayer?.basePrice || state.tierBasePrice || 500;

  const nextMinimumBid = auctionData?.nextMinimumBid || (currentBasePrice || 500);
  const activeSelectedTeamId = selectedBidTeamId || teams[0]?._id || "";

  const showFeedback = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4500);
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

      showFeedback(result.message || `Action executed.`);
      await fetchAuctionState();
      fetch("/api/players", { cache: "no-store" })
        .then(safeParse)
        .then((data) => {
          if (data?.players) setAllPlayers(data.players);
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message || "Auction control failed.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // 1-Click Put Player on Stage
  const handleSelectPlayerForAuction = async (player) => {
    if (!player) return;
    await sendControlAction("SELECT_PLAYER", {
      playerId: player._id,
      customBasePrice: player.basePrice || 500,
    });
  };

  // ========================================================
  // 1. START BIDDING
  // ========================================================
  const handleStartBid = async () => {
    await sendControlAction("START_BID", {
      timerSeconds: 20,
    });
  };

  // ========================================================
  // 2. BIDDING (PLACE NEXT BID)
  // ========================================================
  const handleAdminSetBid = async (amountToSet) => {
    const teamToUse = activeSelectedTeamId;
    if (!teamToUse) {
      setError("Please add or select a Team first.");
      return;
    }
    const finalAmount = Number(amountToSet);
    if (!finalAmount || finalAmount <= 0) {
      setError("Please enter a valid bid amount.");
      return;
    }

    await sendControlAction("SET_BID", {
      teamId: teamToUse,
      amount: finalAmount,
    });
    setCustomBidInput("");
    setShowCustomBidInput(false);
  };

  const handleQuickIncrement = async (step) => {
    const teamToUse = activeSelectedTeamId;
    if (!teamToUse) {
      setError("Please select a Team first.");
      return;
    }
    const curr = state.currentBid > 0 ? state.currentBid : (currentBasePrice || 500);
    const nextAmount = curr + step;
    await handleAdminSetBid(nextAmount);
  };

  // ========================================================
  // 3. SOLD (ADMIN CLICKS SOLD)
  // ========================================================
  const handleAdminSold = async () => {
    const teamToAward = state.currentBidderTeam || activeSelectedTeamId;
    const priceToAward = state.currentBid > 0 ? state.currentBid : (currentBasePrice || 500);

    if (!teamToAward) {
      setError("Please select a team to declare Sold.");
      return;
    }

    await sendControlAction("HAMMER_SOLD", {
      teamId: teamToAward,
      soldPrice: priceToAward,
    });
  };

  // Update base price
  const handleSaveBasePrice = async () => {
    const val = Number(editBasePriceVal);
    if (isNaN(val) || val < 0) {
      setError("Please enter a valid base price.");
      return;
    }
    await sendControlAction("UPDATE_BASE_PRICE", { customBasePrice: val });
    setShowBasePriceEdit(false);
  };

  // Filtered players list for the Quick Player Chooser
  const filteredPlayers = useMemo(() => {
    const q = playerSearchQuery.trim().toLowerCase();
    return allPlayers.filter((p) => {
      if (p.status !== "approved") return false;

      if (playerFilterTab === "available") {
        if (p.auctionStatus === "sold") return false;
      } else if (playerFilterTab === "unsold") {
        if (p.auctionStatus !== "unsold") return false;
      }

      if (selectedTierFilter !== "ALL") {
        const matchesTier =
          p.tier === selectedTierFilter ||
          p.auctionTier?.name === selectedTierFilter ||
          (p.categories || []).includes(selectedTierFilter);
        if (!matchesTier) return false;
      }

      if (q) {
        const nameMatch = (p.fullName || "").toLowerCase().includes(q);
        const idMatch = (p.playerId || "").toLowerCase().includes(q);
        const regMatch = (p.registrationNumber || "").toLowerCase().includes(q);
        const catMatch = (p.categories || []).some((c) => c.toLowerCase().includes(q));
        const sessionMatch = (p.session || "").toLowerCase().includes(q);
        return nameMatch || idMatch || regMatch || catMatch || sessionMatch;
      }

      return true;
    });
  }, [allPlayers, playerSearchQuery, playerFilterTab, selectedTierFilter]);

  const categoryTierOptions = useMemo(() => {
    const set = new Set();
    tiers.forEach((t) => {
      if (t.name) set.add(t.name);
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tiers]);

  return (
    <div className="space-y-4 text-white">
      {/* ======================================================== */}
      {/* 1. TOP STATUS BAR & SESSION CONTROLS                     */}
      {/* ======================================================== */}
      <section className="rounded-2xl border border-[#aeac78]/30 bg-gradient-to-br from-[#2a2422]/95 via-[#1e1918]/95 to-[#161211]/95 p-4 sm:p-5 shadow-xl backdrop-blur-xl text-[#fcf0da]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#f2c46a] to-[#c89632] text-lg text-[#161211] shadow-md">
              <FaGavel />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase">
                  AUCTION ADMIN CONSOLE
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                    state.status === "in_progress"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse"
                      : state.status === "paused"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
                      : state.status === "completed"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-white/10 text-slate-300 border-white/15"
                  }`}
                >
                  {state.status === "in_progress"
                    ? "● LIVE IN PROGRESS"
                    : state.status === "paused"
                    ? "⏸ PAUSED"
                    : state.status === "completed"
                    ? "✓ COMPLETED"
                    : "STANDBY / IDLE"}
                </span>

                {/* ONLINE BIDDING TOGGLE */}
                <button
                  type="button"
                  onClick={() =>
                    sendControlAction("TOGGLE_ONLINE_BIDDING", {
                      enabled: !state.onlineBiddingEnabled,
                    })
                  }
                  disabled={submittingAction}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                    state.onlineBiddingEnabled !== false
                      ? "border-emerald-500/60 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900"
                      : "border-amber-500/60 bg-amber-950/80 text-amber-300 hover:bg-amber-900"
                  }`}
                  title="Toggle team devices online bidding ON or OFF"
                >
                  {state.onlineBiddingEnabled !== false ? (
                    <>
                      <FaToggleOn className="text-emerald-400 text-xs" />
                      <span>Online Bids: Enabled</span>
                    </>
                  ) : (
                    <>
                      <FaToggleOff className="text-amber-400 text-xs" />
                      <span>Admin-Only Mode</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-[#aeac78] mt-0.5">
                Simple Flow: <b>1. Put Athlete on Stage</b> ➔ <b>2. Start Bidding</b> ➔ <b>3. Ongoing Live Auction</b> ➔ <b>4. Click SOLD!</b>
              </p>
            </div>
          </div>

          {/* QUICK LINKS & UTILITIES */}
          <div className="flex flex-wrap items-center gap-2">
            {(state.status === "in_progress" || state.status === "paused") && (
              <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0d0a09] p-1">
                {state.status === "in_progress" ? (
                  <button
                    type="button"
                    onClick={() => sendControlAction("PAUSE")}
                    disabled={submittingAction}
                    className="flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 cursor-pointer"
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
                    className="flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer animate-pulse"
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
                  className="flex items-center gap-1 rounded bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-300 hover:bg-red-500/30 cursor-pointer"
                  title="Stop session"
                >
                  <FaStop className="text-[10px]" />
                  Stop
                </button>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  disabled={submittingAction}
                  className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs font-bold text-[#ccd4d8] hover:bg-white/20 cursor-pointer"
                  title="Reset auction options"
                >
                  <FaRotateLeft className="text-[10px]" />
                  Reset
                </button>
              </div>
            )}

            <a
              href="/auction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-[#f2c46a]/60 bg-[#f2c46a]/15 px-3 py-1.5 text-xs font-black text-[#f2c46a] hover:bg-[#f2c46a]/30 transition-colors shadow-sm"
            >
              Public Arena ↗
            </a>
            <a
              href="/auction/stage"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-cyan-400/60 bg-cyan-950/60 px-3 py-1.5 text-xs font-black text-cyan-300 hover:bg-cyan-900/80 transition-colors shadow-sm"
              title="Open Stage Projector screen for auditorium display"
            >
              Auditorium Screen ↗
            </a>
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isFullscreen
                  ? "border-emerald-500/70 bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900/80"
                  : "border-white/20 bg-white/5 text-[#ccd4d8] hover:bg-white/10"
              }`}
              title="Toggle Fullscreen (F)"
            >
              {isFullscreen ? <FaCompress className="text-[11px]" /> : <FaExpand className="text-[11px]" />}
              <span>{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
              <kbd className="hidden md:inline-block ml-0.5 rounded bg-black/40 px-1 text-[9px] font-mono text-[#8b979d] border border-white/10">F</kbd>
            </button>
            <button
              type="button"
              onClick={fetchAuctionState}
              className="grid size-8 place-items-center rounded-lg border border-white/20 text-[#f2c46a] hover:bg-white/10 cursor-pointer"
              title="Refresh State"
            >
              <FaRotateRight className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* FEEDBACK & ERROR NOTICES */}
        {error && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-red-500/50 bg-red-950/60 p-2.5 text-xs font-semibold text-red-200">
            <span>⚠️ {error}</span>
            <button type="button" onClick={() => setError("")} className="cursor-pointer">
              <FaXmark />
            </button>
          </div>
        )}
        {actionMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/60 p-2.5 text-xs font-bold text-emerald-200">
            <FaCheck className="text-emerald-400" />
            <span>{actionMessage}</span>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 2. ACTIVE AUCTION PODIUM (IF PLAYER ON STAGE)            */}
      {/* ======================================================== */}
      {currentPlayer ? (
        <div className="grid gap-4 lg:grid-cols-12">
          {/* MAIN AUCTIONEER DESK (8 COLS) */}
          <div className="space-y-4 lg:col-span-8">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#f2c46a]/60 bg-gradient-to-br from-[#1d1716] via-[#14100f] to-[#0c0909] p-5 shadow-2xl">
              {/* Podium Header badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <span className="flex items-center gap-2 text-xs font-black uppercase text-[#f2c46a] tracking-wider">
                  <span className="size-2 rounded-full bg-[#f2c46a] animate-ping" />
                  CURRENT ATHLETE UNDER THE HAMMER
                </span>
                <span className="rounded-full bg-black/50 border border-white/10 px-3 py-0.5 text-[11px] font-mono font-bold text-[#aeac78]">
                  Queue #{state.currentPlayerIndex + 1} of {currentQueue.length}
                </span>
              </div>

              {/* ATHLETE IDENTITY & CURRENT STATUS */}
              <div className="flex flex-wrap items-center gap-4 border-b border-white/10 pb-4">
                <div className="relative shrink-0">
                  {currentPlayer.photoUrl ? (
                    <img
                      src={currentPlayer.photoUrl}
                      alt={currentPlayer.fullName}
                      className="size-20 sm:size-24 rounded-2xl border-2 border-[#f2c46a] object-cover shadow-xl"
                    />
                  ) : (
                    <div className="grid size-20 sm:size-24 place-items-center rounded-2xl border-2 border-[#f2c46a] bg-white/10 text-2xl font-black text-[#f2c46a]">
                      {currentPlayer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-[220px]">
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {currentPlayer.fullName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#aeac78]">
                    <span className="rounded-md bg-[#76511d] px-2 py-0.5 font-bold text-[#f2d590]">
                      {currentPlayer.category || state.category || "Player"}
                    </span>
                    <span className="rounded-md border border-white/20 bg-white/5 px-2 py-0.5 text-white">
                      ID: <b>{currentPlayer.playerId}</b>
                    </span>
                    <span className="rounded-md border border-white/20 bg-white/5 px-2 py-0.5">
                      Session: <b>{currentPlayer.session}</b>
                    </span>
                  </div>

                  {/* BASE PRICE DISPLAY & EDIT */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Base Price:</span>
                    {showBasePriceEdit ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#f2c46a] font-bold">৳</span>
                        <input
                          type="number"
                          className="w-24 rounded border border-[#f2c46a] bg-black/60 px-2 py-0.5 text-xs text-white outline-none font-bold"
                          value={editBasePriceVal}
                          onChange={(e) => setEditBasePriceVal(e.target.value)}
                          placeholder="500"
                        />
                        <button
                          type="button"
                          onClick={handleSaveBasePrice}
                          className="rounded bg-[#f2c46a] px-2 py-0.5 text-[11px] font-black text-black hover:brightness-110 cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBasePriceEdit(false)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <b className="text-[#f2c46a] text-sm sm:text-base font-mono">
                          ৳ {currentBasePrice.toLocaleString()}
                        </b>
                        <button
                          type="button"
                          onClick={() => {
                            setEditBasePriceVal(currentBasePrice);
                            setShowBasePriceEdit(true);
                          }}
                          className="rounded border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#aeac78] hover:text-white hover:bg-white/10 cursor-pointer flex items-center gap-1"
                          title="Edit base price for this player"
                        >
                          <FaPenToSquare className="text-[10px]" />
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LIVE BIDDING HUD (HIGHEST BID, LEADING TEAM, STATUS) */}
              <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-black/40 p-4 sm:grid-cols-3 text-center backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-black uppercase text-[#aeac78] tracking-wider">
                    CURRENT HIGHEST BID
                  </p>
                  <p className="text-3xl sm:text-4xl font-black font-mono text-[#f2c46a] mt-0.5">
                    ৳ {state.currentBid ? state.currentBid.toLocaleString() : "0"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Next Minimum: <b>৳ {nextMinimumBid?.toLocaleString()}</b>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-[#aeac78] tracking-wider">
                    LEADING BIDDER TEAM
                  </p>
                  <p className="text-base sm:text-lg font-black text-white truncate mt-1">
                    {state.currentBidderTeamName || "No Bids Yet"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {state.currentBidderTeamName ? "Holding Top Bid" : "Awaiting Opening Bid"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase text-[#aeac78] tracking-wider">
                    AUCTION STATUS
                  </p>
                  <div
                    className={`mt-1 inline-block rounded-lg border px-3 py-1 text-xs font-black uppercase tracking-wider ${
                      hammerColors[state.hammerStatus] || hammerColors.waiting
                    }`}
                  >
                    {state.hammerStatus === "bidding_open"
                      ? "● BIDDING IN PROGRESS"
                      : state.hammerStatus === "sold"
                      ? "✓ SOLD"
                      : state.hammerStatus === "unsold"
                      ? "✕ UNSOLD"
                      : "WAITING TO START"}
                  </div>
                  <p className="mt-1 text-[11px] text-[#aeac78] flex items-center justify-center gap-1 font-mono font-bold">
                    <FaStopwatch />
                    Clock: {state.timerSeconds || 15}s
                  </p>
                </div>
              </div>

              {/* ======================================================== */}
              {/* CORE SIMPLE AUCTIONEER DESK: START BIDDING -> LIVE -> SOLD */}
              {/* ======================================================== */}

              {/* STAGE 1: WAITING TO START (ADMIN CLICKS START BIDDING) */}
              {state.hammerStatus === "waiting" && (
                <div className="mt-5 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-[#2a1f1a] via-[#1a1412] to-[#2a1f1a] p-6 text-center shadow-xl">
                  <div className="max-w-md mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 text-xs font-bold text-amber-300">
                      <span className="size-2 rounded-full bg-amber-400 animate-ping" />
                      <span>Ready on Stage</span>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase">
                      {currentPlayer.fullName} is Ready for Bidding
                    </h4>
                    <p className="text-xs text-[#aeac78]">
                      Starting Base Price: <strong className="text-[#f2c46a] text-sm font-mono">৳ {currentBasePrice.toLocaleString()}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleStartBid}
                      disabled={submittingAction}
                      className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] py-4 text-sm font-black uppercase tracking-wider text-[#141110] hover:brightness-110 active:scale-98 transition shadow-[0_0_30px_rgba(242,196,106,0.4)] cursor-pointer"
                    >
                      <FaPlay className="text-xs" />
                      <span>▶ Start Bidding (৳ {currentBasePrice.toLocaleString()})</span>
                    </button>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => sendControlAction("HAMMER_UNSOLD")}
                        disabled={submittingAction}
                        className="text-xs text-red-400 hover:text-red-300 cursor-pointer underline"
                      >
                        Mark as Unsold Directly
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: BIDDING IS LIVE & ONGOING */}
              {state.hammerStatus === "bidding_open" && (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-[#132218] via-[#0d1711] to-[#080f0b] p-5 shadow-2xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2.5">
                        <span className="relative flex size-3">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                          LIVE AUCTION IN PROGRESS • TEAMS BIDDING
                        </span>
                      </div>
                      <span className="text-xs text-[#aeac78] font-mono">
                        Next Minimum Bid: <b className="text-[#f2c46a]">৳ {nextMinimumBid.toLocaleString()}</b>
                      </span>
                    </div>

                    {/* Spotlight leading bidder */}
                    <div className="my-4 grid gap-3 sm:grid-cols-2 bg-black/40 rounded-xl p-4 border border-white/10">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#aeac78] tracking-wider block">
                          Current Highest Bid
                        </span>
                        <p className="text-3xl font-black font-mono text-[#f2c46a] mt-0.5">
                          ৳ {state.currentBid > 0 ? state.currentBid.toLocaleString() : currentBasePrice.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {state.currentBid > 0 ? "Bids actively being placed by teams" : "Awaiting team opening bid at base price"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#aeac78] tracking-wider block">
                          Leading Bidder Team
                        </span>
                        <p className="text-lg font-black text-white mt-1 truncate">
                          {state.currentBidderTeamName ? (
                            <span className="flex items-center gap-2 text-emerald-300">
                              <FaTrophy className="text-sm text-[#f2c46a]" />
                              {state.currentBidderTeamName}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium italic">No bids placed yet</span>
                          )}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {state.currentBidderTeamName ? "Holding the winning bid" : "Open for any team to bid"}
                        </p>
                      </div>
                    </div>

                    {/* The 2 Core Admin Decisions: 1-Click SOLD or UNSOLD */}
                    <div className="grid gap-3 sm:grid-cols-3 pt-2">
                      <button
                        type="button"
                        onClick={handleAdminSold}
                        disabled={submittingAction || (!state.currentBidderTeam && !activeSelectedTeamId)}
                        className="sm:col-span-2 flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 py-4 text-sm font-black uppercase tracking-wider text-white hover:brightness-110 active:scale-98 transition shadow-[0_0_30px_rgba(16,185,129,0.5)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FaTrophy className="text-base" />
                        <span>
                          {state.currentBidderTeamName
                            ? `SOLD! 🏆 to ${state.currentBidderTeamName} (৳ ${state.currentBid.toLocaleString()})`
                            : "SOLD! 🏆 (Awaiting First Bid)"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => sendControlAction("HAMMER_UNSOLD")}
                        disabled={submittingAction}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-500/50 bg-red-950/70 py-4 text-xs font-black uppercase text-red-200 hover:bg-red-900 active:scale-98 transition cursor-pointer"
                      >
                        <FaXmark className="text-sm" />
                        <span>✕ Pass / Unsold</span>
                      </button>
                    </div>

                    {/* Optional Admin Bid Override (For offline or paddle bids) */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#aeac78] font-bold">Admin Bid Override (Optional):</span>
                        <select
                          value={activeSelectedTeamId}
                          onChange={(e) => setSelectedBidTeamId(e.target.value)}
                          className="rounded-lg border border-white/20 bg-black/60 px-2 py-1 text-xs font-bold text-white outline-none cursor-pointer"
                        >
                          {teams.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name} (৳ {t.pointsRemaining?.toLocaleString()} left)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleAdminSetBid(nextMinimumBid)}
                          disabled={submittingAction}
                          className="rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1 text-xs font-bold text-[#f2c46a] cursor-pointer"
                        >
                          + Bid ৳ {nextMinimumBid.toLocaleString()}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(500)}
                          className="rounded bg-white/5 hover:bg-white/15 px-2 py-0.5 text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          +500
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickIncrement(2000)}
                          className="rounded bg-white/5 hover:bg-white/15 px-2 py-0.5 text-[10px] font-bold text-slate-300 cursor-pointer"
                        >
                          +2k
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomBidInput(!showCustomBidInput)}
                          className="rounded bg-white/5 hover:bg-white/15 px-2 py-0.5 text-[10px] font-bold text-slate-400 cursor-pointer"
                        >
                          Custom
                        </button>
                      </div>
                    </div>
                    {showCustomBidInput && (
                      <div className="mt-2 flex items-center gap-2 justify-end">
                        <input
                          type="number"
                          placeholder="Custom Amount"
                          value={customBidInput}
                          onChange={(e) => setCustomBidInput(e.target.value)}
                          className="w-36 rounded-lg border border-white/20 bg-black/70 px-2 py-1 text-xs font-mono font-bold text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAdminSetBid(customBidInput)}
                          className="rounded-lg bg-[#f2c46a] px-3 py-1 text-xs font-black text-black cursor-pointer"
                        >
                          Submit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STAGE 3: PLAYER SOLD */}
              {state.hammerStatus === "sold" && (
                <div className="mt-5 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-[#122818] via-[#0d1a11] to-[#122818] p-5 text-center shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
                    <FaTrophy className="text-[#f2c46a]" />
                    <span>PLAYER SOLD</span>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase">
                    {currentPlayer.fullName} SOLD TO {state.currentBidderTeamName || "WINNING TEAM"}!
                  </h4>
                  <p className="text-2xl font-black font-mono text-emerald-400 my-1">
                    ৳ {state.currentBid?.toLocaleString()} PTS
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    {currentQueue.length > 1 && (
                      <button
                        type="button"
                        onClick={() => sendControlAction("NEXT_PLAYER")}
                        disabled={submittingAction}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] to-[#d89e30] px-6 py-2.5 text-xs font-black uppercase text-black hover:brightness-110 shadow-lg cursor-pointer"
                      >
                        <span>Next Player in Queue</span>
                        <FaForward />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => sendControlAction("UNDO_PLAYER")}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      <FaArrowRotateLeft className="text-xs" />
                      <span>Undo Sale</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: PLAYER UNSOLD */}
              {state.hammerStatus === "unsold" && (
                <div className="mt-5 rounded-2xl border-2 border-red-500/50 bg-gradient-to-r from-[#291212] via-[#1a0a0a] to-[#291212] p-5 text-center shadow-xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 border border-red-500/40 px-3 py-1 text-xs font-bold text-red-300 mb-2">
                    <FaXmark />
                    <span>PLAYER PASSED / UNSOLD</span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase">
                    {currentPlayer.fullName} is Marked as Unsold
                  </h4>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                    {currentQueue.length > 1 && (
                      <button
                        type="button"
                        onClick={() => sendControlAction("NEXT_PLAYER")}
                        disabled={submittingAction}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] to-[#d89e30] px-6 py-2.5 text-xs font-black uppercase text-black hover:brightness-110 shadow-lg cursor-pointer"
                      >
                        <span>Next Player in Queue</span>
                        <FaForward />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => sendControlAction("UNDO_PLAYER")}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      <FaArrowRotateLeft className="text-xs" />
                      <span>Undo / Re-Auction</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SECONDARY ROW (NEXT, PREV, PREVIEW) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => sendControlAction("RESET", { scope: "CURRENT_PLAYER" })}
                    disabled={submittingAction}
                    className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                  >
                    <FaRotateLeft className="text-[10px]" />
                    Reset Current Bids
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStagePreview(!showStagePreview)}
                    className="rounded-lg border border-cyan-400/50 bg-cyan-950/50 px-2.5 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 cursor-pointer"
                  >
                    {showStagePreview ? "Hide Screen Preview" : "Auditorium Screen Preview 👁"}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {state.currentPlayerIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => sendControlAction("PREV_PLAYER")}
                      disabled={submittingAction}
                      className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
                    >
                      <FaBackward /> Prev
                    </button>
                  )}
                  {currentQueue.length > 1 && (
                    <button
                      type="button"
                      onClick={() => sendControlAction("NEXT_PLAYER")}
                      disabled={submittingAction}
                      className="flex items-center gap-1.5 rounded-lg bg-[#b8872f] px-3.5 py-1 text-xs font-black text-white hover:brightness-110 cursor-pointer shadow"
                    >
                      Next in Queue ({state.currentPlayerIndex + 1}/{currentQueue.length})
                      <FaForward />
                    </button>
                  )}
                </div>
              </div>

              {/* LIVE STAGE PREVIEW */}
              {showStagePreview && (
                <div className="mt-4 rounded-2xl border-2 border-cyan-400/40 bg-black/70 p-4 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
                    <span className="font-mono text-xs font-bold text-cyan-300 uppercase">
                      Auditorium Projector Display Preview (Audience View)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStagePreview(false)}
                      className="text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      ✕ Close
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
                    isBiddingOpen={state.hammerStatus === "bidding_open"}
                  />
                </div>
              )}
            </div>

            {/* QUEUE LIST IF MULTIPLE PLAYERS */}
            {currentQueue.length > 1 && (
              <div className="rounded-xl border border-white/15 bg-[#181413] p-4 shadow-lg">
                <h4 className="text-xs font-black uppercase text-[#f2c46a] tracking-wider mb-2 flex items-center gap-2">
                  <FaLayerGroup />
                  Active Queue ({currentQueue.length} Players)
                </h4>
                <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                  {currentQueue.map((item, idx) => {
                    const isCurrent = idx === state.currentPlayerIndex;
                    return (
                      <div
                        key={item.player || idx}
                        className={`flex items-center justify-between gap-3 rounded-lg border p-2 text-xs transition-all ${
                          isCurrent
                            ? "border-[#f2c46a] bg-[#f2c46a]/15 shadow-md"
                            : "border-white/5 bg-[#120f0e]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid size-6 place-items-center rounded bg-white/10 text-[10px] font-bold">
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-white">{item.fullName}</p>
                            <p className="text-[10px] text-[#aeac78]">
                              ID: {item.playerId} • Base: ৳ {item.basePrice?.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div>
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
                              ON STAGE
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">Upcoming</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: TEAMS PURSE & BID LOG (4 COLS) */}
          <div className="space-y-4 lg:col-span-4">
            {/* TEAMS PURSE & SQUADS */}
            <div className="rounded-2xl border border-white/15 bg-[#181413] p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <h4 className="text-xs font-black uppercase text-[#f2c46a] tracking-wider flex items-center gap-1.5">
                  <FaUsers />
                  Participating Teams ({teams.length})
                </h4>
                <span className="text-[10px] text-[#aeac78]">Max 50,000 pts</span>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {teams.map((team) => {
                  const percentLeft = Math.round((team.pointsRemaining / 50000) * 100);
                  const isLeading = state.currentBidderTeam?.toString() === team._id.toString();
                  const isSelected = activeSelectedTeamId === team._id;

                  return (
                    <div
                      key={team._id}
                      onClick={() => setSelectedBidTeamId(team._id)}
                      className={`rounded-xl border p-2.5 transition-all text-xs cursor-pointer ${
                        isSelected
                          ? "border-[#f2c46a] bg-[#f2c46a]/20 shadow-lg scale-[1.01]"
                          : isLeading
                          ? "border-amber-500/50 bg-amber-500/10"
                          : "border-white/10 bg-[#120f0e] hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {team.name}
                          {isLeading && (
                            <span className="rounded bg-[#b8872f] px-1.5 py-0.2 text-[9px] text-black font-black">
                              LEAD
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-[#f2c46a]">
                          ৳ {team.pointsRemaining?.toLocaleString()}
                        </span>
                      </div>

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

                      <div className="mt-1 flex items-center justify-between text-[10px] text-[#aeac78]">
                        <span>Squad: {team.playerCount} player(s)</span>
                        <span className="text-[9px] underline">Click to select for Option 2</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT BIDS STREAM */}
            <div className="rounded-2xl border border-white/15 bg-[#181413] p-4 shadow-xl">
              <h4 className="text-xs font-black uppercase text-[#f2c46a] tracking-wider mb-2 flex items-center gap-1.5">
                <FaTrophy />
                Live Bids Log
              </h4>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto text-xs pr-1">
                {(state.bidHistory || []).length === 0 ? (
                  <p className="text-center py-4 text-[11px] text-slate-500 italic">No bids recorded yet</p>
                ) : (
                  state.bidHistory.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-[#120f0e] px-2.5 py-1.5 text-[11px] border border-white/5"
                    >
                      <span className="font-semibold text-white truncate max-w-[150px]">{b.teamName}</span>
                      <span className="font-mono font-bold text-[#f2c46a]">
                        ৳ {b.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ======================================================== */}
      {/* 3. QUICK PLAYER CHOOSER (SEARCH & PUT ON STAGE)          */}
      {/* ======================================================== */}
      <section className="rounded-2xl border border-white/15 bg-[#181413] p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
              <FaBolt className="text-[#f2c46a]" />
              SELECT PLAYER FOR AUCTION
            </h3>
            <p className="text-xs text-[#aeac78] mt-0.5">
              Search by name or student ID, then click <b>Put on Stage ⚡</b> to immediately launch.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTierBatchModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
          >
            <FaLayerGroup />
            Launch Category Tier Queue...
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <FaMagnifyingGlass className="absolute left-3 top-3 text-xs text-slate-400" />
            <input
              type="text"
              placeholder="Search player by name, student ID, session, category..."
              value={playerSearchQuery}
              onChange={(e) => setPlayerSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-[#120f0e] pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-[#f2c46a]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#120f0e] p-1">
            <button
              type="button"
              onClick={() => setPlayerFilterTab("available")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                playerFilterTab === "available"
                  ? "bg-[#f2c46a] text-black font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Available (Not Sold)
            </button>
            <button
              type="button"
              onClick={() => setPlayerFilterTab("unsold")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                playerFilterTab === "unsold"
                  ? "bg-[#f2c46a] text-black font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Passed / Unsold
            </button>
            <button
              type="button"
              onClick={() => setPlayerFilterTab("all")}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                playerFilterTab === "all"
                  ? "bg-[#f2c46a] text-black font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              All Approved
            </button>
          </div>

          {categoryTierOptions.length > 0 && (
            <select
              value={selectedTierFilter}
              onChange={(e) => setSelectedTierFilter(e.target.value)}
              className="rounded-xl border border-white/20 bg-[#120f0e] px-3 py-2 text-xs font-bold text-white outline-none cursor-pointer focus:border-[#f2c46a]"
            >
              <option value="ALL">All Categories / Tiers</option>
              {categoryTierOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* PLAYERS LIST GRID */}
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-h-[420px] overflow-y-auto pr-1">
          {filteredPlayers.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-slate-500 italic">
              No players found matching your criteria.
            </div>
          ) : (
            filteredPlayers.map((p) => {
              const isCurrent = currentPlayer?.player?.toString() === p._id?.toString();
              const isSold = p.auctionStatus === "sold";
              const isUnsold = p.auctionStatus === "unsold";

              return (
                <div
                  key={p._id}
                  className={`flex flex-col justify-between rounded-xl border p-3 transition-all ${
                    isCurrent
                      ? "border-[#f2c46a] bg-[#f2c46a]/15 shadow-md"
                      : isSold
                      ? "border-emerald-500/20 bg-emerald-950/20 opacity-80"
                      : "border-white/10 bg-[#120f0e] hover:border-[#f2c46a]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.fullName}
                          className="size-12 rounded-xl object-cover border border-white/20"
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-xl bg-white/10 text-sm font-bold text-slate-300">
                          {p.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs truncate">{p.fullName}</p>
                      <p className="text-[10px] text-[#aeac78]">
                        ID: {p.playerId} • {p.session}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="rounded bg-white/10 px-1.5 py-0.2 text-[9px] text-slate-300">
                          {p.categories?.[0] || p.tier || "Player"}
                        </span>
                        <span className="font-mono text-[10px] text-[#f2c46a] font-bold">
                          ৳ {(p.basePrice || 500).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                      {isSold ? (
                        <span className="text-[10px] font-bold text-emerald-400">
                          SOLD: ৳ {p.soldPrice?.toLocaleString()} ({p.team?.name || "Team"})
                        </span>
                      ) : isUnsold ? (
                        <span className="text-[10px] font-bold text-red-400">UNSOLD</span>
                      ) : isCurrent ? (
                        <span className="text-[10px] font-bold text-amber-300 animate-pulse">ON STAGE</span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Available</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPlayerForAuction(p)}
                      disabled={submittingAction || isCurrent}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#f2c46a] to-[#c89632] px-2.5 py-1 text-[11px] font-black uppercase text-[#141110] hover:brightness-110 disabled:opacity-40 cursor-pointer shadow"
                    >
                      <FaBolt />
                      Put on Stage
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. TIER QUEUE BATCH MODAL                                */}
      {/* ======================================================== */}
      {showTierBatchModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowTierBatchModal(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl border border-white/15 bg-[#161211] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <FaLayerGroup className="text-[#f2c46a]" />
                Launch Category Tier Queue
              </h3>
              <button
                type="button"
                onClick={() => setShowTierBatchModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <FaXmark />
              </button>
            </div>

            <p className="text-xs text-[#aeac78]">
              Select an organized tier batch to start auctioning its players in sequence.
            </p>

            <div className="grid gap-2 max-h-[300px] overflow-y-auto">
              {tiers.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1918] p-3 hover:border-[#f2c46a] transition-all"
                >
                  <div>
                    <span className="rounded bg-[#76511d] px-2 py-0.5 text-[10px] font-bold text-[#f2d590]">
                      {t.category}
                    </span>
                    <h4 className="font-bold text-white text-xs mt-1">{t.name}</h4>
                    <p className="text-[10px] text-[#aeac78]">
                      Base Price: ৳ {t.basePrice?.toLocaleString()} • {t.playerCount || 0} players
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await sendControlAction("START_TIER", { tierId: t._id });
                      setShowTierBatchModal(false);
                    }}
                    disabled={submittingAction}
                    className="flex items-center gap-1.5 rounded-lg bg-[#b8872f] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 cursor-pointer shadow"
                  >
                    <FaPlay className="text-[10px]" />
                    Launch
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowTierBatchModal(false)}
                className="rounded-xl border border-white/20 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. STOP AUCTION MODAL                                    */}
      {/* ======================================================== */}
      {showStopModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowStopModal(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-2xl border border-red-500/50 bg-[#161211] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-red-400 uppercase flex items-center gap-2">
                <FaStop /> Stop Live Auction
              </h3>
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <FaXmark />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to STOP this live auction session? Countdown timers will halt and public bidding will be closed.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowStopModal(false)}
                className="rounded-xl border border-white/20 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
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
                className="rounded-xl bg-red-700 px-4 py-1.5 text-xs font-black uppercase text-white hover:bg-red-600 cursor-pointer shadow"
              >
                Confirm Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. RESET AUCTION MODAL                                   */}
      {/* ======================================================== */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-2xl border border-white/15 bg-[#161211] p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <FaRotateLeft className="text-[#f2c46a]" />
                Reset Auction Console
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <FaXmark />
              </button>
            </div>

            <div className="space-y-3">
              {currentPlayer && (
                <div className="rounded-xl border border-amber-500/30 bg-[#1e1918] p-3 space-y-2">
                  <h4 className="text-xs font-black text-amber-300 uppercase">
                    Reset Current Player Only
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Resets bids for {currentPlayer.fullName} back to ৳ 0. Points are refunded if marked sold.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await sendControlAction("RESET", { scope: "CURRENT_PLAYER" });
                      setShowResetModal(false);
                    }}
                    className="rounded-lg bg-[#76511d] px-3 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#b8872f] hover:text-white cursor-pointer"
                  >
                    Reset Current Player
                  </button>
                </div>
              )}

              <div className="rounded-xl border border-red-500/30 bg-[#1e1918] p-3 space-y-2">
                <h4 className="text-xs font-black text-red-300 uppercase">
                  Reset Entire Live Session to Idle
                </h4>
                <p className="text-[11px] text-slate-400">
                  Clears the active stage podium and queue, returning console to Standby so you can choose any new player.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await sendControlAction("RESET", { scope: "FULL" });
                    setShowResetModal(false);
                  }}
                  className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  Full Reset to Standby
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl border border-white/20 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
