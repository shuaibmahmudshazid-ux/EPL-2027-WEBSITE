"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRightFromBracket,
  FaBell,
  FaCalendarCheck,
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

const menu = [
  { label: "Dashboard", icon: FaChartBar },
  { label: "Live Auction", icon: FaGavel },
  { label: "Auction Tiers", icon: FaLayerGroup },
  { label: "Teams", icon: FaUserGroup },
  { label: "Players", icon: FaUsers },
  { label: "Player Registration Rules", icon: FaListCheck },
  { label: "Team Keys", icon: FaKey },
];

const accountMenu = [
  { label: "Change Password", icon: FaKey },
  { label: "Add Admin", icon: FaUserPlus },
];

const Stat = ({ icon: Icon, label, value, gradient, textAccent }) => (
  <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#071927] to-[#040e17] p-5 shadow-lg transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
    <div className="flex items-center gap-4">
      <i className={`grid size-13 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-xl text-white shadow-md not-italic group-hover:scale-105 transition-transform duration-300`}>
        <Icon />
      </i>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <b className={`text-3xl font-black tabular-nums tracking-tight ${textAccent || "text-white"}`}>
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

  if (session === undefined) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#030d17] text-sm text-[#9faab2]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <span>Loading EPL Admin Panel...</span>
        </div>
      </div>
    );
  }

  if (session === null) return <AdminLoginForm onSuccess={setSession} />;

  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#030d17] text-[#edf2f4]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] border-r border-white/10 bg-[#04111d] p-4 lg:flex lg:flex-col">
        {/* Brand Header */}
        <div className="mb-6 flex items-center gap-3 px-2 py-2 border-b border-white/10 pb-4">
          <div className="relative size-10 shrink-0">
            <Image
              src="/epl-logo.png"
              alt="EPL Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <b className="block text-base font-black tracking-tight text-white leading-none">
              EPL <span className="text-[#d4a84f]">ADMIN</span>
            </b>
            <small className="block text-[8px] tracking-[1.5px] text-[#d4a84f] font-bold uppercase mt-1">
              ESDM PREMIER LEAGUE
            </small>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1.5 flex-1">
          {menu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                label === activeSection
                  ? "bg-gradient-to-r from-[#c53030] to-[#991b1b] text-white shadow-md shadow-red-950/50"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
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
        <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
          <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
            Account Management
          </p>
          {accountMenu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                label === activeSection
                  ? "bg-gradient-to-r from-[#c53030] to-[#991b1b] text-white shadow-md"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
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
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold text-red-300 hover:bg-red-950/30 transition-all cursor-pointer"
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
      <main className="flex min-h-screen flex-col lg:ml-[250px]">
        {/* TOP BAR */}
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 bg-[#04111d]/90 backdrop-blur-md px-6 sticky top-0 z-20">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">EPL Admin Panel</h1>
            <p className="text-xs text-[#d4a84f] font-semibold">ESDM Premier League • Tournament Operations</p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auction"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c53030] to-[#991b1b] px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow hover:brightness-110 transition"
            >
              <FaGavel />
              <span>Live Arena</span>
              <FaArrowUpRightFromSquare className="text-[10px]" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              View Site
            </Link>

            <div className="hidden text-right text-xs sm:block">
              <b className="block text-white font-mono">{session.email}</b>
              <small className="block text-[#d4a84f] font-bold uppercase">
                {session.role === "superadmin" ? "Super Admin" : "Admin"}
              </small>
            </div>

            <i className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#d4a84f] to-[#a37424] font-black text-[#05131f] shadow-md not-italic">
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
                  gradient="from-blue-600 to-indigo-800"
                  textAccent="text-blue-300"
                />
                <Stat
                  icon={FaShieldHalved}
                  label="Total Teams"
                  value={stats.totalTeams}
                  gradient="from-amber-500 to-amber-700"
                  textAccent="text-[#d4a84f]"
                />
                <Stat
                  icon={FaCalendarCheck}
                  label="Pending Players"
                  value={stats.pendingPlayers}
                  gradient="from-red-600 to-red-800"
                  textAccent="text-red-300"
                />
                <Stat
                  icon={FaLayerGroup}
                  label="Auction Tiers"
                  value={stats.totalTiers}
                  gradient="from-purple-600 to-purple-800"
                  textAccent="text-purple-300"
                />
              </div>

              {/* QUICK SHORTCUT CARDS */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#071927] to-[#030d17] p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d4a84f]">
                      Tournament Setup
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2">
                    Auction Tiers & Base Prices
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300 mb-5">
                    Divide registered players into category tiers (e.g. Batsman Tier A, B, C) with baseline starting prices to prepare for the live auction draft.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Auction Tiers")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d4a84f] to-[#a37424] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#05131f] hover:brightness-110 shadow-md cursor-pointer transition"
                  >
                    <FaLayerGroup />
                    MANAGE AUCTION TIERS
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#071927] to-[#030d17] p-6 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="size-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                      Live Broadcast
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2">
                    Host Live Auction Arena
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-300 mb-5">
                    Start live bidding, advance players on the podium, manage hammer bids, pause the clock, and finalize team squads.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSection("Live Auction")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c53030] to-[#991b1b] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-md cursor-pointer transition"
                  >
                    <FaGavel />
                    LAUNCH AUCTION CONTROLLER
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-auto flex shrink-0 flex-col sm:flex-row items-center justify-between border-t border-white/10 bg-[#020b13] px-6 py-4 text-xs text-slate-400 gap-2">
          <span className="text-[#d4a84f] font-semibold flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Status: All Systems Operational
          </span>
          <span>© EPL 2027 ESDM Premier League</span>
        </footer>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-[380px] rounded-2xl border border-white/20 bg-gradient-to-b from-[#071927] to-[#030d17] p-6 text-center shadow-2xl">
            <i className="mx-auto grid size-13 place-items-center rounded-2xl bg-red-500/20 border border-red-500/40 text-xl text-red-400 not-italic mb-4">
              <FaArrowRightFromBracket />
            </i>
            <h2 className="text-base font-black text-white">Log out of Admin Panel?</h2>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              You will need to sign in again with your admin credentials to access management controls.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-gradient-to-r from-[#c53030] to-[#991b1b] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:brightness-110 shadow-lg cursor-pointer"
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
