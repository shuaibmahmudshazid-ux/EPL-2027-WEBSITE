"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FaClock,
  FaCheck,
  FaRotateRight,
  FaCalendarDays,
  FaBolt,
  FaHourglassHalf,
} from "react-icons/fa6";

const AdminCountdownSettingsView = () => {
  const [targetDateStr, setTargetDateStr] = useState("");
  const [minutesFromNow, setMinutesFromNow] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentConfig, setCurrentConfig] = useState(null);
  const [nowMs, setNowMs] = useState(0);

  // Update current live clock tick
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/countdown-config", { cache: "no-store" });
      const data = await res.json();
      if (data.targetDate) {
        setCurrentConfig(data);
        // Format for datetime-local (local timezone)
        const d = new Date(data.targetDate);
        const pad = (n) => String(n).padStart(2, "0");
        const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setTargetDateStr(localIso);
      }
    } catch (err) {
      setError(err.message || "Failed to load countdown settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      if (!ignore) {
        await loadConfig();
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, [loadConfig]);

  const handleSaveDateTime = async (e) => {
    e?.preventDefault();
    if (!targetDateStr) {
      setError("Please pick a date and time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const dateObj = new Date(targetDateStr);
      if (Number.isNaN(dateObj.getTime())) {
        throw new Error("Invalid date selected.");
      }

      const res = await fetch("/api/countdown-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: dateObj.toISOString() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save countdown time.");

      setCurrentConfig(data);
      setSuccess(`Countdown target updated to ${dateObj.toLocaleString()} successfully!`);
    } catch (err) {
      setError(err.message || "Unable to save countdown time.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSet = async (mins) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/countdown-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minutesFromNow: mins }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update countdown.");

      setCurrentConfig(data);
      const d = new Date(data.targetDate);
      const pad = (n) => String(n).padStart(2, "0");
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setTargetDateStr(localIso);
      setSuccess(`Countdown started for ${mins} minutes from now! (Target: ${d.toLocaleTimeString()})`);
    } catch (err) {
      setError(err.message || "Failed to set quick timer.");
    } finally {
      setSaving(false);
    }
  };

  const remainingSeconds = currentConfig?.targetTimestamp
    ? Math.max(0, Math.floor((currentConfig.targetTimestamp - nowMs) / 1000))
    : 0;
  const remDays = Math.floor(remainingSeconds / 86400);
  const remHours = Math.floor((remainingSeconds % 86400) / 3600);
  const remMinutes = Math.floor((remainingSeconds % 3600) / 60);
  const remSecs = remainingSeconds % 60;
  const pad2 = (n) => String(n).padStart(2, "0");

  return (
    <section className="mx-auto max-w-[840px] rounded-3xl border-2 border-white/20 bg-[#1a1514] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-white">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-[#f2c46a] to-[#997328] text-black font-black grid place-items-center text-xl shadow-md">
            <FaClock />
          </div>
          <div>
            <h2 className="font-sans font-black text-lg sm:text-xl tracking-wide text-white uppercase flex items-center gap-2">
              Countdown Time Settings
              <span className="size-2 rounded-full bg-[#f2c46a] animate-pulse" />
            </h2>
            <p className="text-xs text-[#aeac78] font-medium">
              Control the public auction countdown clock shown across Home, Auction Arena, & Fullscreen Screen
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadConfig}
          disabled={loading || saving}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <FaRotateRight className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FEEDBACK MESSAGES */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/50 bg-red-950/70 p-3.5 text-xs text-red-200 font-semibold flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}
      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 p-3.5 text-xs text-emerald-200 font-semibold flex items-center gap-2">
          <FaCheck className="text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* CURRENT LIVE TIMER STATUS CARD */}
      <div className="rounded-2xl border border-[#f2c46a]/30 bg-gradient-to-br from-[#241a13]/80 to-[#120f0e] p-5 mb-6 shadow-inner">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#f2c46a] mb-1 flex items-center gap-1.5">
          <FaHourglassHalf className="text-xs" />
          Currently Active Countdown Status
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Target Wall Clock Time:</span>
            <strong className="text-base sm:text-lg text-white font-mono">
              {currentConfig?.targetDate
                ? new Date(currentConfig.targetDate).toLocaleString()
                : "Loading..."}
            </strong>
          </div>

          <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-xl">
            <span className="text-xs font-bold text-[#f2c46a] uppercase">Time Remaining:</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 tabular-nums">
              {remDays > 0 ? `${remDays}d ` : ""}
              {pad2(remHours)}:{pad2(remMinutes)}:{pad2(remSecs)}
            </span>
            {remainingSeconds === 0 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                LIVE NOW
              </span>
            )}
          </div>
        </div>
      </div>

      {/* QUICK PRESET BUTTONS (30 Mins, 15 Mins, 1 Hour, etc.) */}
      <div className="rounded-2xl border border-white/10 bg-[#120f0e] p-5 mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#aeac78] mb-1 flex items-center gap-1.5">
          <FaBolt className="text-amber-400" />
          Quick Countdown Presets (From Right Now)
        </h3>
        <p className="text-[11px] text-slate-400 mb-3.5">
          Click any preset button to instantly start a countdown from the present moment:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: "10 Minutes", mins: 10 },
            { label: "15 Minutes", mins: 15 },
            { label: "30 Minutes (Recommended)", mins: 30, highlight: true },
            { label: "45 Minutes", mins: 45 },
            { label: "1 Hour", mins: 60 },
            { label: "2 Hours", mins: 120 },
            { label: "3 Hours", mins: 180 },
            { label: "5 Hours", mins: 300 },
          ].map((preset) => (
            <button
              key={preset.mins}
              type="button"
              disabled={saving}
              onClick={() => handleQuickSet(preset.mins)}
              className={`rounded-xl px-3 py-2.5 text-xs font-black uppercase tracking-wide transition-all cursor-pointer shadow-sm disabled:opacity-50 text-center ${
                preset.highlight
                  ? "bg-gradient-to-r from-[#f2c46a] to-[#d4a84f] text-black hover:brightness-110 border-2 border-amber-300"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              ⚡ {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Minutes Input */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-300 font-bold">Or enter custom minutes:</span>
          <input
            type="number"
            min="1"
            max="10080"
            value={minutesFromNow}
            onChange={(e) => setMinutesFromNow(Number(e.target.value) || 1)}
            className="w-24 rounded-lg border border-white/20 bg-black/60 px-3 py-1 text-sm font-mono text-white outline-none focus:border-[#f2c46a]"
          />
          <button
            type="button"
            disabled={saving || !minutesFromNow}
            onClick={() => handleQuickSet(minutesFromNow)}
            className="rounded-lg bg-[#f2c46a] hover:bg-[#d97706] text-black px-4 py-1.5 text-xs font-black uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-50"
          >
            Start {minutesFromNow} Mins Countdown
          </button>
        </div>
      </div>

      {/* SPECIFIC DATE & TIME PICKER */}
      <form onSubmit={handleSaveDateTime} className="rounded-2xl border border-white/10 bg-[#120f0e] p-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#aeac78] mb-1 flex items-center gap-1.5">
          <FaCalendarDays className="text-[#f2c46a]" />
          Set Exact Target Date & Time
        </h3>
        <p className="text-[11px] text-slate-400 mb-4">
          Choose a specific calendar date and hour/minute for the auction start time:
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="datetime-local"
            required
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            className="flex-1 rounded-xl border-2 border-white/20 bg-black/70 px-4 py-2.5 text-sm font-mono text-white outline-none focus:border-[#f2c46a]"
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] to-[#d4a84f] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-black hover:brightness-110 shadow-lg cursor-pointer transition-all disabled:opacity-50"
          >
            <FaCheck />
            <span>{saving ? "Saving..." : "Save Exact Date"}</span>
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminCountdownSettingsView;
