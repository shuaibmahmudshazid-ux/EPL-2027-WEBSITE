"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FaMagnifyingGlass,
  FaUserPlus,
  FaUsers,
  FaFilter,
  FaRotateRight,
} from "react-icons/fa6";
import PlayerPhotocard from "./player-photocard";
import ExportButtonGroup from "./export-button-group";
import { exportPlayersToPdf, exportPlayersToExcel } from "../lib/export-utils";

// Official Icon Players displayed at the front of the player directory
export const OFFICIAL_ICON_PLAYERS = [
  {
    _id: "icon-ibrahim-fahad",
    fullName: "IBRAHIM FAHAD",
    session: "2022-2023",
    categories: ["All-Rounder"],
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488334/epl_gallery/a2rgxlgd7hdsf7ryplcu.jpg",
    isIcon: true,
  },
  {
    _id: "icon-sagor-das",
    fullName: "SAGOR DAS",
    session: "2022-2023",
    categories: ["Bowler"],
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488324/epl_gallery/haumsr7y52v33n9llgh8.jpg",
    isIcon: true,
  },
  {
    _id: "icon-ashaduzzaman",
    fullName: "ASHADUZZAMAN",
    session: "2022-2023",
    categories: ["Batsman"],
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488313/epl_gallery/bfyrtbnijcmvrygpentz.jpg",
    isIcon: true,
  },
  {
    _id: "icon-masud-taha",
    fullName: "MASUD TAHA",
    session: "2022-2023",
    categories: ["All-Rounder"],
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488300/epl_gallery/oqz8unetdw59kup8vjnx.jpg",
    isIcon: true,
  },
  {
    _id: "icon-salman-hasan",
    fullName: "SALMAN HASAN",
    session: "2022-2023",
    categories: ["Batsman"],
    photoUrl: "https://res.cloudinary.com/kchs0bfz/image/upload/v1791488221/epl_gallery/j5e4kll9wneqyluo4w3y.jpg",
    isIcon: true,
  },
];

// High-fidelity starter cards matching the official tournament arena
const SHOWCASE_FALLBACKS = [
  {
    _id: "demo-1",
    fullName: "SABBIR RAHMAN",
    session: "2021-2022",
    categories: ["All-Rounder"],
    photoUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=500&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-2",
    fullName: "MD. RIFAT HOSSAIN",
    session: "2021-2022",
    categories: ["Batsman"],
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
  },
  {
    _id: "demo-3",
    fullName: "ASHIKUR RAHMAN",
    session: "2022-2023",
    categories: ["Bowler"],
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
  },
];

const categoryFilters = [
  "All Roles",
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Wicket Keeper",
];

const sessionFilters = [
  "All Sessions",
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
  "Alumni",
];

/**
 * Parse session into numeric sort key (earliest session first, 2025-26 last)
 */
const getSessionSortOrder = (session = "") => {
  if (!session) return 9999;
  const s = String(session).trim().toLowerCase();

  if (s.includes("alumni")) return 2015;

  // Extract 4-digit start year, e.g. "2021-2022" -> 2021
  const match = s.match(/(20\d{2})/);
  if (match) {
    return parseInt(match[1], 10);
  }

  // If number like "14", "15"
  const numMatch = s.match(/(\d+)/);
  if (numMatch) {
    return 2007 + parseInt(numMatch[1], 10);
  }

  return 9999;
};

export default function PlayerShowcaseSection() {
  const [players, setPlayers] = useState([...OFFICIAL_ICON_PLAYERS, ...SHOWCASE_FALLBACKS]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Roles");
  const [selectedSession, setSelectedSession] = useState("All Sessions");

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/players", { cache: "no-store" });
      const data = await res.json();
      const fetched = Array.isArray(data?.players) && data.players.length > 0
        ? data.players
        : SHOWCASE_FALLBACKS;

      // Filter out any duplicates if an icon player was registered in regular players
      const nonIconFetched = fetched.filter(
        (p) =>
          !OFFICIAL_ICON_PLAYERS.some(
            (icon) =>
              icon.fullName.toLowerCase() === (p.fullName || "").trim().toLowerCase()
          )
      );

      setPlayers([...OFFICIAL_ICON_PLAYERS, ...nonIconFetched]);
    } catch {
      setPlayers([...OFFICIAL_ICON_PLAYERS, ...SHOWCASE_FALLBACKS]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  // Filtered and Session-wise sorted list (Icon players strictly first, earliest session first, 2025-26 last)
  const filteredPlayers = useMemo(() => {
    const list = players.filter((p) => {
      // Search
      const name = (p.fullName || "").toLowerCase();
      const q = search.trim().toLowerCase();
      if (q && !name.includes(q)) return false;

      // Category
      if (selectedCategory !== "All Roles") {
        const catStr = (
          Array.isArray(p.categories) ? p.categories.join(" ") : p.categories || ""
        ).toLowerCase();
        if (selectedCategory === "Batsman" && !catStr.includes("bat")) return false;
        if (selectedCategory === "Bowler" && !catStr.includes("bowl")) return false;
        if (
          selectedCategory === "All-Rounder" &&
          !catStr.includes("all-round") &&
          !catStr.includes("all round")
        )
          return false;
        if (
          selectedCategory === "Wicket Keeper" &&
          !catStr.includes("wicket") &&
          !catStr.includes("wk")
        )
          return false;
      }

      // Session
      if (selectedSession !== "All Sessions") {
        const session = (p.session || "").toLowerCase();
        const target = selectedSession.toLowerCase();
        const normSession = session.replace(/[^0-9a-z]/g, "");
        const normTarget = target.replace(/[^0-9a-z]/g, "");
        const matches =
          session.includes(target) ||
          target.includes(session) ||
          normSession.includes(normTarget) ||
          normTarget.includes(normSession) ||
          (normSession.startsWith("2022") && normTarget.startsWith("2022"));
        if (!matches) return false;
      }

      return true;
    });

    // Sort order:
    // 1. Icon players ALWAYS at the very front
    // 2. Icon players sorted alphabetically among themselves
    // 3. Regular players sorted session-wise (earliest session first, 2025-26 last)
    // 4. Regular players sorted alphabetically for each session (case-insensitive)
    return [...list].sort((a, b) => {
      if (a.isIcon && !b.isIcon) return -1;
      if (!a.isIcon && b.isIcon) return 1;

      if (a.isIcon && b.isIcon) {
        const nameA = (a.fullName || "").trim().toLowerCase();
        const nameB = (b.fullName || "").trim().toLowerCase();
        return nameA.localeCompare(nameB, "en", { sensitivity: "base", numeric: true });
      }

      const orderA = getSessionSortOrder(a.session);
      const orderB = getSessionSortOrder(b.session);
      if (orderA !== orderB) return orderA - orderB;

      // Alphabetical order for each session (case-insensitive)
      const nameA = (a.fullName || "").trim().toLowerCase();
      const nameB = (b.fullName || "").trim().toLowerCase();
      return nameA.localeCompare(nameB, "en", { sensitivity: "base", numeric: true });
    });
  }, [players, search, selectedCategory, selectedSession]);

  return (
    <section
      id="players"
      className="py-16 sm:py-24 border-b border-white/10 bg-[#070B16] relative overflow-hidden text-white"
    >
      {/* ======================================================== */}
      {/* 1. ARENA FLOODLIGHT VOLUMETRIC BEAMS & GLOWS             */}
      {/* ======================================================== */}
      <div className="absolute top-0 -left-20 size-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-0 -right-20 size-[500px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 size-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      {/* Floodlight graphics in top corners matching the image */}
      <div className="pointer-events-none absolute top-4 left-4 sm:top-8 sm:left-10 z-0 opacity-40 hidden md:block">
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(56,189,248,0.3)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-white shadow-[0_0_8px_white]"
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute top-4 right-4 sm:top-8 sm:right-10 z-0 opacity-40 hidden md:block">
        <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="size-2 rounded-full bg-amber-200 shadow-[0_0_8px_#fef08a]"
            />
          ))}
        </div>
      </div>

      {/* Arena side vertical marquee labels */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 hidden 2xl:block -rotate-90 origin-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500/60 select-none whitespace-nowrap">
        ESDM PREMIER LEAGUE 2027 • OFFICIAL PLAYER ARENA
      </div>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden 2xl:block rotate-90 origin-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500/60 select-none whitespace-nowrap">
        Faculty of ESDM, PSTU • Organized by Addyanta-14
      </div>

      <div className="mx-auto w-[min(1450px,calc(100%-24px))] sm:w-[min(1450px,calc(100%-36px))] min-[781px]:w-[min(1450px,calc(100%-64px))] relative z-10">
        
        {/* ======================================================== */}
        {/* 2. SECTION HEADER (TITLE, SUBTITLE & BADGE)              */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {/* Top arena banner metadata matching user image */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/10 pb-3 mb-6 max-w-2xl mx-auto">
            <span>ESDM PREMIER LEAGUE 2027</span>
            <span className="text-amber-400 animate-pulse">• OFFICIAL PLAYER ARENA •</span>
            <span>FACULTY OF ESDM, PSTU</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 mb-3.5 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-300">
              OFFICIAL PLAYER INFORMATIONS • PHOTOCARDS
            </span>
          </div>

          <h2 className="font-sans font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            PLAYER <span className="text-amber-400">INFORMATIONS</span>
          </h2>

          <p className="mt-3 text-xs sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Official photocard directory of participating athletes. View verified player names, playing categories (Batsman, Bowler, All-Rounder), and academic sessions.
          </p>

          {/* Export & Actions Toolbar */}
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <ExportButtonGroup
              label="Download Player Directory"
              variant="outline"
              count={filteredPlayers.length}
              pdfLabel="Download player directory as PDF"
              excelLabel="Download player registry as Excel (.xlsx)"
              onExportPdf={() => {
                exportPlayersToPdf(filteredPlayers, {
                  title: "Official Players Registry",
                  filterDescription: "ESDM Premier League 2027 • Player Photocards",
                });
              }}
              onExportExcel={() => {
                exportPlayersToExcel(filteredPlayers);
              }}
            />

            <Link
              href="/player-registration"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-[#0A0F1D] hover:brightness-110 shadow-lg transition-all"
            >
              <FaUserPlus className="text-xs" />
              <span>Register Player</span>
            </Link>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. FILTER CONTROLS (SEARCH, ROLE, BATCH, TIER)           */}
        {/* ======================================================== */}
        <div className="mb-10 rounded-2xl border border-white/10 bg-[#0B1426]/80 p-4 sm:p-5 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="flex min-w-[260px] flex-1 items-center gap-2.5 rounded-xl border border-white/15 bg-[#050C1A] px-3.5 py-2.5 text-xs text-slate-400">
              <FaMagnifyingGlass className="text-cyan-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by player name..."
                className="w-full bg-transparent text-white outline-none placeholder:text-slate-500 text-xs sm:text-sm font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns / Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#050C1A] px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-amber-400 cursor-pointer"
              >
                {categoryFilters.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Session Filter */}
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="rounded-xl border border-white/15 bg-[#050C1A] px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-amber-400 cursor-pointer"
              >
                {sessionFilters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Refresh button */}
              <button
                type="button"
                onClick={loadPlayers}
                disabled={loading}
                className="rounded-xl border border-white/15 bg-white/5 p-2 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
                title="Refresh Players"
              >
                <FaRotateRight className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Quick Counter Info */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <b className="text-white">{filteredPlayers.length}</b> player photocards
            </span>
            {(search || selectedCategory !== "All Roles" || selectedSession !== "All Sessions") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All Roles");
                  setSelectedSession("All Sessions");
                }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. PHOTOCARD GRID DISPLAY                                */}
        {/* ======================================================== */}
        {filteredPlayers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 p-12 text-center text-slate-400 max-w-md mx-auto">
            <FaUsers className="text-4xl mx-auto mb-3 text-slate-500 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">No Players Found</h3>
            <p className="text-xs text-slate-400">
              No registered player matches your current search or filter combination.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 justify-items-center">
            {filteredPlayers.map((player, idx) => (
              <PlayerPhotocard
                key={player._id || idx}
                player={player}
                index={idx}
                interactive={true}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
