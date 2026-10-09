"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaMagnifyingGlass,
  FaPlus,
  FaRotateRight,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import ExportButtonGroup from "./export-button-group";
import {
  exportPlayersToPdf,
  exportPlayersToExcel,
} from "../lib/export-utils";
import PlayerPhotocard from "./player-photocard";

const statusBadge = {
  pending: "bg-[#856406] text-yellow-200",
  approved: "bg-[#76511d] text-[#f2d590]",
  rejected: "bg-[#7a1f1f] text-[#ff9d9d]",
};

const DetailRow = ({ label, value }) => (
  <div className="border-b border-white/10 py-2">
    <p className="text-[10px] font-bold uppercase text-[#8b979d]">
      {label}
    </p>
    <p className="mt-0.5 text-sm">{value || "—"}</p>
  </div>
);

const PlayerDetailModal = ({ player, allTiers, allTeams = [], onUpdateTier, onUpdateTeam, onClose }) => {
  const [modalTab, setModalTab] = useState("details"); // "details" | "photocard"
  const currentTierId =
    player.auctionTier?._id ||
    (typeof player.auctionTier === "string" ? player.auctionTier : "");
  const currentTeamId =
    player.team?._id ||
    (typeof player.team === "string" ? player.team : "");

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* TAB TOGGLE */}
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalTab("details")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                modalTab === "details"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Player Details
            </button>
            <button
              type="button"
              onClick={() => setModalTab("photocard")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                modalTab === "photocard"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ★ Official Photocard
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ExportButtonGroup
              label="Download Slip"
              variant="compact"
              align="right"
              pdfLabel="Download profile slip as PDF"
              excelLabel="Download profile data as Excel"
              onExportPdf={() => {
                exportPlayersToPdf([player], {
                  title: `PLAYER PROFILE - ${player.fullName}`,
                  filterDescription: `Student ID: ${player.playerId} • Session: ${player.session}`,
                });
              }}
              onExportExcel={() => {
                const cleanName = (player.fullName || "Player").replace(/[^a-zA-Z0-9_-]/g, "_");
                exportPlayersToExcel([player], {
                  fileName: `EPL_2027_Player_${cleanName}.xlsx`,
                });
              }}
            />

            <button
              className="rounded p-1.5 text-[#9faab2] hover:text-white cursor-pointer"
              type="button"
              onClick={onClose}
              aria-label="Close"
            >
              <FaXmark className="text-lg" />
            </button>
          </div>
        </div>

        {modalTab === "photocard" ? (
          <div className="py-4 flex justify-center">
            <PlayerPhotocard player={player} interactive={false} />
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <div className="relative shrink-0">
                {player.photoUrl ? (
                  <img
                    className="size-16 rounded-full object-cover"
                    src={player.photoUrl}
                    alt={player.fullName}
                  />
                ) : (
                  <div className="grid size-16 place-items-center rounded-full bg-white/10 text-xs text-[#8b979d]">
                    No Photo
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  {player.fullName}
                </h2>

                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  <b
                    className={`inline-block rounded px-1.5 py-0.5 text-[10px] capitalize ${
                      statusBadge[player.status]
                    }`}
                  >
                    {player.status}
                  </b>
                  {player.auctionTier?.name || player.tier ? (
                    <b className="inline-block rounded border border-[#d4a84f]/40 bg-[#76511d] px-1.5 py-0.5 text-[10px] text-[#f2d590]">
                      {player.auctionTier?.name || player.tier}
                    </b>
                  ) : (
                    <b className="inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-[#8b979d]">
                      No Tier
                    </b>
                  )}
                </div>
              </div>
            </div>

        <div className="grid gap-x-4 min-[520px]:grid-cols-2">
          <DetailRow label="Phone" value={player.phone} />
          <DetailRow label="Student ID" value={player.playerId} />
          <DetailRow
            label="Registration Number"
            value={player.registrationNumber}
          />
          <DetailRow label="Email" value={player.email} />
          <DetailRow label="Session" value={player.session} />
          <DetailRow
            label="Category"
            value={player.categories?.join(", ")}
          />
          <DetailRow
            label="Auction Tier"
            value={player.auctionTier?.name || player.tier || "Unassigned"}
          />
          <DetailRow
            label="Base Price"
            value={
              player.basePrice
                ? `৳ ${player.basePrice}`
                : player.auctionTier?.basePrice
                ? `৳ ${player.auctionTier.basePrice}`
                : "৳ 0"
            }
          />
          <DetailRow
            label="Team"
            value={player.team?.name || "Unassigned"}
          />
          <DetailRow
            label="Registered On"
            value={new Date(player.createdAt).toLocaleString()}
          />
        </div>

        {/* QUICK TIER ASSIGNMENT IN MODAL */}
        <div className="mt-4 rounded border border-white/10 bg-[#02121f] p-3">
          <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
            Assign / Change Auction Tier
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded border border-white/20 bg-[#031827] px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4a84f]"
              value={currentTierId || (player.tier ? "__named" : "__unassign")}
              onChange={(e) => onUpdateTier(player._id, e.target.value)}
            >
              <option value="__unassign">Unassigned (No Tier)</option>
              {allTiers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.category}: {t.name} (Base: ৳ {t.basePrice})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QUICK TEAM ASSIGNMENT IN MODAL */}
        <div className="mt-3 rounded border border-white/10 bg-[#02121f] p-3">
          <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
            Assign / Change Team (Squad)
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 rounded border border-white/20 bg-[#031827] px-3 py-1.5 text-xs text-white outline-none focus:border-[#d4a84f]"
              value={currentTeamId || "__unassign"}
              onChange={(e) => onUpdateTeam(player._id, e.target.value)}
            >
              <option value="__unassign">Unassigned (Free Agent / No Team)</option>
              {allTeams.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} (Key: {t.uniqueKey})
                </option>
              ))}
            </select>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

const statuses = ["pending", "approved", "rejected"];

const selectClass =
  "rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-white";

const columns = [
  "#",
  "Photo",
  "Full Name",
  "Phone",
  "Student ID",
  "Reg. Number",
  "Email",
  "Session",
  "Category",
  "Tier",
  "Status",
  "Team",
  "Registered",
  "Actions",
];

const AddPlayerModal = ({ allTeams = [], allTiers = [], onClose, onPlayerCreated }) => {
  const [fullName, setFullName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [phone, setPhone] = useState("");
  const [session, setSession] = useState("2023-24");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState(["Batter"]);
  const [teamId, setTeamId] = useState("");
  const [tierId, setTierId] = useState("");
  const [soldPrice, setSoldPrice] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !playerId.trim() || !phone.trim() || !session) {
      setError("Name, Student ID, Phone, and Session are required.");
      return;
    }
    if (!categories.length) {
      setError("Please select at least one category.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          playerId: playerId.trim(),
          phone: phone.trim(),
          registrationNumber: registrationNumber.trim() || undefined,
          email: email.trim() || undefined,
          session,
          categories,
          teamId: teamId || undefined,
          tierId: tierId || undefined,
          soldPrice: teamId ? Number(soldPrice) || 0 : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create player.");

      onPlayerCreated(data.player);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create player.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-[580px] overflow-y-auto rounded-2xl border border-white/20 bg-[#031827] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#d4a84f] to-[#997328] text-base text-black font-black">
              <FaPlus />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Player</h2>
              <p className="text-xs text-[#8b979d]">Register player directly into the player pool or franchise squad</p>
            </div>
          </div>
          <button
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            type="button"
            onClick={onClose}
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/50 bg-red-950/70 p-3 text-xs text-red-200 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tamim Iqbal"
              className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2 text-white outline-none focus:border-[#d4a84f]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Student ID (7 digits) *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2102001"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2 text-white outline-none focus:border-[#d4a84f]"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Phone (11 digits) *</label>
              <input
                type="text"
                required
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2 text-white outline-none focus:border-[#d4a84f]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Reg. Number (5 digits)</label>
              <input
                type="text"
                placeholder="e.g. 12345"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f]"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Session *</label>
              <input
                type="text"
                required
                placeholder="e.g. 2023-24"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f]"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Email</label>
              <input
                type="email"
                placeholder="optional"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Categories *</label>
            <div className="flex flex-wrap gap-3">
              {["Batter", "Bowler", "All-Rounder", "Wicket Keeper"].map((cat) => (
                <label key={cat} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) setCategories([...categories, cat]);
                      else setCategories(categories.filter((c) => c !== cat));
                    }}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Assign to Team (Optional)</label>
              <select
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f] cursor-pointer"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">-- No Team (Free Agent) --</option>
                {allTeams.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Auction Tier (Optional)</label>
              <select
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f] cursor-pointer"
                value={tierId}
                onChange={(e) => setTierId(e.target.value)}
              >
                <option value="">-- No Tier --</option>
                {allTiers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.category}: {t.name} (Base: ৳ {t.basePrice})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {teamId && (
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">Sold / Purchase Price (৳)</label>
              <input
                type="number"
                min="0"
                step="100"
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 font-mono text-white outline-none focus:border-[#d4a84f]"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl px-4 py-2 font-semibold text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-[#d4a84f] to-[#b8872f] px-5 py-2 font-bold text-black hover:brightness-110 disabled:opacity-40 cursor-pointer shadow-lg"
            >
              {submitting ? "Creating..." : "Create Player"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPlayersView = () => {
  const [players, setPlayers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [allTiers, setAllTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [session, setSession] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [team, setTeam] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // =========================
  // LOAD PLAYERS & TIERS
  // =========================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [playersRes, tiersRes, teamsRes] = await Promise.all([
        fetch("/api/players", { cache: "no-store" }),
        fetch("/api/admin/auction-tiers", { cache: "no-store" }),
        fetch("/api/teams", { cache: "no-store" }),
      ]);

      const [pText, tText, tmText] = await Promise.all([
        playersRes.text(),
        tiersRes.text(),
        teamsRes.text(),
      ]);

      const playersResult = pText ? JSON.parse(pText) : {};
      const tiersResult = tText ? JSON.parse(tText) : {};
      const teamsResult = tmText ? JSON.parse(tmText) : {};

      if (!playersRes.ok) {
        throw new Error(playersResult.error || "Unable to load players.");
      }

      setPlayers(playersResult.players || []);
      if (tiersRes.ok) {
        setAllTiers(tiersResult.tiers || []);
      }
      if (teamsRes.ok) {
        setAllTeams(teamsResult.teams || []);
      }
    } catch (err) {
      setError(err.message || "Unable to load players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    const refreshInterval = window.setInterval(loadData, 20000);

    const refreshOnFocus = () => loadData();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(refreshInterval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, []);

  // =========================
  // FILTER OPTIONS
  // =========================
  const sessions = useMemo(
    () =>
      [...new Set(players.map((p) => p.session))]
        .filter(Boolean)
        .sort(),
    [players]
  );

  const categoryOptions = useMemo(
    () =>
      [
        ...new Set(
          players.flatMap((p) => p.categories || [])
        ),
      ]
        .filter(Boolean)
        .sort(),
    [players]
  );

  const tierOptions = useMemo(() => {
    const fromTiers = allTiers.map((t) => t.name);
    const fromPlayers = players.map((p) => p.auctionTier?.name || p.tier).filter(Boolean);
    return [...new Set([...fromTiers, ...fromPlayers])].sort();
  }, [allTiers, players]);

  const teamOptions = useMemo(
    () =>
      [
        ...new Set(
          players
            .map((p) => p.team?.name)
            .filter(Boolean)
        ),
      ].sort(),
    [players]
  );

  const hasFilters =
    search || session || category || tier || status || team;

  // =========================
  // FILTER PLAYERS
  // =========================
  const filtered = useMemo(
    () =>
      players.filter((p) => {
        const q = search.trim().toLowerCase();

        const matchesSearch =
          !q ||
          [
            p.fullName,
            p.playerId,
            p.registrationNumber,
            p.phone,
            p.email,
          ].some((v) =>
            v?.toLowerCase().includes(q)
          );

        const matchesSession =
          !session || p.session === session;

        const matchesCategory =
          !category ||
          (p.categories || []).includes(category);

        const playerTierName = p.auctionTier?.name || p.tier;
        const matchesTier =
          !tier ||
          (tier === "__unassigned"
            ? !playerTierName
            : playerTierName === tier);

        const matchesStatus =
          !status || p.status === status;

        const matchesTeam =
          !team ||
          (team === "__unassigned"
            ? !p.team
            : p.team?.name === team);

        return (
          matchesSearch &&
          matchesSession &&
          matchesCategory &&
          matchesTier &&
          matchesStatus &&
          matchesTeam
        );
      }),
    [
      players,
      search,
      session,
      category,
      tier,
      status,
      team,
    ]
  );

  // =========================
  // CLEAR FILTERS
  // =========================
  const clearFilters = () => {
    setSearch("");
    setSession("");
    setCategory("");
    setTier("");
    setStatus("");
    setTeam("");
  };

  // =========================
  // UPDATE STATUS
  // =========================
  const updatePlayerStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(
        `/api/players/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update player status."
        );
      }

      setPlayers((current) =>
        current.map((player) =>
          player._id === id
            ? result.player
            : player
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to update player status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // UPDATE TIER
  // =========================
  const updatePlayerTier = async (id, tierId) => {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tierId: tierId === "__unassign" ? null : tierId,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result.error || "Unable to update player tier.");
      }

      setPlayers((current) =>
        current.map((player) =>
          player._id === id ? result.player : player
        )
      );

      if (selectedPlayer?._id === id) {
        setSelectedPlayer(result.player);
      }
    } catch (err) {
      setError(err.message || "Unable to update player tier.");
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // UPDATE TEAM
  // =========================
  const updatePlayerTeam = async (id, teamId, soldPrice) => {
    setUpdatingId(id);
    setError("");

    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: teamId === "__unassign" ? null : teamId,
          soldPrice: soldPrice !== undefined ? Number(soldPrice) : undefined,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result.error || "Unable to update player team.");
      }

      setPlayers((current) =>
        current.map((player) =>
          player._id === id ? result.player : player
        )
      );

      if (selectedPlayer?._id === id) {
        setSelectedPlayer(result.player);
      }
    } catch (err) {
      setError(err.message || "Unable to update player team.");
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================
  // DELETE PLAYER
  // =========================
  const deletePlayer = async (player) => {
    const confirmed = window.confirm(
      `Delete ${player.fullName}'s registration?\n\nStudent ID: ${player.playerId}\n\nThis cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(player._id);
    setError("");

    try {
      const response = await fetch(
        "/api/players",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            playerId: player.playerId,
          }),
        }
      );

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to delete player."
        );
      }

      setPlayers((current) =>
        current.filter(
          (currentPlayer) =>
            currentPlayer._id !== player._id
        )
      );

      setSelectedPlayer((current) =>
        current?._id === player._id
          ? null
          : current
      );

    } catch (err) {
      setError(
        err.message ||
          "Unable to delete player."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="rounded-2xl border border-[#aeac78]/30 bg-gradient-to-br from-[#383230]/95 to-[#241f1e]/95 p-5 sm:p-6 shadow-xl backdrop-blur-xl text-[#fcf0da]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h2 className="flex items-center gap-2 font-sans text-sm font-black tracking-wide text-[#fcf0da]">
            <i className="size-2 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
            ALL PLAYERS
          </h2>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-[#aeac78]">
            {filtered.length} {filtered.length === 1 ? "player" : "players"}
            {hasFilters && ` (of ${players.length})`}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportButtonGroup
            label="Download Players"
            count={filtered.length}
            variant="outline"
            pdfLabel={`Export ${filtered.length} player(s) as PDF`}
            excelLabel={`Export ${filtered.length} player(s) as Excel (.xlsx)`}
            onExportPdf={() => {
              const filterText = hasFilters
                ? `Filtered by: ${[
                    session && `Session: ${session}`,
                    category && `Category: ${category}`,
                    tier && `Tier: ${tier}`,
                    status && `Status: ${status}`,
                    team && `Team: ${team}`,
                    search && `Query: "${search}"`,
                  ]
                    .filter(Boolean)
                    .join(" • ")}`
                : "All registered tournament players";

              exportPlayersToPdf(filtered, {
                title: "Official Players Registry",
                filterDescription: filterText,
              });
            }}
            onExportExcel={() => {
              exportPlayersToExcel(filtered);
            }}
          />

          <button
            type="button"
            onClick={() => setShowAddPlayerModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#f2c46a] via-[#e2b353] to-[#c89632] px-3.5 py-1.5 text-xs font-black uppercase text-[#221d1c] hover:brightness-110 cursor-pointer shadow-md"
          >
            <FaPlus /> Add New Player
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-[#aeac78]/30 bg-[#25201e] px-3 py-2 text-xs text-[#aeac78]">
          <FaMagnifyingGlass />

          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]"
            placeholder="Search by name, student ID, reg. number, phone or email..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <select
          className={selectClass}
          value={session}
          onChange={(event) =>
            setSession(event.target.value)
          }
        >
          <option value="">All Sessions</option>

          {sessions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="">All Categories</option>

          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* TIER FILTER */}
        <select
          className={selectClass}
          value={tier}
          onChange={(event) =>
            setTier(event.target.value)
          }
        >
          <option value="">All Tiers</option>
          <option value="__unassigned">Unassigned (No Tier)</option>
          {tierOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="">All Statuses</option>

          {statuses.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          className={selectClass}
          value={team}
          onChange={(event) =>
            setTeam(event.target.value)
          }
        >
          <option value="">All Teams</option>
          <option value="__unassigned">
            Unassigned
          </option>

          {teamOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            className="rounded border border-white/25 px-3 py-2 text-xs cursor-pointer hover:bg-white/10"
            onClick={clearFilters}
            type="button"
          >
            Clear Filters
          </button>
        )}

        <button
          aria-label="Refresh players"
          className="grid size-9 place-items-center rounded border border-white/25 text-[#d4a84f] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          disabled={loading}
          onClick={loadData}
          title="Refresh players"
          type="button"
        >
          <FaRotateRight className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <p className="mb-2 text-xs text-[#d4a84f]">
        {loading
          ? "Loading players..."
          : `Showing ${filtered.length} of ${players.length} players`}
      </p>

      {error && (
        <p className="mb-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-[11px]">
          <thead className="border-y border-white/15 text-[#d4dde1]">
            <tr>
              {columns.map((h) => (
                <th
                  className="whitespace-nowrap px-2 py-2"
                  key={h}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, i) => {
              const tierName = p.auctionTier?.name || p.tier;
              return (
                <tr
                  className="cursor-pointer border-b border-white/10 hover:bg-white/10"
                  key={p._id}
                  onClick={() =>
                    setSelectedPlayer(p)
                  }
                >
                  <td className="px-2 py-2">
                    {i + 1}
                  </td>

                  <td className="px-2 py-2">
                    {p.photoUrl ? (
                      <img
                        className="size-8 rounded-full object-cover"
                        src={p.photoUrl}
                        alt={p.fullName}
                      />
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2 font-medium">
                    {p.fullName}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.phone}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2 font-mono">
                    {p.playerId}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.registrationNumber || "—"}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.email || "—"}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.session}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {(p.categories || []).join(", ")}
                  </td>

                  {/* TIER COLUMN */}
                  <td className="whitespace-nowrap px-2 py-2">
                    {tierName ? (
                      <span className="rounded border border-[#d4a84f]/40 bg-[#76511d]/70 px-1.5 py-0.5 text-[10px] font-bold text-[#f2d590]">
                        {tierName}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7c8790]">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <b
                      className={`rounded px-1.5 py-0.5 capitalize ${
                        statusBadge[p.status]
                      }`}
                    >
                      {p.status}
                    </b>
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.team?.name || "Unassigned"}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {new Date(
                      p.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="whitespace-nowrap px-2 py-2">
                    {p.status === "pending" && (
                      <button
                        className="cursor-pointer rounded bg-[#76511d] px-2 py-1 text-[10px] font-bold text-[#f2d590] disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updatePlayerStatus(
                            p._id,
                            "approved"
                          );
                        }}
                        disabled={
                          updatingId === p._id
                        }
                      >
                        {updatingId === p._id
                          ? "..."
                          : "Approve"}
                      </button>
                    )}

                    {p.status === "approved" && (
                      <button
                        className="cursor-pointer rounded bg-[#7a1f1f] px-2 py-1 text-[10px] font-bold text-[#ff9d9d] disabled:cursor-not-allowed disabled:opacity-60"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updatePlayerStatus(
                            p._id,
                            "pending"
                          );
                        }}
                        disabled={
                          updatingId === p._id
                        }
                      >
                        {updatingId === p._id
                          ? "..."
                          : "Cancel Approval"}
                      </button>
                    )}

                    {p.status === "rejected" &&
                      "—"}

                    {/* DELETE BUTTON */}
                    <button
                      className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded bg-[#7a1f1f] px-2 py-1 text-[10px] font-bold text-[#ff9d9d] disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        deletePlayer(p);
                      }}
                      disabled={
                        deletingId === p._id
                      }
                      aria-label={`Delete ${p.fullName}`}
                    >
                      {deletingId === p._id ? (
                        "Deleting..."
                      ) : (
                        <>
                          <FaTrash />
                          Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && !filtered.length && (
              <tr>
                <td
                  className="px-2 py-6 text-center text-[#8b979d]"
                  colSpan={columns.length}
                >
                  No players match the selected
                  filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddPlayerModal && (
        <AddPlayerModal
          allTeams={allTeams}
          allTiers={allTiers}
          onClose={() => setShowAddPlayerModal(false)}
          onPlayerCreated={(newP) => {
            setPlayers((prev) => [newP, ...prev]);
            loadData();
          }}
        />
      )}

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          allTiers={allTiers}
          allTeams={allTeams}
          onUpdateTier={updatePlayerTier}
          onUpdateTeam={updatePlayerTeam}
          onClose={() =>
            setSelectedPlayer(null)
          }
        />
      )}
    </section>
  );
};

export default AdminPlayersView;
