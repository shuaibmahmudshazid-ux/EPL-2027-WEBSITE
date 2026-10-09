"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaPlus,
  FaTrash,
  FaUsers,
  FaDice,
  FaRotateRight,
  FaUserMinus,
  FaUserPlus,
} from "react-icons/fa6";

const statusBadge = {
  active: "bg-[#76511d] text-[#f2d590]",
  inactive: "bg-[#7a1f1f] text-[#ff9d9d]",
};

const DetailRow = ({ label, value }) => (
  <div className="border-b border-white/10 py-2">
    <p className="text-[10px] font-bold uppercase text-[#8b979d]">{label}</p>
    <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
  </div>
);

// Auto generate 10-character uppercase key
const generateRandomKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// ==========================================
// ADD TEAM MODAL
// ==========================================
const AddTeamModal = ({ onClose, onTeamCreated }) => {
  const [name, setName] = useState("");
  const [uniqueKey, setUniqueKey] = useState(generateRandomKey());
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [managers, setManagers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleManagerChange = (index, field, value) => {
    const updated = [...managers];
    updated[index][field] = value;
    setManagers(updated);
  };

  const addManagerField = () => {
    setManagers([...managers, { name: "", phone: "", email: "" }]);
  };

  const removeManagerField = (index) => {
    setManagers(managers.filter((_, i) => i !== index));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      const isAllowedType =
        validTypes.includes(file.type?.toLowerCase()) ||
        /\.(jpe?g|png|webp)$/i.test(file.name || "");

      if (!isAllowedType) {
        setError("Logo must be a JPG, PNG, or WEBP image.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo must be smaller than 2MB.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }
    const cleanManagers = managers
      .filter((m) => m.name.trim() || m.phone.trim() || m.email.trim())
      .map((m) => ({
        name: m.name.trim(),
        phone: m.phone.trim(),
        email: m.email.trim().toLowerCase(),
      }));

    for (const m of cleanManagers) {
      if (!m.name || !m.phone || !m.email) {
        setError("Please complete all details (name, phone, email) for each manager, or remove incomplete entries.");
        return;
      }
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("uniqueKey", uniqueKey.trim().toUpperCase());
      formData.append("managers", JSON.stringify(cleanManagers));
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await fetch("/api/teams", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create team.");

      onTeamCreated(data.team);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create team.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-white/20 bg-[#031827] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#d4a84f] to-[#997328] text-base text-black font-black">
              <FaPlus />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Add New Team</h2>
              <p className="text-xs text-[#8b979d]">Register a new franchise into the tournament</p>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Team Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
              Team Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dhaka Dominators"
              className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2.5 text-white outline-none focus:border-[#d4a84f]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Unique Key */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
              Team Bidding Unique Key *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="10-letter uppercase key"
                className="flex-1 rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2.5 font-mono text-white outline-none focus:border-[#d4a84f] uppercase tracking-wider"
                value={uniqueKey}
                onChange={(e) => setUniqueKey(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                onClick={() => setUniqueKey(generateRandomKey())}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-[#f2d590] hover:bg-white/10 cursor-pointer"
                title="Generate Random Key"
              >
                <FaDice /> Random Key
              </button>
            </div>
          </div>

          {/* Team Logo */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
              Team Logo (JPG/PNG, max 2MB)
            </label>
            <div className="flex items-center gap-4">
              <div className="grid size-16 place-items-center rounded-full border-2 border-dashed border-amber-500/40 bg-[#02121f] overflow-hidden shadow-md ring-2 ring-amber-500/20 shrink-0">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Preview" className="size-full object-cover rounded-full" />
                ) : (
                  <span className="text-[10px] text-[#8b979d] text-center px-1 font-semibold">No Logo</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleLogoChange}
                className="flex-1 text-xs text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#d4a84f] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-black hover:file:bg-[#e4bb67]"
              />
            </div>
          </div>

          {/* Managers List (Optional) */}
          <div className="rounded-xl border border-white/10 bg-[#02121f] p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#8b979d]">
                  Team Managers ({managers.length})
                </label>
                <span className="ml-2 text-[10px] text-slate-400 font-normal">
                  (Optional — can be added later)
                </span>
              </div>
              <button
                type="button"
                onClick={addManagerField}
                className="inline-flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#f2d590] hover:bg-white/20 cursor-pointer"
              >
                <FaPlus className="text-[9px]" /> Add Manager
              </button>
            </div>

            {managers.length === 0 ? (
              <p className="text-[11px] text-[#8b979d] italic py-1">
                No managers added. You can create the team now and add managers later.
              </p>
            ) : (
              managers.map((m, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-t border-white/5 pt-2">
                  <input
                    type="text"
                    placeholder="Manager Name"
                    className="rounded-lg border border-white/15 bg-[#031827] px-2.5 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                    value={m.name}
                    onChange={(e) => handleManagerChange(idx, "name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    className="rounded-lg border border-white/15 bg-[#031827] px-2.5 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                    value={m.phone}
                    onChange={(e) => handleManagerChange(idx, "phone", e.target.value)}
                  />
                  <div className="flex items-center gap-1.5">
                    <input
                      type="email"
                      placeholder="Email"
                      className="flex-1 rounded-lg border border-white/15 bg-[#031827] px-2.5 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                      value={m.email}
                      onChange={(e) => handleManagerChange(idx, "email", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeManagerField(idx)}
                      className="cursor-pointer text-slate-400 hover:text-red-300 p-1"
                      title="Remove manager"
                    >
                      <FaXmark />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4a84f] to-[#b8872f] px-5 py-2 text-xs font-bold text-black hover:brightness-110 disabled:opacity-50 cursor-pointer shadow-lg"
            >
              {submitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// ADD PLAYER TO TEAM SUB-MODAL
// ==========================================
const AddPlayerToTeamModal = ({ team, allPlayers, onClose, onPlayerAdded }) => {
  const [mode, setMode] = useState("select"); // "select" | "create"
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [soldPrice, setSoldPrice] = useState("0");
  const [searchPlayer, setSearchPlayer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fields for quick creation
  const [newFullName, setNewFullName] = useState("");
  const [newPlayerId, setNewPlayerId] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSession, setNewSession] = useState("2023-24");
  const [newCategories, setNewCategories] = useState(["Batter"]);

  // Candidates: players not already in this team
  const availablePlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      const pTeamId = p.team?._id || p.team;
      return pTeamId !== team._id;
    });
  }, [allPlayers, team._id]);

  const filteredCandidates = useMemo(() => {
    const q = searchPlayer.trim().toLowerCase();
    if (!q) return availablePlayers;
    return availablePlayers.filter((p) =>
      [p.fullName, p.playerId, p.session, ...(p.categories || [])].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [availablePlayers, searchPlayer]);

  const handleSelectPlayer = (pId) => {
    setSelectedPlayerId(pId);
    const p = availablePlayers.find((item) => item._id === pId);
    if (p) {
      setSoldPrice(String(p.basePrice || 0));
    }
  };

  const handleAddExisting = async (e) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      setError("Select a player to add.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch(`/api/teams/${team._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_player",
          playerId: selectedPlayerId,
          soldPrice: Number(soldPrice) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add player.");

      onPlayerAdded(data.team);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add player.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newFullName.trim() || !newPlayerId.trim() || !newPhone.trim()) {
      setError("Full name, student ID, and phone are required.");
      return;
    }
    if (!newCategories.length) {
      setError("Select at least one category.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          playerId: newPlayerId.trim(),
          phone: newPhone.trim(),
          session: newSession,
          categories: newCategories,
          teamId: team._id,
          soldPrice: Number(soldPrice) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create player.");

      // Fetch refreshed team
      const teamRes = await fetch(`/api/teams/${team._id}`);
      const teamData = await teamRes.json();
      if (teamRes.ok && teamData.team) {
        onPlayerAdded(teamData.team);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create player.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-2xl border border-white/20 bg-[#031827] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FaUserPlus className="text-[#d4a84f]" /> Add Player to {team.name}
            </h3>
            <p className="text-[11px] text-[#8b979d]">Assign an existing player or register a new player directly</p>
          </div>
          <button
            className="cursor-pointer rounded p-1.5 text-slate-400 hover:text-white"
            type="button"
            onClick={onClose}
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/50 bg-red-950/70 p-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* Tab switcher */}
        <div className="mb-4 flex rounded-xl border border-white/15 bg-[#02121f] p-1 text-xs">
          <button
            type="button"
            className={`flex-1 rounded-lg py-1.5 font-bold transition-all cursor-pointer ${
              mode === "select"
                ? "bg-[#d4a84f] text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setMode("select")}
          >
            Select Existing Player ({availablePlayers.length})
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-1.5 font-bold transition-all cursor-pointer ${
              mode === "create"
                ? "bg-[#d4a84f] text-black shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => setMode("create")}
          >
            + Create New Player
          </button>
        </div>

        {mode === "select" ? (
          <form onSubmit={handleAddExisting} className="space-y-3.5 text-xs">
            {/* Search filter */}
            <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#02121f] px-3 py-1.5">
              <FaMagnifyingGlass className="text-[#8b979d]" />
              <input
                type="text"
                placeholder="Search candidates by name, ID..."
                className="w-full bg-transparent text-white outline-none"
                value={searchPlayer}
                onChange={(e) => setSearchPlayer(e.target.value)}
              />
            </div>

            {/* Candidate list */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                Choose Player *
              </label>
              <select
                required
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3 py-2 text-white outline-none focus:border-[#d4a84f] cursor-pointer"
                value={selectedPlayerId}
                onChange={(e) => handleSelectPlayer(e.target.value)}
              >
                <option value="">-- Select from {filteredCandidates.length} players --</option>
                {filteredCandidates.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName} (ID: {p.playerId}) • {p.categories?.join("/")} • Base: ৳ {p.basePrice || 0}
                    {p.team?.name ? ` [Currently in ${p.team.name}]` : " [Free Agent]"}
                  </option>
                ))}
              </select>
            </div>

            {/* Sold Price */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                Purchase / Sold Price (৳) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                className="w-full rounded-xl border border-white/20 bg-[#02121f] px-3.5 py-2 font-mono text-white outline-none focus:border-[#d4a84f]"
                value={soldPrice}
                onChange={(e) => setSoldPrice(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedPlayerId}
                className="rounded-lg bg-[#d4a84f] px-4 py-1.5 font-bold text-black hover:brightness-110 disabled:opacity-40 cursor-pointer"
              >
                {submitting ? "Adding..." : "Add to Squad"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateAndAdd} className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shakib Al Hasan"
                className="w-full rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2001001"
                  className="w-full rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                  value={newPlayerId}
                  onChange={(e) => setNewPlayerId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                  Phone (11 Digits) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                  Session *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2022-23"
                  className="w-full rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 text-white outline-none focus:border-[#d4a84f]"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                  Sold Price (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className="w-full rounded-lg border border-white/20 bg-[#02121f] px-3 py-1.5 font-mono text-white outline-none focus:border-[#d4a84f]"
                  value={soldPrice}
                  onChange={(e) => setSoldPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-[#8b979d] mb-1">
                Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {["Batter", "Bowler", "All-Rounder", "Wicket Keeper"].map((cat) => (
                  <label key={cat} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={newCategories.includes(cat)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewCategories([...newCategories, cat]);
                        } else {
                          setNewCategories(newCategories.filter((c) => c !== cat));
                        }
                      }}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#d4a84f] px-4 py-1.5 font-bold text-black hover:brightness-110 disabled:opacity-40 cursor-pointer"
              >
                {submitting ? "Creating..." : "Create & Add to Squad"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ==========================================
// TEAM DETAIL & SQUAD MANAGEMENT MODAL
// ==========================================
const TeamDetailModal = ({ team, allPlayers, onClose, onTeamUpdated, onDeleteTeam }) => {
  const [currentTeam, setCurrentTeam] = useState(team);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Manager management state
  const [isEditingManagers, setIsEditingManagers] = useState(false);
  const [editingManagers, setEditingManagers] = useState(team.managers || []);
  const [savingManagers, setSavingManagers] = useState(false);

  useEffect(() => {
    setCurrentTeam(team);
    setEditingManagers(team.managers || []);
  }, [team]);

  const handleManagerChange = (index, field, value) => {
    const updated = [...editingManagers];
    updated[index] = { ...updated[index], [field]: value };
    setEditingManagers(updated);
  };

  const handleAddManager = () => {
    setEditingManagers([...editingManagers, { name: "", phone: "", email: "" }]);
  };

  const handleRemoveManager = (index) => {
    setEditingManagers(editingManagers.filter((_, i) => i !== index));
  };

  const handleSaveManagers = async () => {
    try {
      setSavingManagers(true);
      setError("");
      setFeedback("");

      const cleanManagers = editingManagers
        .filter((m) => m && (m.name?.trim() || m.phone?.trim() || m.email?.trim()))
        .map((m) => ({
          name: m.name.trim(),
          phone: m.phone.trim(),
          email: m.email.trim().toLowerCase(),
        }));

      for (const m of cleanManagers) {
        if (!m.name || !m.phone || !m.email) {
          throw new Error("Please complete name, phone, and email for each manager.");
        }
        if (!/^\d{11}$/.test(m.phone.replace(/\D/g, ""))) {
          throw new Error("Manager mobile number must contain exactly 11 digits.");
        }
      }

      const res = await fetch(`/api/teams/${currentTeam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managers: cleanManagers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update managers.");

      setCurrentTeam(data.team);
      setEditingManagers(data.team.managers || []);
      onTeamUpdated(data.team);
      setIsEditingManagers(false);
      setFeedback("Team managers updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to save managers.");
    } finally {
      setSavingManagers(false);
    }
  };


  // Remove player from team squad (unassign)
  const handleRemovePlayer = async (playerId, playerName) => {
    try {
      setActionInProgressId(playerId);
      setError("");
      setFeedback("");

      const res = await fetch(`/api/teams/${currentTeam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove_player",
          playerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove player.");

      setCurrentTeam(data.team);
      onTeamUpdated(data.team);
      setFeedback(`${playerName} removed from squad.`);
    } catch (err) {
      setError(err.message || "Failed to remove player.");
    } finally {
      setActionInProgressId(null);
    }
  };

  // Permanently delete player from system
  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${playerName} from the system?`)) {
      return;
    }

    try {
      setActionInProgressId(playerId);
      setError("");
      setFeedback("");

      const res = await fetch(`/api/teams/${currentTeam._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_player",
          playerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete player.");

      setCurrentTeam(data.team);
      onTeamUpdated(data.team);
      setFeedback(`${playerName} permanently deleted.`);
    } catch (err) {
      setError(err.message || "Failed to delete player.");
    } finally {
      setActionInProgressId(null);
    }
  };

  const squadPlayers = currentTeam.players || [];
  const totalSpent = squadPlayers.reduce((sum, p) => sum + (Number(p.soldPrice) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-[680px] overflow-y-auto rounded-2xl border border-white/20 bg-[#031827] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-4">
            {currentTeam.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="size-20 sm:size-24 rounded-full object-cover border-2 border-amber-500/50 shadow-xl ring-2 ring-amber-500/20 shrink-0"
                src={currentTeam.logoUrl}
                alt={currentTeam.name}
              />
            ) : (
              <div className="grid size-20 sm:size-24 place-items-center rounded-full bg-white/10 text-xs text-[#8b979d] border-2 border-amber-500/30 font-bold shrink-0">
                No Logo
              </div>
            )}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase drop-shadow">{currentTeam.name}</h2>
              <div className="mt-1 flex items-center gap-2">
                <b className={`rounded px-1.5 py-0.5 text-[10px] capitalize ${statusBadge[currentTeam.status]}`}>
                  {currentTeam.status}
                </b>
                <span className="font-mono text-xs text-[#d4a84f] bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  Key: {currentTeam.uniqueKey}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              className="cursor-pointer rounded-lg bg-red-950/70 border border-red-500/40 px-2.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/80 hover:text-white"
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this team"
            >
              <FaTrash className="inline mr-1 text-[11px]" /> Delete Team
            </button>
            <button
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              type="button"
              onClick={onClose}
              aria-label="Close"
            >
              <FaXmark className="text-lg" />
            </button>
          </div>
        </div>

        {/* FEEDBACK & ERROR ALERTS */}
        {feedback && (
          <div className="mb-3 rounded-xl border border-emerald-500/50 bg-emerald-950/70 p-2.5 text-xs text-emerald-200 font-semibold">
            ✅ {feedback}
          </div>
        )}
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/50 bg-red-950/70 p-2.5 text-xs text-red-200 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* TEAM INFO DETAILS */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <DetailRow label="Purse Spent" value={`৳ ${totalSpent.toLocaleString()} / 50,000 pts`} />
          <DetailRow
            label="Remaining Purse"
            value={`৳ ${Math.max(0, 50000 - totalSpent).toLocaleString()} pts`}
          />
        </div>

        {/* MANAGERS SECTION */}
        <div className="rounded-xl border border-white/10 bg-[#02121f] p-3.5 mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#d4a84f] flex items-center gap-1.5">
                Team Managers ({(currentTeam.managers || []).length})
              </p>
              <p className="text-[10px] text-[#8b979d]">
                Authorized managers for team bidding credentials and notices
              </p>
            </div>
            {!isEditingManagers ? (
              <button
                type="button"
                onClick={() => {
                  setEditingManagers(currentTeam.managers?.length ? [...currentTeam.managers] : [{ name: "", phone: "", email: "" }]);
                  setIsEditingManagers(true);
                }}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-[#d4a84f]/40 bg-[#d4a84f]/10 px-3 py-1.5 text-xs font-semibold text-[#f2d590] hover:bg-[#d4a84f]/20 transition-colors"
              >
                <FaPlus className="text-[10px]" /> {currentTeam.managers?.length ? "Edit Managers" : "Add Manager"}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddManager}
                  className="cursor-pointer inline-flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] font-semibold text-[#f2d590] hover:bg-white/20"
                >
                  <FaPlus className="text-[9px]" /> Add More
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingManagers(currentTeam.managers || []);
                    setIsEditingManagers(false);
                  }}
                  disabled={savingManagers}
                  className="cursor-pointer rounded px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveManagers}
                  disabled={savingManagers}
                  className="cursor-pointer rounded bg-[#d4a84f] px-3 py-1 text-[10px] font-bold text-black hover:brightness-110 disabled:opacity-50"
                >
                  {savingManagers ? "Saving..." : "Save Managers"}
                </button>
              </div>
            )}
          </div>

          {!isEditingManagers ? (
            <div className="space-y-1.5">
              {currentTeam.managers && currentTeam.managers.length > 0 ? (
                currentTeam.managers.map((manager, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-white/5 bg-[#031827] px-3 py-2 text-xs gap-1"
                  >
                    <span className="font-bold text-white">{manager.name}</span>
                    <span className="text-[#8b979d]">{manager.phone}</span>
                    <span className="text-slate-300 font-mono text-[11px]">{manager.email}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-white/10 p-3.5 text-center">
                  <p className="text-xs text-[#8b979d] italic mb-1.5">
                    No managers assigned yet (registered without managers).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingManagers([{ name: "", phone: "", email: "" }]);
                      setIsEditingManagers(true);
                    }}
                    className="cursor-pointer text-xs font-semibold text-[#d4a84f] hover:underline"
                  >
                    + Assign manager credentials now
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {editingManagers.length === 0 ? (
                <p className="text-xs text-[#8b979d] italic py-1">
                  No manager entries. Click &quot;Add More&quot; to add one or &quot;Save Managers&quot; to save empty.
                </p>
              ) : (
                editingManagers.map((m, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center rounded-lg border border-white/10 bg-[#031827] p-2.5"
                  >
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={m.name || ""}
                      onChange={(e) => handleManagerChange(idx, "name", e.target.value)}
                      className="rounded border border-white/15 bg-[#02121f] px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#d4a84f]"
                    />
                    <input
                      type="text"
                      placeholder="01XXXXXXXXX"
                      value={m.phone || ""}
                      onChange={(e) => handleManagerChange(idx, "phone", e.target.value)}
                      className="rounded border border-white/15 bg-[#02121f] px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#d4a84f]"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={m.email || ""}
                      onChange={(e) => handleManagerChange(idx, "email", e.target.value)}
                      className="rounded border border-white/15 bg-[#02121f] px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#d4a84f]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveManager(idx)}
                      className="cursor-pointer p-1.5 text-slate-400 hover:text-red-400 justify-self-center sm:justify-self-auto"
                      title="Remove manager"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* SQUAD PLAYERS SECTION */}
        <div className="rounded-xl border border-white/10 bg-[#02121f] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FaUsers className="text-[#d4a84f]" /> Team Squad ({squadPlayers.length} Players)
              </h3>
              <p className="text-[10px] text-[#8b979d]">
                Manage roster: add players, remove from squad, or delete
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPlayerModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#d4a84f] to-[#b8872f] px-3 py-1.5 text-xs font-bold text-black hover:brightness-110 cursor-pointer shadow-md"
            >
              <FaPlus /> Add Player
            </button>
          </div>

          {squadPlayers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 p-6 text-center text-xs text-[#8b979d]">
              No players currently in squad. Click <b>&quot;Add Player&quot;</b> to assign or create a player for this team.
            </div>
          ) : (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {squadPlayers.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#031827] p-2.5 text-xs hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {player.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={player.photoUrl}
                        alt={player.fullName}
                        className="size-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-[9px] text-[#8b979d]">
                        No Pic
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{player.fullName}</p>
                      <p className="text-[10px] text-[#8b979d]">
                        ID: <span className="font-mono">{player.playerId}</span> • {player.categories?.join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-bold text-[#d4a84f] text-xs">
                      ৳ {Number(player.soldPrice || 0).toLocaleString()}
                    </span>

                    <button
                      type="button"
                      disabled={actionInProgressId === player._id}
                      onClick={() => handleRemovePlayer(player._id, player.fullName)}
                      className="cursor-pointer rounded bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30 disabled:opacity-50"
                      title="Unassign player (back to free agent pool)"
                    >
                      <FaUserMinus className="inline mr-1 text-[9px]" /> Remove
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgressId === player._id}
                      onClick={() => handleDeletePlayer(player._id, player.fullName)}
                      className="cursor-pointer rounded bg-red-950/70 border border-red-500/40 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-900/80 hover:text-white disabled:opacity-50"
                      title="Permanently delete player from database"
                    >
                      <FaTrash className="inline mr-1 text-[9px]" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DELETE TEAM CONFIRMATION DIALOG */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 z-60 grid place-items-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#07131e] p-5 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-red-950 border border-red-500/50 text-red-400 text-xl">
                <FaTrash />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Delete &quot;{currentTeam.name}&quot;?</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                This will permanently delete this team, release its unique key (<b>{currentTeam.uniqueKey}</b>), and
                unassign all <b>{squadPlayers.length}</b> squad players back to the free agent auction pool.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    onDeleteTeam(currentTeam._id, currentTeam.name);
                  }}
                  className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer shadow-lg"
                >
                  Yes, Delete Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMODAL: ADD PLAYER TO TEAM */}
        {showAddPlayerModal && (
          <AddPlayerToTeamModal
            team={currentTeam}
            allPlayers={allPlayers}
            onClose={() => setShowAddPlayerModal(false)}
            onPlayerAdded={(updated) => {
              setCurrentTeam(updated);
              onTeamUpdated(updated);
              setFeedback("Player added to squad successfully!");
            }}
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN ADMIN TEAMS VIEW
// ==========================================
const AdminTeamsView = () => {
  const [teams, setTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [teamsRes, playersRes] = await Promise.all([
        fetch("/api/teams", { cache: "no-store" }),
        fetch("/api/players", { cache: "no-store" }),
      ]);

      const [teamsData, playersData] = await Promise.all([
        teamsRes.json(),
        playersRes.json(),
      ]);

      if (!teamsRes.ok) throw new Error(teamsData.error || "Unable to load teams.");
      setTeams(teamsData.teams || []);
      setAllPlayers(playersData.players || []);
    } catch (err) {
      setError(err.message || "Unable to load teams.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  // Handle Team Deletion
  const handleDeleteTeam = async (teamId, teamName) => {
    try {
      setDeletingTeamId(teamId);
      setError("");
      setFeedback("");

      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete team.");

      setTeams((prev) => prev.filter((t) => t._id !== teamId));
      if (selectedTeam?._id === teamId) {
        setSelectedTeam(null);
      }
      setFeedback(data.message || `Team "${teamName}" deleted successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete team.");
    } finally {
      setDeletingTeamId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) =>
      [
        team.name,
        team.uniqueKey,
        ...(team.managers || []).flatMap((manager) => [manager.name, manager.phone, manager.email]),
      ].some((v) => v?.toLowerCase().includes(q))
    );
  }, [teams, search]);

  return (
    <section className="rounded-2xl border border-[#aeac78]/30 bg-gradient-to-br from-[#383230]/95 to-[#241f1e]/95 p-5 sm:p-6 shadow-xl backdrop-blur-xl text-[#fcf0da]">
      {/* HEADER WITH ADD BUTTON */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#aeac78]/20 pb-4">
        <div>
          <h2 className="flex items-center gap-2 font-sans font-black text-base tracking-wide text-[#fcf0da]">
            <i className="size-2.5 rounded-full bg-[#f2c46a] animate-pulse not-italic" />
            ALL TEAMS & SQUADS
          </h2>
          <p className="text-xs text-[#aeac78]">
            Manage franchises, unique keys, roster squads, and player assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer"
            title="Refresh Teams"
          >
            <FaRotateRight className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowAddTeamModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#d4a84f] to-[#b8872f] px-4 py-2 text-xs font-bold text-black hover:brightness-110 cursor-pointer shadow-lg"
          >
            <FaPlus /> Add New Team
          </button>
        </div>
      </div>

      {/* FEEDBACK & ERROR ALERTS */}
      {feedback && (
        <div className="mb-3 rounded-xl border border-emerald-500/50 bg-emerald-950/70 p-3 text-xs text-emerald-200 font-semibold flex items-center justify-between">
          <span>✅ {feedback}</span>
          <button type="button" onClick={() => setFeedback("")} className="text-emerald-400 hover:text-white">
            <FaXmark />
          </button>
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-xl border border-red-500/50 bg-red-950/70 p-3 text-xs text-red-200 font-semibold flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-white">
            <FaXmark />
          </button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="mb-4 flex min-w-[220px] items-center gap-2 rounded-xl border border-white/25 bg-[#02121f] px-3.5 py-2.5 text-xs text-[#aeb9bf]">
        <FaMagnifyingGlass />
        <input
          className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]"
          placeholder="Search by team name, key, manager name, phone or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <p className="mb-2 text-xs text-[#d4a84f]">
        {loading ? "Loading teams..." : `Showing ${filtered.length} of ${teams.length} teams`}
      </p>

      {/* TEAMS TABLE */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#02121f]/60">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead className="border-b border-white/15 bg-white/5 text-[#d4dde1] uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-3 py-3">#</th>
              <th className="px-3 py-3">Logo</th>
              <th className="px-3 py-3">Team Name</th>
              <th className="px-3 py-3">Unique Key</th>
              <th className="px-3 py-3">Managers</th>
              <th className="px-3 py-3">Squad</th>
              <th className="px-3 py-3">Status</th>
              <th className="whitespace-nowrap px-3 py-3">Registered</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((team, index) => (
              <tr
                className="cursor-pointer hover:bg-white/5 transition-colors"
                key={team._id}
                onClick={() => setSelectedTeam(team)}
              >
                <td className="px-3 py-3 font-mono text-[#8b979d]">{index + 1}</td>
                <td className="px-3 py-3">
                  {team.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="size-8 rounded-full object-cover border border-white/15" src={team.logoUrl} alt={team.name} />
                  ) : (
                    <div className="grid size-8 place-items-center rounded-full bg-white/10 text-[9px] text-[#8b979d]">
                      —
                    </div>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-bold text-white text-sm">
                  {team.name}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-mono font-bold text-[#d4a84f]">
                  {team.uniqueKey}
                </td>
                <td className="px-3 py-3 text-[11px] text-slate-300">
                  {team.managers && team.managers.length > 0 ? (
                    team.managers.map((manager, idx) => (
                      <div className="whitespace-nowrap" key={idx}>
                        {manager.name} • {manager.phone}
                      </div>
                    ))
                  ) : (
                    <span className="text-[#8b979d] italic text-[10px]">None assigned</span>
                  )}
                </td>
                <td className="px-3 py-3 font-mono">
                  <span className="rounded bg-[#76511d]/70 px-2 py-0.5 text-[11px] font-bold text-[#f2d590]">
                    {team.players?.length || 0} Players
                  </span>
                </td>
                <td className="px-3 py-3">
                  <b className={`rounded px-2 py-0.5 capitalize text-[10px] ${statusBadge[team.status]}`}>
                    {team.status}
                  </b>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-[#8b979d] text-[11px]">
                  {new Date(team.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTeam(team)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-bold text-[#f2d590] hover:bg-white/20 cursor-pointer"
                      title="Manage Squad"
                    >
                      <FaUsers /> Squad
                    </button>
                    <button
                      type="button"
                      disabled={deletingTeamId === team._id}
                      onClick={() => {
                        if (window.confirm(`Delete team "${team.name}" and release all squad players?`)) {
                          handleDeleteTeam(team._id, team.name);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-950/70 border border-red-500/40 px-2 py-1 text-[11px] font-bold text-red-300 hover:bg-red-900/80 hover:text-white disabled:opacity-40 cursor-pointer"
                      title="Delete team"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && !filtered.length && (
              <tr>
                <td className="px-3 py-8 text-center text-[#8b979d]" colSpan={9}>
                  No teams found. Click <b>&quot;Add New Team&quot;</b> to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD TEAM MODAL */}
      {showAddTeamModal && (
        <AddTeamModal
          onClose={() => setShowAddTeamModal(false)}
          onTeamCreated={(newTeam) => {
            setTeams((prev) => [newTeam, ...prev]);
            setFeedback(`Team "${newTeam.name}" created successfully!`);
            loadData();
          }}
        />
      )}

      {/* TEAM SQUAD DETAIL MODAL */}
      {selectedTeam && (
        <TeamDetailModal
          key={selectedTeam._id}
          team={selectedTeam}
          allPlayers={allPlayers}
          onClose={() => setSelectedTeam(null)}
          onTeamUpdated={(updated) => {
            setTeams((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
            setSelectedTeam(updated);
            loadData();
          }}
          onDeleteTeam={handleDeleteTeam}
        />
      )}
    </section>
  );
};

export default AdminTeamsView;
