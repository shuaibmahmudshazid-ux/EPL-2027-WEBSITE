"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRightFromBracket,
  FaCalendarCheck,
  FaCalendarDays,
  FaChartBar,
  FaGavel,
  FaKey,
  FaLayerGroup,
  FaListCheck,
  FaShieldHalved,
  FaUserCheck,
  FaUserGroup,
  FaUserPlus,
  FaUsers,
  FaArrowUpRightFromSquare,
  FaCamera,
} from "react-icons/fa6";
import AdminPlayersView from "./admin-players-view";
import AdminAuctionTiersView from "./admin-auction-tiers-view";
import AdminLiveAuctionView from "./admin-live-auction-view";
import AdminLoginForm from "./admin-login-form";
import AdminChangePasswordView from "./admin-change-password-view";
import AdminAddAdminView from "./admin-add-admin-view";
import AdminRegistrationRulesView from "./admin-registration-rules-view";
import AdminTeamKeysView from "./admin-team-keys-view";
import AdminTeamsView from "./admin-teams-view";
import AdminGalleryView from "./admin-gallery-view";
import AdminFixturesView from "./admin-fixtures-view";
import ExportButtonGroup from "./export-button-group";
import {
  exportPlayersToPdf,
  exportPlayersToExcel,
  exportTeamsToPdf,
  exportTeamsToExcel,
} from "../lib/export-utils";

const menu = [
  { label: "Dashboard", icon: FaChartBar },
  { label: "Live Auction", icon: FaGavel },
  { label: "Auction Tiers", icon: FaLayerGroup },
  { label: "Fixtures Management", icon: FaCalendarDays },
  { label: "Teams", icon: FaUserGroup },
  { label: "Players", icon: FaUsers },
  { label: "Player Registration Rules", icon: FaListCheck },
  { label: "Team Keys", icon: FaKey },
  { label: "Tournament Gallery", icon: FaCamera },
];

const accountMenu = [
  { label: "Change Password", icon: FaKey },
  { label: "Add Admin", icon: FaUserPlus },
];

const Stat = ({ icon: Icon, label, value, gradient, textAccent }) => (
  <article className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-[#1c1716] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-[#f2c46a] hover:shadow-2xl">
    <div className="flex items-center gap-4">
      <i className={`grid size-13 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-xl shadow-md not-italic group-hover:scale-105 transition-transform duration-300 border border-white/10`}>
        <Icon />
      </i>
      <div>
        <p className="text-xs font-black uppercase tracking-wider text-[#aeac78]">{label}</p>
        <b className={`text-3xl sm:text-4xl font-black tabular-nums tracking-tight ${textAccent || "text-white"}`}>
          {value ?? "…"}
        </b>
      </div>
    </div>
  </article>
);

const AdminDashboard = () => {
  const [session, setSession] = useState(undefined);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [stats, setStats] = useState({
    totalPlayers: null,
    totalTeams: null,
    pendingPlayers: null,
    totalTiers: null,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/admin/me");
        const text = await response.text();
        const result = text ? JSON.parse(text) : {};
        setSession(response.ok ? result.admin : null);
      } catch {
        setSession(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!session) return;
    const loadStats = async () => {
      try {
        const [playersResponse, teamsResponse, tiersResponse] = await Promise.all([
          fetch("/api/players", { cache: "no-store" }),
          fetch("/api/teams", { cache: "no-store" }),
          fetch("/api/admin/auction-tiers", { cache: "no-store" }),
        ]);

        const [pText, tmText, trText] = await Promise.all([
          playersResponse.text(),
          teamsResponse.text(),
          tiersResponse.text(),
        ]);

        const playersResult = pText ? JSON.parse(pText) : {};
        const teamsResult = tmText ? JSON.parse(tmText) : {};
        const tiersResult = trText ? JSON.parse(trText) : {};

        const players = playersResponse.ok && Array.isArray(playersResult.players) ? playersResult.players : [];
        const teams = teamsResponse.ok && Array.isArray(teamsResult.teams) ? teamsResult.teams : [];
        const tiers = tiersResponse.ok && Array.isArray(tiersResult.tiers) ? tiersResult.tiers : [];

        setStats({
          totalPlayers: players.length,
          totalTeams: teams.length,
          pendingPlayers: players.filter((player) => player.status === "pending").length,
          totalTiers: tiers.length,
        });
      } catch {
        setStats({
          totalPlayers: "—",
          totalTeams: "—",
          pendingPlayers: "—",
          totalTiers: "—",
        });
      }
    };

    loadStats();
    const refreshInterval = window.setInterval(loadStats, 15000);
    return () => window.clearInterval(refreshInterval);
  }, [session]);

  const logout = async () => {
    setShowLogoutConfirm(false);
    await fetch("/api/admin/logout", { method: "POST" });
    setSession(null);
    setActiveSection("Dashboard");
  };

  const handleDownloadPlayersPdf = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    exportPlayersToPdf(data.players || [], {
      title: "Official Players Registry",
      filterDescription: "EPL 2027 Tournament Roster",
    });
  };

  const handleDownloadPlayersExcel = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    exportPlayersToExcel(data.players || []);
  };

  const handleDownloadTeamsPdf = async () => {
    const [tRes, pRes] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/players"),
    ]);
    const tData = await tRes.json();
    const pData = await pRes.json();
    exportTeamsToPdf(tData.teams || [], pData.players || [], {
      title: "Official Teams & Franchises Directory",
      filterDescription: "EPL 2027 Tournament Directory",
    });
  };

  const handleDownloadTeamsExcel = async () => {
    const [tRes, pRes] = await Promise.all([
      fetch("/api/teams"),
      fetch("/api/players"),
    ]);
    const tData = await tRes.json();
    const pData = await pRes.json();
    exportTeamsToExcel(tData.teams || [], pData.players || []);
  };

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center moving-gradient-admin text-sm text-[#f2c46a]">
        <div className="flex flex-col items-center gap-3.5">
          <div className="size-10 rounded-full border-3 border-[#f2c46a] border-t-transparent animate-spin" />
          <span className="font-black text-base text-white">Loading EPL Admin Panel...</span>
        </div>
      </div>
    );
  }

  if (session === null) return <AdminLoginForm onSuccess={setSession} />;

  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen moving-gradient-admin text-white relative overflow-hidden">
      {/* Moving Ambient Aura Orbs across Admin Background */}
      <div className="moving-orb-gold -top-24 right-1/4 size-96 opacity-40" />
      <div className="moving-orb-sage bottom-1/4 -left-20 size-96 opacity-35" />

      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-white/15 bg-[#161211]/98 backdrop-blur-xl p-4 lg:flex lg:flex-col z-30 shadow-2xl">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3.5 px-2 py-2 border-b border-white/15 pb-4">
          <div className="relative size-11 shrink-0">
            <Image
              src="/epl-logo.png"
              alt="EPL Logo"
              fill
              className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              priority
            />
          </div>
          <div>
            <b className="block text-lg font-black tracking-tight text-white leading-none">
              EPL <span className="text-[#f2c46a]">ADMIN</span>
            </b>
            <small className="block text-[8px] tracking-[1.5px] text-[#aeac78] font-black uppercase mt-1">
              ESDM PREMIER LEAGUE
            </small>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5 flex-1">
          {menu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-black transition-all ${
                label === activeSection
                  ? "bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] text-[#141110] shadow-lg font-black scale-[1.02] border border-[#f2c46a]"
                  : "text-white hover:bg-white/10 hover:text-[#f2c46a]"
              }`}
              href="#dashboard"
              onClick={(event) => {
                event.preventDefault();
                setActiveSection(label);
              }}
              key={label}
            >
              <Icon className="text-sm" />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        {/* Account & Bottom Controls */}
        <div className="mt-auto space-y-1.5 border-t border-white/15 pt-4">
          <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-[#aeac78]">
            Account Management
          </p>
          {accountMenu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                label === activeSection
                  ? "bg-gradient-to-r from-[#f2c46a] to-[#d8a543] text-[#141110] shadow-md font-black"
                  : "text-white hover:bg-white/10 hover:text-[#f2c46a]"
              }`}
              href="#dashboard"
              onClick={(event) => {
                event.preventDefault();
                setActiveSection(label);
              }}
              key={label}
            >
              <Icon className="text-sm" />
              <span>{label}</span>
            </a>
          ))}
          <a
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#f2c46a] hover:bg-white/10 transition-all cursor-pointer"
            href="#dashboard"
            onClick={(event) => {
              event.preventDefault();
              setShowLogoutConfirm(true);
            }}
          >
            <FaArrowRightFromBracket className="text-sm" />
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex min-h-screen flex-col lg:ml-[250px] relative z-10">
        {/* TOP BAR */}
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/15 bg-[#181413]/95 backdrop-blur-xl px-6 sticky top-0 z-20 shadow-lg">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">EPL Admin Panel</h1>
            <p className="text-xs text-[#f2c46a] font-bold">ESDM Premier League • Tournament Operations</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auction"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#141110] shadow-md hover:brightness-110 transition border border-[#f2c46a]"
            >
              <FaGavel />
              <span>Live Arena</span>
              <FaArrowUpRightFromSquare className="text-[10px]" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border-2 border-white/20 bg-white/5 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/15 transition shadow-sm"
            >
              View Site
            </Link>

            <div className="hidden text-right text-xs sm:block">
              <b className="block text-white font-mono font-bold">{session.email}</b>
              <small className="block text-[#f2c46a] font-black uppercase">
                {session.role === "superadmin" ? "Super Admin" : "Admin"}
              </small>
            </div>

            <i className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#f2c46a] to-[#c89632] font-black text-[#141110] shadow-md not-italic border border-[#f2c46a]">
              {initials}
            </i>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div id="dashboard" className="mx-auto w-full max-w-[1460px] flex-1 p-5 sm:p-6">
          {activeSection === "Live Auction" ? (
            <AdminLiveAuctionView />
          ) : activeSection === "Players" ? (
            <AdminPlayersView />
          ) : activeSection === "Auction Tiers" ? (
            <AdminAuctionTiersView />
          ) : activeSection === "Teams" ? (
            <AdminTeamsView />
          ) : activeSection === "Player Registration Rules" ? (
            <AdminRegistrationRulesView />
          ) : activeSection === "Team Keys" ? (
            <AdminTeamKeysView />
          ) : activeSection === "Fixtures Management" ? (
            <AdminFixturesView />
          ) : activeSection === "Tournament Gallery" ? (
            <AdminGalleryView />
          ) : activeSection === "Change Password" ? (
            <AdminChangePasswordView />
          ) : activeSection === "Add Admin" ? (
            <AdminAddAdminView />
          ) : (
            <div className="space-y-6">
              {/* STATS OVERVIEW */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  icon={FaUserCheck}
                  label="Total Players"
                  value={stats.totalPlayers}
                  gradient="from-[#aeac78] to-[#444721] text-white"
                  textAccent="text-white"
                />
                <Stat
                  icon={FaShieldHalved}
                  label="Total Teams"
                  value={stats.totalTeams}
                  gradient="from-[#f2c46a] to-[#c89632] text-[#141110]"
                  textAccent="text-[#f2c46a]"
                />
                <Stat
                  icon={FaCalendarCheck}
                  label="Pending Players"
                  value={stats.pendingPlayers}
                  gradient="from-[#e2b353] to-[#989662] text-[#141110]"
                  textAccent="text-white"
                />
                <Stat
                  icon={FaLayerGroup}
                  label="Auction Tiers"
                  value={stats.totalTiers}
                  gradient="from-[#2c2422] to-[#120f0e] text-[#f2c46a]"
                  textAccent="text-[#aeac78]"
                />
              </div>

              {/* DATA EXPORT BANNER */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#aeac78]/30 bg-gradient-to-r from-[#241f1d] via-[#1c1716] to-[#241f1d] p-5 shadow-lg backdrop-blur-xl">
                <div>
                  <h3 className="font-sans text-sm font-black tracking-wide text-white flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#f2c46a] animate-pulse" />
                    TOURNAMENT DATA EXPORTS
                  </h3>
                  <p className="text-xs text-[#aeac78] mt-0.5">
                    Download complete tournament datasets in PDF documents or Excel spreadsheets (.xlsx)
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <ExportButtonGroup
                    label="Download Players Info"
                    variant="gold"
                    pdfLabel="Download all registered players (PDF)"
                    excelLabel="Download players registry (Excel .xlsx)"
                    onExportPdf={handleDownloadPlayersPdf}
                    onExportExcel={handleDownloadPlayersExcel}
                  />

                  <ExportButtonGroup
                    label="Download Teams & Squads"
                    variant="outline"
                    pdfLabel="Download all teams directory (PDF)"
                    excelLabel="Download teams & squad rosters (Excel .xlsx)"
                    onExportPdf={handleDownloadTeamsPdf}
                    onExportExcel={handleDownloadTeamsExcel}
                  />
                </div>
              </div>

              {/* QUICK SHORTCUT CARDS */}
              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#241f1d] to-[#161211] p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-wider text-[#f2c46a]">
                        Tournament Setup
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">
                      Auction Tiers & Base Prices
                    </h3>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#fcf0da] mb-6">
                      Divide registered players into category tiers with baseline starting prices for the auction draft.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Auction Tiers")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#f7d070] to-[#e0a838] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#141110] hover:brightness-110 shadow-lg cursor-pointer transition border border-[#f2c46a]"
                  >
                    <FaLayerGroup />
                    MANAGE AUCTION TIERS
                  </button>
                </div>

                <div className="rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#241f1d] to-[#161211] p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="size-2.5 rounded-full bg-[#aeac78] animate-ping" />
                      <span className="text-xs font-black uppercase tracking-wider text-[#aeac78]">
                        Live Broadcast
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">
                      Host Live Auction Arena
                    </h3>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#fcf0da] mb-6">
                      Start live bidding, advance players on the podium, pause the clock, and finalize team squads.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Live Auction")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#aeac78] hover:bg-[#c8c697] px-5 py-3 text-xs font-black uppercase tracking-wider text-[#141110] shadow-lg cursor-pointer transition border border-[#aeac78]"
                  >
                    <FaGavel />
                    LAUNCH CONTROLLER
                  </button>
                </div>

                <div className="rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#241f1d] to-[#161211] p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Media & Gallery
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white mb-2">
                      Match & Tournament Photos
                    </h3>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#fcf0da] mb-6">
                      Upload and manage matchday photos, team celebrations, trophy ceremonies, and auction moments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Tournament Gallery")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#141110] hover:brightness-110 shadow-lg cursor-pointer transition border border-amber-400"
                  >
                    <FaCamera />
                    MANAGE GALLERY
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-auto flex shrink-0 flex-col sm:flex-row items-center justify-between border-t border-white/15 bg-[#120f0e] px-6 py-4 text-xs font-semibold text-white gap-2">
          <span className="text-[#f2c46a] font-black flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            System Status: All Systems Operational
          </span>
          <span>© EPL 2027 ESDM Premier League</span>
        </footer>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-[400px] rounded-3xl border-2 border-[#f2c46a] bg-[#1a1514] p-7 text-center shadow-2xl">
            <i className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f2c46a]/20 border border-[#f2c46a] text-2xl text-[#f2c46a] not-italic mb-4">
              <FaArrowRightFromBracket />
            </i>
            <h2 className="text-lg font-black text-white">Log out of Admin Panel?</h2>
            <p className="mt-2 text-xs font-semibold text-[#fcf0da] leading-relaxed">
              You will need to sign in again with your admin credentials to access management controls.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl border-2 border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 cursor-pointer"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-gradient-to-r from-[#f2c46a] to-[#c89632] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#141110] hover:brightness-110 shadow-lg cursor-pointer border border-[#f2c46a]"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
