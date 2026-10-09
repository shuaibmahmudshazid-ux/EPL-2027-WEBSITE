"use client";

import { useMemo } from "react";

/**
 * Format academic session cleanly for display
 * e.g. "2021-2022" -> "Session: 2021-2022"
 */
export const formatPlayerSession = (session = "") => {
  if (!session) return "Session: 2023-2024";
  const s = String(session).trim();
  if (/^session/i.test(s)) return s;
  return `Session: ${s}`;
};

/**
 * Get short session tag for the top-right emblem badge (e.g. "2021-22")
 */
export const getSessionShortLabel = (session = "") => {
  if (!session) return "2023-24";
  const s = String(session).trim();
  const m = s.match(/(\d{4})-(\d{2,4})/);
  if (m) {
    const end = m[2].length === 4 ? m[2].slice(2) : m[2];
    return `${m[1]}-${end}`;
  }
  return s.toUpperCase().slice(0, 10);
};

/**
 * Formats cricket role into prominent title and optional subtitle
 */
export const formatPlayerCategory = (categories = []) => {
  const catList = Array.isArray(categories) ? categories : [categories];
  const primary = (catList[0] || "").toLowerCase();

  if (primary.includes("all-rounder") || primary.includes("all rounder")) {
    return { title: "ALL-ROUNDER", subtitle: "" };
  }

  if (primary.includes("wicket") || primary.includes("wk")) {
    return { title: "WICKET-KEEPER", subtitle: "" };
  }

  if (primary.includes("batsman") || primary.includes("batter")) {
    return { title: primary.includes("batter") ? "BATTER" : "BATSMAN", subtitle: "" };
  }

  if (primary.includes("bowler") || primary.includes("pace") || primary.includes("spin")) {
    return { title: "BOWLER", subtitle: "" };
  }

  return { title: (catList[0] || "BATSMAN").toUpperCase(), subtitle: "" };
};

/**
 * Unified UI Brand Theme matching EPL 2027 Website Colors
 * (Deep Obsidian Midnight #0A0F1D + Championship Gold #F59E0B & Electric Blue Accents)
 */
const UI_THEME = {
  name: "EPL 2027 • OFFICIAL PLAYER",
  capsuleBorder: "border-[#f59e0b]/80 shadow-[0_0_20px_rgba(245,158,11,0.5)]",
  capsuleBg: "bg-[#0c1427]/95",
  capsuleText: "text-[#fbbf24]",
  frameStroke: "#f59e0b",
  frameStrokeDark: "#b45309",
  glowColor: "rgba(245, 158, 11, 0.45)",
  glowSecondary: "rgba(217, 119, 6, 0.3)",
  radialGlow: "radial-gradient(circle at center, rgba(245, 158, 11, 0.22) 0%, rgba(13, 21, 39, 0.08) 70%)",
  roleText: "text-[#fbbf24]",
  bracketColor: "text-[#f59e0b]",
  accentBg: "bg-[#f59e0b]/10",
  accentBorder: "border-[#f59e0b]/40",
  starColor: "#fbbf24",
  badgeBorder: "border-[#f59e0b]/50",
  badgeText: "text-[#fbbf24]",
};

export default function PlayerPhotocard({
  player = {},
  index = 0,
  interactive = true,
  className = "",
}) {
  const sessionString = useMemo(() => {
    return formatPlayerSession(player.session);
  }, [player.session]);

  const shortSession = useMemo(() => {
    return getSessionShortLabel(player.session);
  }, [player.session]);

  const roleInfo = useMemo(() => {
    return formatPlayerCategory(player.categories || [player.category]);
  }, [player]);

  const playerName = player.fullName || "PLAYER NAME";

  return (
    <div
      className={`relative mx-auto flex flex-col items-center select-none group ${
        interactive
          ? "transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
          : ""
      } ${className}`}
      style={{ width: "min(100%, 360px)" }}
    >
      {/* ======================================================== */}
      {/* 1. TOP CAPSULE DOCK (NO TIER BEFORE AUCTION)             */}
      {/* ======================================================== */}
      <div className="relative z-20 -mb-4 flex justify-center">
        {player.isIcon ? (
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-yellow-200 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 px-6 py-1.5 text-center font-sans text-xs font-black uppercase tracking-widest text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.9),0_0_60px_rgba(245,158,11,0.5)] backdrop-blur-md transition-all duration-300 group-hover:scale-105">
            <span className="text-slate-950 text-xs">★</span>
            <span>ICON PLAYER</span>
            <span className="text-slate-950 text-xs">★</span>
          </div>
        ) : (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border-2 px-5 py-1 text-center font-sans text-[11px] font-black uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${UI_THEME.capsuleBorder} ${UI_THEME.capsuleBg} ${UI_THEME.capsuleText}`}
          >
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{UI_THEME.name}</span>
          </div>
        )}
      </div>

      {/* Outer Golden Gradient Ring for Icon Players */}
      <div
        className={`relative w-full ${
          player.isIcon
            ? "p-[3px] rounded-[31px] bg-gradient-to-b from-yellow-300 via-amber-500 via-yellow-400 to-amber-700 animate-icon-ring"
            : ""
        }`}
      >
        {/* ======================================================== */}
        {/* 2. CARD BODY & FUTURISTIC NOTCHED FRAME                  */}
        {/* ======================================================== */}
        <div
          className={`relative w-full overflow-hidden rounded-[28px] p-4 pt-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] ${
            player.isIcon
              ? "bg-gradient-to-b from-[#2e1903] via-[#140b01] to-[#06040b]"
              : "bg-gradient-to-b from-[#0e172c] via-[#091122] to-[#040814] border border-amber-500/20"
          }`}
          style={{
            boxShadow: player.isIcon
              ? "inset 0 0 50px rgba(245,158,11,0.22)"
              : `0 10px 40px ${UI_THEME.glowSecondary}, 0 0 1px 1px ${UI_THEME.glowColor}`,
          }}
        >
          {/* Holographic light sweep sheen across photocard face */}
          <div className="photocard-sheen" />
          {/* SVG Sculpted Chamfer Border Overlay */}
          <svg
            viewBox="0 0 360 540"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute inset-0 size-full z-10"
          >
            <defs>
              <linearGradient id={`goldFrameGrad-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                {player.isIcon ? (
                  <>
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="25%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="75%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#d97706" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="35%" stopColor="#d97706" />
                    <stop offset="70%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#92400e" />
                  </>
                )}
              </linearGradient>
              <filter id={`goldGlow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="3"
                  floodColor={player.isIcon ? "#fbbf24" : "#f59e0b"}
                  floodOpacity={player.isIcon ? "0.95" : "0.65"}
                />
              </filter>
            </defs>

            {/* Outer Chamfered Border */}
            <path
              d="
                M 40 8
                L 115 8
                L 125 18
                L 235 18
                L 245 8
                L 320 8
                L 352 40
                L 352 235
                L 344 245
                L 344 305
                L 352 315
                L 352 500
                L 320 532
                L 215 532
                L 205 522
                L 155 522
                L 145 532
                L 40 532
                L 8 500
                L 8 315
                L 16 305
                L 16 245
                L 8 235
                L 8 40
                Z
              "
              stroke={`url(#goldFrameGrad-${index})`}
              strokeWidth={player.isIcon ? "3.5" : "3"}
              filter={`url(#goldGlow-${index})`}
              fill="none"
            />

            {/* Inner Inset Accent Line */}
            <path
              d="
                M 44 16
                L 112 16
                L 122 24
                L 238 24
                L 248 16
                L 316 16
                L 344 44
                L 344 232
                L 338 240
                L 338 310
                L 344 318
                L 344 496
                L 316 524
                L 218 524
                L 210 516
                L 150 516
                L 142 524
                L 44 524
                L 16 496
                L 16 318
                L 22 310
                L 22 240
                L 16 232
                L 16 44
                Z
              "
              stroke="#f59e0b"
              strokeWidth="1"
              strokeOpacity={player.isIcon ? "0.65" : "0.35"}
              fill="none"
            />

            {/* Corner brackets */}
            <path d="M 12 56 L 12 36 L 36 12 L 56 12" stroke={player.isIcon ? "#fde047" : "#f59e0b"} strokeWidth="2.5" />
            <path d="M 348 56 L 348 36 L 324 12 L 304 12" stroke={player.isIcon ? "#fde047" : "#f59e0b"} strokeWidth="2.5" />
            <path d="M 12 484 L 12 504 L 36 528 L 56 528" stroke={player.isIcon ? "#fde047" : "#f59e0b"} strokeWidth="2.5" />
            <path d="M 348 484 L 348 504 L 324 528 L 304 528" stroke={player.isIcon ? "#fde047" : "#f59e0b"} strokeWidth="2.5" />
          </svg>

          {/* Ambient Stadium Lighting Backdrop & Gradient Rays */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: player.isIcon
                ? "radial-gradient(circle at 50% 20%, rgba(251, 191, 36, 0.4) 0%, rgba(217, 119, 6, 0.22) 40%, rgba(13, 21, 39, 0.1) 80%)"
                : UI_THEME.radialGlow,
            }}
          />

          {player.isIcon && (
            <>
              {/* Top golden radial beam */}
              <div
                className="absolute -top-10 inset-x-0 h-44 pointer-events-none z-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.2) 50%, transparent 80%)",
                }}
              />
              {/* Dynamic diagonal warm light shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-yellow-300/20 pointer-events-none z-0" />
            </>
          )}

          {/* Subtle Horizontal Tech Grid Lines */}
          <div className="absolute inset-x-0 top-24 bottom-24 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:100%_14px] pointer-events-none opacity-40" />

          {/* ======================================================== */}
          {/* 3. CARD HEADER (NAME, SESSION & CRESTS)                  */}
          {/* ======================================================== */}
          <div className="relative z-20 pt-2 px-2 flex items-start justify-between gap-2">
            {/* Left Column: Rating Stars (Vertical with motion twinkle) */}
            <div className="hidden sm:flex flex-col items-center gap-1.5 pt-1 shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  style={{
                    color: player.isIcon ? "#fde047" : UI_THEME.starColor,
                    animationDelay: `${s * 0.35}s`,
                  }}
                  className="text-[10px] leading-none drop-shadow-[0_0_6px_currentColor] animate-twinkle"
                >
                  ★
                </span>
              ))}
            </div>

            {/* Center Column: Featured Tag, Player Name & Academic Session */}
            <div className="flex-1 text-center min-w-0 px-1">
              <span
                className={`inline-block rounded-full px-3.5 py-0.5 text-[9px] font-black tracking-widest uppercase mb-1.5 ${
                  player.isIcon
                    ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.7)] border border-yellow-100"
                    : `${UI_THEME.accentBg} ${UI_THEME.roleText}`
                }`}
              >
                {player.isIcon ? "★ OFFICIAL ICON ★" : "FEATURED"}
              </span>

              {/* PLAYER NAME */}
              <h3
                className={`font-sans font-black text-xl sm:text-2xl uppercase tracking-tight truncate drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] ${
                  player.isIcon
                    ? "bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent"
                    : "text-white"
                }`}
              >
                {playerName}
              </h3>

              {/* ACADEMIC SESSION (ONLY SESSION, NOT BATCH) */}
              <p
                className={`text-xs sm:text-[13px] font-extrabold mt-0.5 tracking-wide drop-shadow ${
                  player.isIcon ? "text-amber-300" : "text-amber-200/90"
                }`}
              >
                {sessionString}
              </p>
            </div>

            {/* Right Column: EPL 2027 Crest & Session Stamp */}
            <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
              {/* EPL Crest Badge */}
              <div
                className={`size-8 sm:size-9 rounded-lg border flex flex-col items-center justify-center p-0.5 shadow-lg ${
                  player.isIcon
                    ? "bg-gradient-to-b from-amber-400 to-amber-600 border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                    : `bg-black/60 ${UI_THEME.badgeBorder}`
                }`}
              >
                <span
                  className={`text-[7px] font-black tracking-tighter leading-none ${
                    player.isIcon ? "text-slate-950" : "text-slate-300"
                  }`}
                >
                  EPL
                </span>
                <span
                  className={`text-[10px] font-black tracking-tight leading-none ${
                    player.isIcon ? "text-slate-950" : UI_THEME.roleText
                  }`}
                >
                  2027
                </span>
                <span className={`text-[6px] ${player.isIcon ? "text-slate-900" : "text-amber-400"}`}>
                  ★★★
                </span>
              </div>

              {/* Short Session Stamp or ICON tag */}
              <div
                className={`rounded border px-1.5 py-0.5 text-[8px] font-black tracking-tighter uppercase ${
                  player.isIcon
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    : `bg-black/50 ${UI_THEME.badgeBorder} ${UI_THEME.badgeText}`
                }`}
              >
                {player.isIcon ? "★ ICON ★" : shortSession}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. CARD CENTER: PLAYER PORTRAIT WITH STADIUM BACKLIGHT   */}
          {/* ======================================================== */}
          <div className="relative z-10 my-3 flex flex-col items-center justify-center min-h-[220px] sm:min-h-[250px]">
            {/* Intense Radial Stadium Halo Glow directly behind shoulders */}
            <div
              className="absolute size-48 sm:size-56 rounded-full blur-2xl pointer-events-none"
              style={{
                background: player.isIcon
                  ? "radial-gradient(circle at center, rgba(251, 191, 36, 0.5) 0%, rgba(245, 158, 11, 0.3) 40%, rgba(180, 83, 9, 0.15) 70%, transparent 85%)"
                  : "#f59e0b",
                opacity: player.isIcon ? 1 : 0.22,
              }}
            />

            {/* Circular framing rings */}
            <div
              className={`absolute size-48 sm:size-56 rounded-full border pointer-events-none ${
                player.isIcon
                  ? "border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "border-dashed border-amber-400 opacity-40"
              }`}
            />

            {/* Player Photo or Stylized Silhouette */}
            <div className="relative z-10">
              {player.photoUrl ? (
                <div
                  className={`relative size-40 sm:size-48 rounded-2xl overflow-hidden ${
                    player.isIcon
                      ? "p-[3px] bg-gradient-to-tr from-yellow-300 via-amber-500 via-yellow-400 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.7),0_15px_35px_rgba(0,0,0,0.9)]"
                      : "border-2 border-amber-400/40 bg-[#040e1f] p-0.5 shadow-[0_15px_35px_rgba(0,0,0,0.8)]"
                  }`}
                >
                  <div className="size-full overflow-hidden rounded-[13px] bg-[#040e1f] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.photoUrl}
                      alt={playerName}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              ) : (
                /* Fallback: Stylized athletic cricket silhouette */
                <div className="relative size-40 sm:size-48 rounded-2xl overflow-hidden border-2 border-amber-400/30 bg-gradient-to-b from-[#0b1c36] via-[#061224] to-[#020712] flex flex-col items-center justify-center shadow-2xl p-2 text-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="size-24 opacity-80 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                  >
                    <circle cx="50" cy="30" r="18" fill="url(#goldSilGrad)" />
                    <path
                      d="M 24 85 C 24 60, 35 52, 50 52 C 65 52, 76 60, 76 85 Z"
                      fill="url(#goldSilGrad)"
                    />
                    <defs>
                      <linearGradient id="goldSilGrad" x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="font-mono text-xl font-black text-white tracking-widest mt-1">
                    {playerName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[9px] font-bold tracking-widest uppercase text-amber-300">
                    CRICKETER
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 5. CARD FOOTER: PLAYING CATEGORY BANNER ONLY             */}
          {/*    (User Rule: ONLY Name, Category, Session displayed!)  */}
          {/* ======================================================== */}
          <div
            className={`relative z-20 pt-2 pb-5 text-center px-2 ${
              player.isIcon
                ? "rounded-2xl bg-gradient-to-r from-transparent via-amber-500/20 to-transparent border-y border-amber-400/40 py-2.5 my-1"
                : ""
            }`}
          >
            {/* Glowing Chevron Category Headline with motion */}
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-base sm:text-lg font-black animate-chevron-left ${
                  player.isIcon
                    ? "text-yellow-300 drop-shadow-[0_0_10px_#fde047]"
                    : `${UI_THEME.bracketColor} drop-shadow-[0_0_8px_currentColor]`
                }`}
              >
                «
              </span>
              <h4
                className={`font-sans font-black text-sm sm:text-base uppercase tracking-wider drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] ${
                  player.isIcon
                    ? "bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                    : UI_THEME.roleText
                }`}
              >
                {roleInfo.title}
              </h4>
              <span
                className={`text-base sm:text-lg font-black animate-chevron-right ${
                  player.isIcon
                    ? "text-yellow-300 drop-shadow-[0_0_10px_#fde047]"
                    : `${UI_THEME.bracketColor} drop-shadow-[0_0_8px_currentColor]`
                }`}
              >
                »
              </span>
            </div>

            {/* Sub-role category or icon designation */}
            {player.isIcon ? (
              <p className="text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent mt-1 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                ★ OFFICIAL ICON CRICKETER ★
              </p>
            ) : roleInfo.subtitle ? (
              <p className="text-[10px] sm:text-[11px] font-semibold text-slate-300 mt-0.5 tracking-wide">
                {roleInfo.subtitle}
              </p>
            ) : null}
          </div>

          {/* ======================================================== */}
          {/* 6. BOTTOM FRAME SHIELD DOCK (EPL 2027)                   */}
          {/* ======================================================== */}
          <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center translate-y-1">
            <div
              className={`rounded-b-lg border-2 border-t-0 px-4 py-0.5 shadow-lg flex items-center gap-1.5 ${
                player.isIcon
                  ? "border-yellow-300 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                  : `bg-[#030914] ${UI_THEME.capsuleBorder}`
              }`}
            >
              <span
                className={`text-[8px] font-black tracking-widest ${
                  player.isIcon ? "text-slate-950" : "text-slate-300"
                }`}
              >
                EPL
              </span>
              <span
                className={`text-[9px] font-black tracking-wider ${
                  player.isIcon ? "text-slate-950" : UI_THEME.roleText
                }`}
              >
                2027
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
