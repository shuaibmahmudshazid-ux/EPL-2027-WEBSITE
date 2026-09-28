"use client";

import { useEffect, useState } from "react";
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

const Stat = ({ icon: Icon, label, value, color }) => (
  <article className="rounded-lg border border-white/10 bg-[#031827] p-4">
    <div className="flex items-center gap-3">
      <i className={`grid size-14 place-items-center rounded-full text-2xl ${color}`}>
        <Icon />
      </i>
      <div>
        <p className="text-xs font-bold uppercase">{label}</p>
        <b className="text-3xl">{value ?? "…"}</b>
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
      <div className="grid min-h-screen place-items-center bg-[#02121f] text-sm text-[#9faab2]">
        Loading admin panel...
      </div>
    );
  }

  if (session === null) return <AdminLoginForm onSuccess={setSession} />;

  const initials = session.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#02121f] text-[#edf2f4]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="fixed inset-y-0 left-0 hidden w-[240px] border-r border-white/15 bg-[#031725] p-3 lg:flex lg:flex-col">
        <div className="mb-7 border-b border-dashed border-white/50 p-3 text-center font-bold">
          ✉ &nbsp; EPL LOGO
        </div>
        <nav className="space-y-1">
          {menu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                label === activeSection
                  ? "bg-[#956a26] text-white"
                  : "text-[#d1dade] hover:bg-white/10"
              }`}
              href="#dashboard"
              onClick={(event) => {
                event.preventDefault();
                setActiveSection(label);
              }}
              key={label}
            >
              <Icon />
              {label}
            </a>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-white/15 pt-3">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase text-[#7d8993]">
            Account
          </p>
          {accountMenu.map(({ label, icon: Icon }) => (
            <a
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                label === activeSection
                  ? "bg-[#956a26] text-white"
                  : "text-[#d1dade] hover:bg-white/10"
              }`}
              href="#dashboard"
              onClick={(event) => {
                event.preventDefault();
                setActiveSection(label);
              }}
              key={label}
            >
              <Icon />
              {label}
            </a>
          ))}
          <a
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#d1dade] hover:bg-white/10"
            href="#dashboard"
            onClick={(event) => {
              event.preventDefault();
              setShowLogoutConfirm(true);
            }}
          >
            <FaArrowRightFromBracket />
            Logout
          </a>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex min-h-screen flex-col lg:ml-[240px]">
        <header className="flex h-[77px] shrink-0 items-center justify-between border-b border-white/15 px-5">
          <div>
            <h1 className="text-2xl font-bold">EPL Admin Panel</h1>
            <p className="text-xs text-[#d4a84f]">ESDM Premier League</p>
          </div>
          <div className="flex items-center gap-4">
            <FaBell className="text-xl text-[#9faab2]" />
            <div className="hidden text-right text-sm sm:block">
              <b>{session.email}</b>
              <small className="block text-[#d4a84f] capitalize">
                {session.role === "superadmin" ? "Super Admin" : "Admin"}
              </small>
            </div>
            <i className="grid size-10 place-items-center rounded-full bg-[#b68d5a] font-bold text-[#091720]">
              {initials}
            </i>
          </div>
        </header>

        <div id="dashboard" className="mx-auto w-full max-w-[1460px] flex-1 p-4">
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
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat
                  icon={FaUserCheck}
                  label="Total Players"
                  value={stats.totalPlayers}
                  color="bg-[#76511d] text-[#e4bf72]"
                />
                <Stat
                  icon={FaShieldHalved}
                  label="Total Teams"
                  value={stats.totalTeams}
                  color="bg-[#103e68] text-[#4aa7ff]"
                />
                <Stat
                  icon={FaCalendarCheck}
                  label="Pending Players"
                  value={stats.pendingPlayers}
                  color="bg-[#6b4a10] text-[#ffbf24]"
                />
                <Stat
                  icon={FaLayerGroup}
                  label="Auction Tiers"
                  value={stats.totalTiers}
                  color="bg-[#5c3e0e] text-[#f2d590]"
                />
              </div>

              {/* QUICK SHORTCUT CARD */}
              <div className="rounded-lg border border-white/10 bg-[#031827] p-5">
                <h3 className="text-sm font-bold text-white mb-1">
                  Ready for Auction Setup?
                </h3>
                <p className="text-xs text-[#9faab2] mb-3">
                  Divide registered players into category tiers (e.g. Batsman Tier A, B, C) to prepare for the live auction bidding process.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveSection("Auction Tiers")}
                  className="inline-flex items-center gap-2 rounded bg-[#b8872f] px-4 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
                >
                  <FaLayerGroup />
                  MANAGE AUCTION TIERS
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="mt-5 flex shrink-0 justify-between border-t border-white/15 px-5 py-4 text-xs text-[#ccd4d8]">
          <span className="text-[#d4a84f]">● System Status: All Systems Operational</span>
          <span>© 2025 EPL - ESDM Premier League.</span>
          <span>Contact Support</span>
        </footer>
      </main>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-[360px] rounded-lg border border-white/15 bg-[#031827] p-5 text-center shadow-2xl">
            <i className="mx-auto grid size-12 place-items-center rounded-full bg-[#7a1f1f] text-xl not-italic text-[#ff9d9d]">
              <FaArrowRightFromBracket />
            </i>
            <h2 className="mt-4 text-base font-bold">Log out of admin panel?</h2>
            <p className="mt-1 text-xs text-[#9faab2]">
              You will need to sign in again to access the admin panel.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                className="flex-1 rounded-md border border-white/25 px-4 py-2.5 text-sm font-bold hover:bg-white/10"
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-md bg-[#c0392b] px-4 py-2.5 text-sm font-bold hover:brightness-110"
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
