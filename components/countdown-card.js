"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  FaGavel,
  FaExpand,
  FaCompress,
  FaClock,
  FaVolumeHigh,
  FaVolumeXmark,
  FaTrophy,
  FaTowerBroadcast,
  FaArrowRight,
} from "react-icons/fa6";
import CodeMoleculeBrand from "./code-molecule-brand";

const pad = (value) => String(value).padStart(2, "0");

/**
 * Calculates current Bangladesh Standard Time (BST = GMT +6.00).
 */
export const getBDNow = () => {
  const now = new Date();
  return new Date(now.getTime() + 6 * 3600 * 1000);
};

/**
 * Calculates Target Date for Today 5:30 PM BD Time (GMT +6.00).
 * 17:30 BST = 11:30 UTC.
 */
export const getTargetDate = () => {
  const bdNow = getBDNow();
  const y = bdNow.getUTCFullYear();
  const m = bdNow.getUTCMonth();
  const d = bdNow.getUTCDate();
  // 17:30:00 BD time (+06:00) is 11:30:00 UTC
  return new Date(Date.UTC(y, m, d, 11, 30, 0));
};

/**
 * Calculates remaining time for a given target timestamp or Date.
 */
export const getTimeLeft = (targetInput) => {
  let targetTime = null;
  if (targetInput instanceof Date) {
    targetTime = targetInput.getTime();
  } else if (typeof targetInput === "number") {
    targetTime = targetInput;
  } else if (typeof targetInput === "string") {
    targetTime = new Date(targetInput).getTime();
  } else {
    targetTime = getTargetDate().getTime();
  }

  const diff = targetTime - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalSeconds,
    isLive: totalSeconds <= 0,
    targetDate: new Date(targetTime),
  };
};

/**
 * Formats a Date object as a human-readable BD time string.
 */
export const formatTargetBDTime = (dateInput) => {
  if (!dateInput) return "Today at 5:30 PM BD Time";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "Today at 5:30 PM BD Time";

  // Shift to BD time (+6 hours)
  const bdDate = new Date(date.getTime() + 6 * 3600 * 1000);
  const now = new Date();
  const bdNow = new Date(now.getTime() + 6 * 3600 * 1000);

  const isSameDay =
    bdDate.getUTCDate() === bdNow.getUTCDate() &&
    bdDate.getUTCMonth() === bdNow.getUTCMonth() &&
    bdDate.getUTCFullYear() === bdNow.getUTCFullYear();

  const h = bdDate.getUTCHours();
  const m = String(bdDate.getUTCMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const timePart = `${h12}:${m} ${ampm} BD Time`;

  if (isSameDay) {
    return `Today at ${timePart}`;
  }
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const datePart = `${bdDate.getUTCDate()} ${months[bdDate.getUTCMonth()]}`;
  return `${datePart} at ${timePart}`;
};

/**
 * Formats current BD time as "HH:MM:SS AM/PM (GMT +6.00)"
 */
export const getBDTimeString = () => {
  const bdNow = getBDNow();
  const h = bdNow.getUTCHours();
  const m = String(bdNow.getUTCMinutes()).padStart(2, "0");
  const s = String(bdNow.getUTCSeconds()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${m}:${s} ${ampm} (GMT +6.00)`;
};

// Web Audio chime for countdown alerts
const playChime = (isMuted) => {
  if (isMuted || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // browser auto-play policy guard
  }
};

export default function CountdownCard({ className = "" }) {
  const [targetTimestamp, setTargetTimestamp] = useState(null);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft());
  const [bdTimeString, setBdTimeString] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const cardRef = useRef(null);
  const targetRef = useRef(null);

  // Fetch dynamic countdown target configured by admin
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/countdown-config", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.targetTimestamp) {
          setTargetTimestamp(data.targetTimestamp);
          targetRef.current = data.targetTimestamp;
          setTimeLeft(getTimeLeft(data.targetTimestamp));
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  // Fullscreen exit handler
  const exitFullscreen = useCallback(() => {
    if (typeof document !== "undefined") {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    setIsFullscreen(false);
  }, []);

  // Fullscreen toggle handler
  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement && !isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
      playChime(isMuted);
    } else {
      exitFullscreen();
    }
  }, [isFullscreen, isMuted, exitFullscreen]);

  // Initial mount timer & dynamic sync
  useEffect(() => {
    const mountTimeout = setTimeout(() => {
      setMounted(true);
      setBdTimeString(getBDTimeString());
      fetchConfig();
    }, 0);

    const intervalTimer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetRef.current));
      setBdTimeString(getBDTimeString());
    }, 1000);

    // Periodically re-sync countdown target in case admin changed it in background
    const syncTimer = setInterval(() => {
      fetchConfig();
    }, 15000);

    return () => {
      clearTimeout(mountTimeout);
      clearInterval(intervalTimer);
      clearInterval(syncTimer);
    };
  }, [fetchConfig]);

  // Sync fullscreen change events (e.g. user presses native Esc key)
  useEffect(() => {
    const handleFsChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // Keyboard shortcut: Press 'F' to toggle fullscreen, 'ESC' to exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === "f" || e.key === "F") &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName)
      ) {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, toggleFullscreen, exitFullscreen]);

  // Lock body scroll when in fullscreen overlay
  useEffect(() => {
    if (isFullscreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isFullscreen]);

  const displayTime = mounted
    ? timeLeft
    : { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false };

  return (
    <>
      {/* ======================================================== */}
      {/* 1. EMBEDDED HUD CARD (NORMAL VIEW)                       */}
      {/* ======================================================== */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#0c1220]/90 via-[#0a0f1d]/90 to-[#070b16]/95 p-3.5 sm:p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.65)] backdrop-blur-2xl transition-all duration-300 hover:border-amber-500/40 ${className}`}
      >
        {/* Background ambient lighting */}
        <div className="absolute -top-16 -left-16 size-44 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 size-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Row with Status & Fullscreen Button */}
        <div className="relative z-10 flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2 sm:size-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
                  displayTime.isLive ? "bg-emerald-400" : "bg-amber-400"
                } opacity-75`}
              />
              <span
                className={`relative inline-flex size-2 sm:size-2.5 rounded-full ${
                  displayTime.isLive
                    ? "bg-emerald-400 shadow-[0_0_10px_#10B981]"
                    : "bg-amber-400 shadow-[0_0_10px_#F59E0B]"
                }`}
              />
            </span>
            <span
              className={`text-xs sm:text-sm font-black tracking-wider uppercase ${
                displayTime.isLive ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {displayTime.isLive ? "Live Auction Underway" : "Live Auction Countdown"}
            </span>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="group flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-amber-300 hover:text-white transition-all backdrop-blur-md cursor-pointer hover:border-amber-400 shadow-sm"
            title="Open Fullscreen Projector / Arena Clock (Press F)"
          >
            <FaExpand className="text-[10px] sm:text-xs group-hover:scale-110 transition-transform" />
            <span className="hidden xs:inline">Fullscreen</span>
          </button>
        </div>

        {/* Subtitle */}
        <p className="relative z-10 text-[10px] sm:text-[11px] font-medium text-slate-400 mb-3 sm:mb-4 text-center">
          {displayTime.isLive
            ? "Official Player Auction draft is currently in progress • Arena is live!"
            : `Official Player Auction starts ${formatTargetBDTime(displayTime.targetDate)} (GMT +6.00)`}
        </p>

        {/* Digits Display */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-3 py-1 sm:py-2">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center min-w-[44px] xs:min-w-[54px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
              <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
                {pad(displayTime.days)}
              </span>
            </div>
            <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
              DAYS
            </span>
          </div>

          {/* Separator */}
          <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
            :
          </span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center min-w-[44px] xs:min-w-[54px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
              <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
                {pad(displayTime.hours)}
              </span>
            </div>
            <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
              HOURS
            </span>
          </div>

          {/* Separator */}
          <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
            :
          </span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center min-w-[44px] xs:min-w-[54px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
              <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
                {pad(displayTime.minutes)}
              </span>
            </div>
            <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
              MINUTES
            </span>
          </div>

          {/* Separator */}
          <span className="font-mono text-xl xs:text-2xl sm:text-3xl font-black text-amber-400/80 -mt-5 sm:-mt-6">
            :
          </span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center min-w-[44px] xs:min-w-[54px] sm:min-w-[68px] h-12 xs:h-14 sm:h-18 rounded-xl sm:rounded-2xl border border-amber-500/30 bg-[#070A12]/85 px-1.5 sm:px-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_15px_rgba(245,158,11,0.08)]">
              <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] tabular-nums">
                {pad(displayTime.seconds)}
              </span>
            </div>
            <span className="mt-1.5 sm:mt-2 text-[8px] xs:text-[9px] sm:text-[10px] font-black uppercase tracking-[1.5px] sm:tracking-[2px] text-slate-400">
              SECONDS
            </span>
          </div>
        </div>

        {/* Enter Live Auction Button if Live */}
        {displayTime.isLive && (
          <div className="relative z-10 mt-3 flex justify-center">
            <Link
              href="/auction"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all animate-pulse"
            >
              <FaGavel className="text-xs" />
              <span>ENTER LIVE AUCTION ARENA</span>
            </Link>
          </div>
        )}

        {/* Bottom status pill */}
        <div className="relative z-10 mt-3.5 sm:mt-4 pt-3 border-t border-white/10 flex flex-col xs:flex-row items-center justify-between gap-2">
          <Link
            href="/auction"
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] sm:text-xs font-bold text-slate-200 backdrop-blur-md text-center hover:bg-amber-500/20 hover:border-amber-400 transition-all cursor-pointer"
          >
            <span
              className={`size-2 rounded-full ${
                displayTime.isLive ? "bg-emerald-400" : "bg-amber-400"
              } animate-pulse shrink-0`}
            />
            <span>
              {displayTime.isLive ? (
                <>
                  Status: <strong className="text-emerald-400">AUCTION LIVE NOW</strong> • Click to Enter ➔
                </>
              ) : (
                <>
                  Auction Time: <strong className="text-amber-400">Today 5:30 PM BD Time (GMT +6.00)</strong>
                </>
              )}
            </span>
          </Link>

          {/* Fullscreen CTA Hint */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-[10px] font-mono text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FaExpand className="text-[9px]" />
            <span>View Fullscreen</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CINEMATIC FULLSCREEN AUCTION CLOCK (PORTAL OVERLAY)   */}
      {/* ======================================================== */}
      {mounted &&
        isFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col justify-between bg-[#010714] text-white selection:bg-[#F59E0B] selection:text-black h-screen h-[100dvh] max-h-screen overflow-hidden">
            {/* Dramatic Stadium Night Lighting Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
              <div className="absolute -top-40 left-1/4 size-[700px] rounded-full bg-amber-500/15 blur-[160px]" />
              <div className="absolute -bottom-40 right-1/4 size-[700px] rounded-full bg-blue-600/15 blur-[180px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[900px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
              {/* Stadium Scanlines Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-40" />
            </div>

            {/* TOP BAR: BRANDING + LIVE BD TIME + CONTROLS */}
            <header className="relative z-20 shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/10 backdrop-blur-md bg-black/40">
              {/* Left Tournament Logo */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/30 to-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
                  <FaTrophy className="text-base sm:text-xl text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm md:text-base font-black tracking-wider uppercase text-white flex items-center gap-2">
                    <span>ESDM PREMIER LEAGUE 2027</span>
                    <span className="hidden sm:inline-block rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[9px] font-black text-amber-300">
                      OFFICIAL DRAFT
                    </span>
                  </h2>
                  <p className="text-[9px] sm:text-[11px] text-slate-400 font-medium truncate max-w-[240px] sm:max-w-none">
                    Auditorium Stage Screen • Patuakhali Science and Technology University
                  </p>
                </div>
              </div>

              {/* Center Real-Time BD Clock */}
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/60 px-3.5 py-1 backdrop-blur-xl shadow-inner">
                <FaClock className="text-amber-400 text-xs animate-spin-slow" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-300">
                  CURRENT BD TIME:
                </span>
                <span className="font-mono text-xs font-black text-amber-400 tabular-nums">
                  {bdTimeString || "CALCULATING..."}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="grid size-8 sm:size-9 place-items-center rounded-full border border-white/20 bg-black/60 text-amber-400 hover:bg-white/10 hover:border-amber-400/50 backdrop-blur-md cursor-pointer transition-all shadow-sm"
                  title={isMuted ? "Unmute Broadcast Audio" : "Mute Audio"}
                >
                  {isMuted ? (
                    <FaVolumeXmark className="text-xs sm:text-sm" />
                  ) : (
                    <FaVolumeHigh className="text-xs sm:text-sm" />
                  )}
                </button>

                {/* Exit Fullscreen Button */}
                <button
                  type="button"
                  onClick={exitFullscreen}
                  className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 px-3 sm:px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-300 hover:text-white backdrop-blur-md cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-400"
                  title="Exit Fullscreen"
                >
                  <FaCompress className="text-xs" />
                  <span className="text-[11px] sm:text-xs">Exit Fullscreen</span>
                </button>
              </div>
            </header>

            {/* MAIN FULLSCREEN PRESENTATION STAGE (Always perfectly fitted inside viewport) */}
            <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-center items-center px-4 py-2 sm:py-4 max-w-5xl mx-auto w-full text-center">
              {/* Top Animated Status Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-500/15 px-3.5 sm:px-5 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.2)] mb-2 sm:mb-3.5 animate-pulse shrink-0">
                <span
                  className={`size-2 rounded-full ${
                    displayTime.isLive ? "bg-emerald-400" : "bg-amber-400"
                  } animate-ping`}
                />
                <FaGavel className="text-amber-400 text-xs" />
                <span>
                  {displayTime.isLive
                    ? "AUCTION IS LIVE NOW • OFFICIAL DRAFT UNDERWAY"
                    : `LIVE AUCTION COUNTDOWN • ${formatTargetBDTime(displayTime.targetDate).toUpperCase()}`}
                </span>
              </div>

              {/* Grand Main Headline */}
              <h1 className="font-sans font-black text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mb-1 sm:mb-2 shrink-0 leading-tight">
                {displayTime.isLive ? (
                  <>
                    THE AUCTION ARENA <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      IS OFFICIALLY LIVE
                    </span>
                  </>
                ) : (
                  <>
                    COUNTDOWN TO{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                      PLAYER AUCTION
                    </span>
                  </>
                )}
              </h1>

              {/* Subtitle with BD Time target */}
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-medium max-w-xl mx-auto mb-3 sm:mb-5 line-clamp-2 shrink-0">
                {displayTime.isLive ? (
                  "Teams are assembled and bidding on marquee players is live. Join the bidding floor or watch on the projector screen."
                ) : (
                  <>
                    Official Player Auction draft begins{" "}
                    <strong className="text-amber-300 font-black">
                      {formatTargetBDTime(displayTime.targetDate)} (GMT +6.00)
                    </strong>
                    . All franchise captains & draft players assemble.
                  </>
                )}
              </p>

              {/* GIANT AUDITORIUM SCOREBOARD DIGITS (Flexibly scaled so it never overflows screen height) */}
              <div className="flex items-center justify-center gap-1.5 xs:gap-3 sm:gap-4 md:gap-5 my-1 sm:my-2 w-full max-w-4xl shrink">
                {/* Days */}
                <div className="flex flex-col items-center flex-1 max-w-[140px]">
                  <div className="w-full aspect-[4/4.2] flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0a1224]/95 to-[#040814]/95 p-1 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                    <span className="font-mono text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] tabular-nums">
                      {pad(displayTime.days)}
                    </span>
                  </div>
                  <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-black uppercase tracking-[1.5px] sm:tracking-[2.5px] text-slate-400">
                    DAYS
                  </span>
                </div>

                {/* Separator */}
                <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400/80 -mt-5 sm:-mt-7">
                  :
                </span>

                {/* Hours */}
                <div className="flex flex-col items-center flex-1 max-w-[140px]">
                  <div className="w-full aspect-[4/4.2] flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0a1224]/95 to-[#040814]/95 p-1 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                    <span className="font-mono text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] tabular-nums">
                      {pad(displayTime.hours)}
                    </span>
                  </div>
                  <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-black uppercase tracking-[1.5px] sm:tracking-[2.5px] text-slate-400">
                    HOURS
                  </span>
                </div>

                {/* Separator */}
                <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400/80 -mt-5 sm:-mt-7">
                  :
                </span>

                {/* Minutes */}
                <div className="flex flex-col items-center flex-1 max-w-[140px]">
                  <div className="w-full aspect-[4/4.2] flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0a1224]/95 to-[#040814]/95 p-1 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                    <span className="font-mono text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] tabular-nums">
                      {pad(displayTime.minutes)}
                    </span>
                  </div>
                  <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-black uppercase tracking-[1.5px] sm:tracking-[2.5px] text-slate-400">
                    MINUTES
                  </span>
                </div>

                {/* Separator */}
                <span className="font-mono text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black text-amber-400/80 -mt-5 sm:-mt-7">
                  :
                </span>

                {/* Seconds */}
                <div className="flex flex-col items-center flex-1 max-w-[140px]">
                  <div className="w-full aspect-[4/4.2] flex items-center justify-center rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#0a1224]/95 to-[#040814]/95 p-1 sm:p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.15)] backdrop-blur-xl">
                    <span className="font-mono text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] tabular-nums">
                      {pad(displayTime.seconds)}
                    </span>
                  </div>
                  <span className="mt-1 sm:mt-2 text-[9px] sm:text-xs font-black uppercase tracking-[1.5px] sm:tracking-[2.5px] text-slate-400">
                    SECONDS
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS ROW */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 shrink-0">
                <Link
                  href="/auction"
                  className="flex items-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-5 sm:px-7 py-2.5 sm:py-3 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-black shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <FaGavel className="text-xs sm:text-sm" />
                  <span>
                    {displayTime.isLive ? "ENTER LIVE AUCTION ARENA NOW" : "OPEN AUCTION ARENA (STANDBY)"}
                  </span>
                  <FaArrowRight className="text-[10px] sm:text-xs" />
                </Link>

                <Link
                  href="/auction/stage"
                  className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer hover:border-amber-400"
                >
                  <FaTowerBroadcast className="text-amber-400 text-xs sm:text-sm" />
                  <span>Auditorium Stage Screen</span>
                </Link>
              </div>

              {/* Mobile Time indicator */}
              <div className="mt-3 lg:hidden flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-mono text-slate-400 shrink-0">
                <span>BD Time:</span>
                <b className="text-amber-400">{bdTimeString || "--:--:--"}</b>
              </div>
            </main>

            {/* BOTTOM BAR: TOURNAMENT SPECS & DEVELOPER BRANDING (Always visible on screen without scrolling) */}
            <footer className="relative z-20 shrink-0 flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 border-t border-white/10 backdrop-blur-md bg-black/50 text-[11px] text-slate-400">
              <div className="flex items-center gap-2 sm:gap-4 truncate">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold shrink-0">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  EPL 2027 Mega Auction Draft
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">6 Franchise Squads</span>
                <span className="hidden lg:inline">•</span>
                <span className="hidden lg:inline">100+ Star Players</span>
                <span className="hidden xl:inline">•</span>
                <span className="hidden xl:inline">Dynamic Bidding Rules</span>
              </div>

              <div className="flex items-center shrink-0">
                <CodeMoleculeBrand variant="badge" />
              </div>
            </footer>
          </div>,
          document.body
        )}
    </>
  );
}
