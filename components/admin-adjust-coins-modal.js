"use client";

import { useState } from "react";
import { FaCoins, FaXmark, FaCheck, FaRotateRight } from "react-icons/fa6";

export default function AdjustCoinsModal({ team, onClose, onCoinsUpdated }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("add"); // "add" | "set"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentPoints =
    typeof team?.totalPoints === "number"
      ? team.totalPoints
      : typeof team?.points === "number"
      ? team.points
      : 10000;

  const currentSpent =
    typeof team?.pointsSpent === "number" ? team.pointsSpent : 0;

  const currentRemaining =
    typeof team?.pointsRemaining === "number"
      ? team.pointsRemaining
      : Math.max(0, currentPoints - currentSpent);

  const parsedAmount = Number(amount) || 0;
  const calculatedPoints =
    mode === "set"
      ? Math.max(0, parsedAmount)
      : Math.max(0, currentPoints + parsedAmount);
  const calculatedRemaining = Math.max(0, calculatedPoints - currentSpent);

  const quickPills = [
    { label: "+500 PTS", val: 500, m: "add" },
    { label: "+1,000 PTS", val: 1000, m: "add" },
    { label: "+2,000 PTS", val: 2000, m: "add" },
    { label: "+5,000 PTS", val: 5000, m: "add" },
    { label: "-500 PTS", val: -500, m: "add" },
    { label: "-1,000 PTS", val: -1000, m: "add" },
    { label: "Set 10,000 PTS", val: 10000, m: "set" },
  ];

  const handleApplyPill = (val, m) => {
    setMode(m);
    setAmount(String(val));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount === "" || isNaN(parsedAmount)) {
      setError("Please enter a valid point amount.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      const action = mode === "set" ? "set_points" : "adjust_points";
      const res = await fetch(`/api/teams/${team._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          amount: parsedAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update team points.");

      setFeedback(data.message || "Points updated successfully!");
      if (onCoinsUpdated) {
        onCoinsUpdated(data.team, data.pointsRemaining, data.points);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || "Failed to update points.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-2xl border border-amber-500/40 bg-[#031827] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <FaCoins className="text-base" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Manage Team Points / Purse
              </h3>
              <p className="text-xs text-[#8b979d]">
                Manually add, top-up, or adjust budget points for {team?.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
          >
            <FaXmark />
          </button>
        </div>

        {/* FEEDBACK ALERTS */}
        {feedback && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-2.5 text-xs text-emerald-200 font-bold">
            <FaCheck />
            <span>{feedback}</span>
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/40 bg-red-950/60 p-2.5 text-xs text-red-200 font-bold">
            {error}
          </div>
        )}

        {/* CURRENT PURSE STATUS CARDS */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl border border-white/10 bg-[#02121f] p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              Total Budget
            </span>
            <span className="block font-mono text-xs sm:text-sm font-bold text-white mt-0.5">
              {currentPoints.toLocaleString()} PTS
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#02121f] p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase text-slate-400">
              Spent
            </span>
            <span className="block font-mono text-xs sm:text-sm font-bold text-rose-300 mt-0.5">
              {currentSpent.toLocaleString()} PTS
            </span>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center">
            <span className="block text-[10px] font-bold uppercase text-amber-300">
              Remaining
            </span>
            <span className="block font-mono text-xs sm:text-sm font-extrabold text-amber-400 mt-0.5">
              {currentRemaining.toLocaleString()} PTS
            </span>
          </div>
        </div>

        {/* MODE SWITCHER */}
        <div className="mb-3 flex rounded-xl border border-white/15 bg-[#02121f] p-1">
          <button
            type="button"
            onClick={() => setMode("add")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "add"
                ? "bg-amber-500 text-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            + Add / Deduct Points
          </button>
          <button
            type="button"
            onClick={() => setMode("set")}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === "set"
                ? "bg-amber-500 text-black shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Set Exact Total Points
          </button>
        </div>

        {/* QUICK PRESET PILLS */}
        <div className="mb-4">
          <span className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
            Quick Actions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPills.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPill(p.val, p.m)}
                className="rounded-lg border border-white/15 bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 px-2.5 py-1 text-xs font-bold text-slate-200 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
              {mode === "add" ? "Points to Add (or negative to deduct):" : "New Total Points:"}
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder={mode === "add" ? "e.g. 1000 or -500" : "e.g. 12000"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-amber-400"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-amber-400">
                PTS
              </span>
            </div>
          </div>

          {/* REAL-TIME PREVIEW */}
          {amount !== "" && !isNaN(parsedAmount) && (
            <div className="rounded-xl border border-white/10 bg-[#02121f]/80 p-3 text-xs">
              <span className="text-slate-400 block mb-1">Preview after update:</span>
              <div className="flex items-center justify-between font-mono">
                <span>New Total Budget: <b className="text-white">{calculatedPoints.toLocaleString()} PTS</b></span>
                <span>New Remaining: <b className="text-amber-400">{calculatedRemaining.toLocaleString()} PTS</b></span>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amount === ""}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2 text-xs font-black uppercase tracking-wider text-black hover:brightness-110 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <FaRotateRight className="animate-spin text-xs" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FaCoins className="text-xs" />
                  <span>{mode === "add" ? (parsedAmount >= 0 ? "+ Add Points to Team" : "Deduct Points") : "Set Total Points"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

