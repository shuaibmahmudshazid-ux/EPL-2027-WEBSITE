"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaGavel,
  FaLayerGroup,
  FaMagnifyingGlass,
  FaPen,
  FaPlus,
  FaRotateRight,
  FaTrash,
  FaUserMinus,
  FaUserPlus,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";

const DEFAULT_CATEGORIES = [
  "Batsman",
  "Bowler",
  "Wicket Keeper (Batsman)",
  "Batting All-Rounder",
  "Bowling All-Rounder",
];

const inputClass =
  "w-full rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-white outline-none focus:border-[#d4a84f] placeholder:text-[#7c8790]";

const selectClass =
  "rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-white outline-none focus:border-[#d4a84f]";

// ========================================================
// TIER MODAL CONTENT
// ========================================================
const TierModalContent = ({ onClose, onSave, tierToEdit, currentCategory, allCategories }) => {
  const [name, setName] = useState(tierToEdit?.name || "");
  const [category, setCategory] = useState(() => {
    if (tierToEdit?.category) {
      if (DEFAULT_CATEGORIES.includes(tierToEdit.category) || allCategories.includes(tierToEdit.category)) {
        return tierToEdit.category;
      }
      return "__custom";
    }
    return currentCategory && currentCategory !== "all" ? currentCategory : DEFAULT_CATEGORIES[0];
  });
  const [customCategory, setCustomCategory] = useState(() => {
    if (tierToEdit?.category && !DEFAULT_CATEGORIES.includes(tierToEdit.category) && !allCategories.includes(tierToEdit.category)) {
      return tierToEdit.category;
    }
    return "";
  });
  const [basePrice, setBasePrice] = useState(tierToEdit?.basePrice?.toString() ?? "0");
  const [order, setOrder] = useState(tierToEdit?.order?.toString() ?? "1");
  const [description, setDescription] = useState(tierToEdit?.description || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = category === "__custom" ? customCategory.trim() : category;

    if (!name.trim()) {
      setError("Please provide a tier name (e.g. Tier A, Tier B).");
      return;
    }
    if (!finalCategory) {
      setError("Please specify a category.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await onSave({
        id: tierToEdit?._id,
        name: name.trim(),
        category: finalCategory,
        basePrice: Math.max(0, Number(basePrice) || 0),
        order: Number(order) || 0,
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save tier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-[500px] rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <i className="grid size-8 place-items-center rounded bg-[#76511d] text-sm text-[#f2d590]">
              <FaLayerGroup />
            </i>
            <h3 className="text-base font-bold text-white">
              {tierToEdit ? "Edit Auction Tier" : "Create New Auction Tier"}
            </h3>
          </div>
          <button
            type="button"
            className="rounded p-1 text-[#9faab2] hover:text-white cursor-pointer"
            onClick={onClose}
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
              Target Category
            </label>
            <select
              className={`${inputClass} cursor-pointer`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!tierToEdit}
            >
              {Array.from(new Set([...DEFAULT_CATEGORIES, ...allCategories])).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__custom">+ Custom Category</option>
            </select>
          </div>

          {category === "__custom" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
                Custom Category Name
              </label>
              <input
                className={inputClass}
                placeholder="e.g. Emerging Star, Icon Player..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
              Tier Name
            </label>
            <input
              className={inputClass}
              placeholder="e.g. Tier A, Tier B, Tier C, Icon Tier, Set 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
                Base Price (৳ / Points)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                className={inputClass}
                placeholder="0"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
              <span className="mt-0.5 block text-[10px] text-[#7c8790]">
                Initial bidding price for auction
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
                Auction Order / Priority
              </label>
              <input
                type="number"
                min="1"
                className={inputClass}
                placeholder="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
              <span className="mt-0.5 block text-[10px] text-[#7c8790]">
                Lower numbers appear first
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#8b979d]">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="e.g. Premium top-order batsman tier for main auction round"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              className="rounded border border-white/20 px-4 py-2 text-xs font-bold text-[#ccd4d8] hover:bg-white/10 cursor-pointer"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-[#b8872f] px-4 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
              disabled={submitting}
            >
              {submitting ? "Saving..." : tierToEdit ? "Update Tier" : "Create Tier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ========================================================
// ADD PLAYERS TO TIER MODAL CONTENT
// ========================================================
const AddPlayersModalContent = ({ onClose, tier, availablePlayers, onAssign }) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterMode, setFilterMode] = useState("unassigned");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const relevantPlayers = availablePlayers.filter((player) => {
    const inCategory = (player.categories || []).includes(tier.category);
    if (!inCategory) return false;

    if (filterMode === "unassigned") {
      return !player.auctionTier && player.tier !== tier.name;
    }
    return player.auctionTier?._id !== tier._id && player.tier !== tier.name;
  });

  const filteredPlayers = relevantPlayers.filter((player) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [player.fullName, player.playerId, player.session, player.phone].some((v) =>
      v?.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredPlayers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPlayers.map((p) => p._id));
    }
  };

  const handleConfirm = async () => {
    if (!selectedIds.length) return;
    try {
      setSubmitting(true);
      setError("");
      await onAssign(tier._id, selectedIds, "assign");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign players.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex max-h-[88vh] w-full max-w-[620px] flex-col rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FaUserPlus className="text-[#d4a84f]" />
              Add Players to {tier.name}
            </h3>
            <p className="mt-0.5 text-xs text-[#d4a84f]">
              Category: <span className="font-semibold text-white">{tier.category}</span> • Base Price:{" "}
              <span className="font-semibold text-white">৳ {tier.basePrice?.toLocaleString() || 0}</span>
            </p>
          </div>
          <button
            type="button"
            className="rounded p-1 text-[#9faab2] hover:text-white cursor-pointer"
            onClick={onClose}
          >
            <FaXmark className="text-lg" />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded border border-red-500/40 bg-red-950/40 p-2 text-xs text-red-200">
            {error}
          </div>
        )}

        {/* SEARCH & FILTERS */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded border border-white/25 bg-[#02121f] px-3 py-1.5 text-xs text-[#aeb9bf]">
            <FaMagnifyingGlass />
            <input
              className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]"
              placeholder="Search by name, student ID, session..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex rounded border border-white/20 bg-[#02121f] p-0.5 text-[11px]">
            <button
              type="button"
              className={`rounded px-2.5 py-1 font-medium cursor-pointer ${
                filterMode === "unassigned" ? "bg-[#b8872f] text-white" : "text-[#9faab2] hover:text-white"
              }`}
              onClick={() => setFilterMode("unassigned")}
            >
              Unassigned Only
            </button>
            <button
              type="button"
              className={`rounded px-2.5 py-1 font-medium cursor-pointer ${
                filterMode === "all" ? "bg-[#b8872f] text-white" : "text-[#9faab2] hover:text-white"
              }`}
              onClick={() => setFilterMode("all")}
            >
              All in Category
            </button>
          </div>
        </div>

        {/* SELECT ALL HELPER */}
        <div className="mb-2 flex items-center justify-between text-xs text-[#8b979d]">
          <span>
            Found <b className="text-white">{filteredPlayers.length}</b> eligible player(s)
          </span>
          {filteredPlayers.length > 0 && (
            <button
              type="button"
              className="text-[#d4a84f] hover:underline cursor-pointer"
              onClick={handleSelectAll}
            >
              {selectedIds.length === filteredPlayers.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {/* PLAYER LIST */}
        <div className="flex-1 overflow-y-auto rounded border border-white/10 bg-[#02121f]/70 p-2 space-y-1.5">
          {filteredPlayers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7c8790]">
              No players found matching current filters.
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isSelected = selectedIds.includes(player._id);
              const currentTierName = player.auctionTier?.name || player.tier;
              return (
                <div
                  key={player._id}
                  onClick={() => toggleSelect(player._id)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded border p-2 transition-all ${
                    isSelected
                      ? "border-[#d4a84f] bg-[#d4a84f]/15"
                      : "border-white/10 bg-[#031827]/60 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(player._id)}
                      className="size-4 accent-[#d4a84f] cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.fullName}
                        className="size-8 rounded-full object-cover border border-white/20"
                      />
                    ) : (
                      <div className="grid size-8 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-[#8b979d]">
                        {player.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-white">{player.fullName}</p>
                      <p className="text-[11px] text-[#8b979d]">
                        ID: {player.playerId} • Session: {player.session}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {currentTierName ? (
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-[#ffd37f]">
                        In {currentTierName}
                      </span>
                    ) : (
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-[#8b979d]">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-xs text-[#9faab2]">
            Selected: <b className="text-[#d4a84f]">{selectedIds.length}</b> player(s)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-white/20 px-3 py-1.5 text-xs font-bold text-[#ccd4d8] hover:bg-white/10 cursor-pointer"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded bg-[#b8872f] px-4 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
              onClick={handleConfirm}
              disabled={submitting || selectedIds.length === 0}
            >
              {submitting ? "Adding..." : `Add Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// MAIN ADMIN AUCTION TIERS VIEW
// ========================================================
const AdminAuctionTiersView = () => {
  const [tiers, setTiers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState("Batsman");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierToEdit, setTierToEdit] = useState(null);
  const [activeTierForAdd, setActiveTierForAdd] = useState(null);

  // Unassigned batch selection
  const [selectedUnassignedIds, setSelectedUnassignedIds] = useState([]);
  const [batchTargetTierId, setBatchTargetTierId] = useState("");

  // Load tiers and players
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tiersRes, playersRes] = await Promise.all([
        fetch("/api/admin/auction-tiers", { cache: "no-store" }),
        fetch("/api/players", { cache: "no-store" }),
      ]);

      const [tiersText, playersText] = await Promise.all([
        tiersRes.text(),
        playersRes.text(),
      ]);

      const tiersData = tiersText ? JSON.parse(tiersText) : {};
      const playersData = playersText ? JSON.parse(playersText) : {};

      if (!tiersRes.ok) throw new Error(tiersData.error || "Failed to load auction tiers.");
      if (!playersRes.ok) throw new Error(playersData.error || "Failed to load players.");

      setTiers(tiersData.tiers || []);
      setPlayers(playersData.players || []);
    } catch (err) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  // Discover all distinct categories
  const allCategories = useMemo(() => {
    const catSet = new Set(DEFAULT_CATEGORIES);
    tiers.forEach((t) => t.category && catSet.add(t.category));
    players.forEach((p) => {
      (p.categories || []).forEach((c) => catSet.add(c));
    });
    return Array.from(catSet);
  }, [tiers, players]);

  // Safe category selection
  const effectiveCategory =
    activeCategory === "all" || allCategories.includes(activeCategory)
      ? activeCategory
      : allCategories[0] || "Batsman";

  // Overall Statistics
  const overallStats = useMemo(() => {
    const totalTiers = tiers.length;
    const totalPlayers = players.length;
    const tieredPlayers = players.filter((p) => p.auctionTier || p.tier).length;
    const unassignedPlayers = totalPlayers - tieredPlayers;
    return { totalTiers, totalPlayers, tieredPlayers, unassignedPlayers };
  }, [tiers, players]);

  // Players filtered by search
  const searchedPlayers = useMemo(() => {
    if (!searchTerm.trim()) return players;
    const q = searchTerm.trim().toLowerCase();
    return players.filter((p) =>
      [p.fullName, p.playerId, p.session, p.phone, p.tier].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [players, searchTerm]);

  // Tiers for active category
  const categoryTiers = useMemo(() => {
    if (effectiveCategory === "all") return tiers;
    return tiers.filter((t) => t.category === effectiveCategory);
  }, [tiers, effectiveCategory]);

  // Unassigned players for active category
  const unassignedCategoryPlayers = useMemo(() => {
    if (effectiveCategory === "all") {
      return searchedPlayers.filter((p) => !p.auctionTier && !p.tier);
    }
    return searchedPlayers.filter(
      (p) => (p.categories || []).includes(effectiveCategory) && !p.auctionTier && !p.tier
    );
  }, [searchedPlayers, effectiveCategory]);

  // Helper to get players in a tier
  const getPlayersInTier = (tier) => {
    return searchedPlayers.filter((p) => {
      if (p.auctionTier) {
        const idMatch =
          typeof p.auctionTier === "object"
            ? p.auctionTier._id === tier._id
            : p.auctionTier === tier._id;
        if (idMatch) return true;
      }
      return p.tier === tier.name && (p.categories || []).includes(tier.category);
    });
  };

  // ============================================
  // TIER CRUD HANDLERS
  // ============================================
  const handleSaveTier = async (tierData) => {
    const isEditing = !!tierData.id;
    const url = isEditing
      ? `/api/admin/auction-tiers/${tierData.id}`
      : "/api/admin/auction-tiers";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tierData),
    });

    const resText = await res.text();
    const result = resText ? JSON.parse(resText) : {};
    if (!res.ok) throw new Error(result.error || "Failed to save tier.");

    showSuccess(isEditing ? `Tier "${tierData.name}" updated!` : `Tier "${tierData.name}" created!`);
    await loadData();
  };

  const handleDeleteTier = async (tier) => {
    const confirmed = window.confirm(
      `Delete tier "${tier.name}" in category "${tier.category}"?\n\nAny players assigned to this tier will become unassigned.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/auction-tiers/${tier._id}`, {
        method: "DELETE",
      });
      const resText = await res.text();
      const result = resText ? JSON.parse(resText) : {};
      if (!res.ok) throw new Error(result.error || "Failed to delete tier.");

      showSuccess(`Tier "${tier.name}" deleted.`);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to delete tier.");
    }
  };

  // ============================================
  // PLAYER ASSIGN / UNASSIGN HANDLERS
  // ============================================
  const handleAssignPlayers = async (tierId, playerIds, action) => {
    try {
      const res = await fetch("/api/admin/auction-tiers/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId, playerIds, action }),
      });

      const resText = await res.text();
      const result = resText ? JSON.parse(resText) : {};
      if (!res.ok) throw new Error(result.error || "Failed to update player tiers.");

      showSuccess(result.message || "Player tier updated successfully!");
      setSelectedUnassignedIds([]);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update players.");
      throw err;
    }
  };

  const handleQuickMove = async (playerId, targetTierId) => {
    if (!targetTierId) return;
    if (targetTierId === "__unassign") {
      await handleAssignPlayers(null, [playerId], "unassign");
    } else {
      await handleAssignPlayers(targetTierId, [playerId], "assign");
    }
  };

  // Batch assign from unassigned panel
  const handleBatchAssign = async () => {
    if (!batchTargetTierId || selectedUnassignedIds.length === 0) return;
    await handleAssignPlayers(batchTargetTierId, selectedUnassignedIds, "assign");
  };

  const toggleSelectUnassigned = (id) => {
    setSelectedUnassignedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllUnassigned = () => {
    if (selectedUnassignedIds.length === unassignedCategoryPlayers.length) {
      setSelectedUnassignedIds([]);
    } else {
      setSelectedUnassignedIds(unassignedCategoryPlayers.map((p) => p._id));
    }
  };

  return (
    <div className="space-y-4">
      {/* SECTION HEADER */}
      <section className="rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <i className="grid size-9 place-items-center rounded-lg bg-[#76511d] text-base text-[#f2d590]">
              <FaGavel />
            </i>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                AUCTION PLAYER TIERS &amp; CATEGORIES
                <span className="rounded bg-[#d4a84f]/20 px-2 py-0.5 text-[10px] font-bold text-[#d4a84f] border border-[#d4a84f]/40">
                  Manual Division
                </span>
              </h2>
              <p className="text-xs text-[#9faab2]">
                Organize players into category tiers (e.g. Batsman Tier A, B, C) with base prices for auction bidding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTierToEdit(null);
                setIsTierModalOpen(true);
              }}
              className="flex items-center gap-2 rounded bg-[#b8872f] px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 shadow-md cursor-pointer"
            >
              <FaPlus />
              CREATE TIER
            </button>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Refresh tiers and players"
              className="grid size-8 place-items-center rounded border border-white/20 text-[#d4a84f] hover:bg-white/10 disabled:opacity-50 cursor-pointer"
            >
              <FaRotateRight className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md border border-white/10 bg-[#02121f] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#8b979d]">Categories</p>
            <b className="text-lg text-white">{allCategories.length}</b>
          </div>
          <div className="rounded-md border border-white/10 bg-[#02121f] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#8b979d]">Total Tiers</p>
            <b className="text-lg text-[#d4a84f]">{overallStats.totalTiers}</b>
          </div>
          <div className="rounded-md border border-white/10 bg-[#02121f] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#8b979d]">Tiered Players</p>
            <b className="text-lg text-[#76d275]">{overallStats.tieredPlayers}</b>
            <span className="ml-1 text-[10px] text-[#7c8790]">/ {overallStats.totalPlayers}</span>
          </div>
          <div className="rounded-md border border-white/10 bg-[#02121f] p-2.5">
            <p className="text-[10px] font-bold uppercase text-[#8b979d]">Unassigned</p>
            <b className="text-lg text-[#ff9d9d]">{overallStats.unassignedPlayers}</b>
          </div>
        </div>

        {/* FEEDBACK ALERTS */}
        {error && (
          <div className="mt-3 flex items-center justify-between rounded border border-red-500/40 bg-red-950/40 p-2 text-xs text-red-200">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="cursor-pointer">
              <FaXmark />
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 flex items-center gap-2 rounded border border-[#d4a84f]/40 bg-[#76511d]/40 p-2 text-xs text-[#f2d590]">
            <FaCheck />
            <span>{successMessage}</span>
          </div>
        )}
      </section>

      {/* CATEGORY TABS & SEARCH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              effectiveCategory === "all"
                ? "bg-[#956a26] text-white shadow"
                : "border border-white/15 bg-[#031827] text-[#ccd4d8] hover:bg-white/10"
            }`}
          >
            All Categories
          </button>
          {allCategories.map((cat) => {
            const catTiers = tiers.filter((t) => t.category === cat);
            const totalInCat = players.filter((p) => (p.categories || []).includes(cat)).length;
            const assignedInCat = players.filter(
              (p) => (p.categories || []).includes(cat) && (p.auctionTier || p.tier)
            ).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  effectiveCategory === cat
                    ? "bg-[#956a26] text-white shadow"
                    : "border border-white/15 bg-[#031827] text-[#ccd4d8] hover:bg-white/10"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[10px] ${
                    effectiveCategory === cat
                      ? "bg-black/30 text-white"
                      : "bg-white/10 text-[#d4a84f]"
                  }`}
                >
                  {catTiers.length}T • {assignedInCat}/{totalInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* SEARCH BAR */}
        <div className="flex min-w-[220px] flex-1 max-w-[340px] items-center gap-2 rounded border border-white/20 bg-[#02121f] px-3 py-1.5 text-xs text-[#aeb9bf]">
          <FaMagnifyingGlass />
          <input
            className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]"
            placeholder="Search players by name, ID, session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-[#8b979d] hover:text-white cursor-pointer"
            >
              <FaXmark />
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY WORKSPACE */}
      {effectiveCategory !== "all" ? (
        <div className="space-y-4">
          {/* CATEGORY BANNER */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#031827] p-3.5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#d4a84f]" />
                {effectiveCategory} Tiers Pool
              </h3>
              <p className="text-xs text-[#8b979d]">
                {categoryTiers.length} tier(s) configured •{" "}
                <span className="text-[#f2d590]">
                  {players.filter((p) => (p.categories || []).includes(effectiveCategory) && (p.auctionTier || p.tier)).length} assigned
                </span>{" "}
                •{" "}
                <span className="text-red-300">
                  {unassignedCategoryPlayers.length} unassigned
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTierToEdit(null);
                setIsTierModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded border border-[#d4a84f]/60 bg-[#76511d]/40 px-3 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#76511d] cursor-pointer"
            >
              <FaPlus />
              Add Tier for {effectiveCategory}
            </button>
          </div>

          {/* TIERS GRID */}
          {categoryTiers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/20 bg-[#031827]/50 p-8 text-center">
              <FaLayerGroup className="mx-auto mb-2 text-3xl text-[#8b979d]" />
              <h4 className="text-sm font-bold text-white">No Tiers Created for {effectiveCategory}</h4>
              <p className="mt-1 text-xs text-[#8b979d]">
                Create tiers like &quot;Tier A&quot;, &quot;Tier B&quot;, or &quot;Tier C&quot; to start dividing players for auction.
              </p>
              <button
                type="button"
                onClick={() => {
                  setTierToEdit(null);
                  setIsTierModalOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded bg-[#b8872f] px-4 py-2 text-xs font-bold text-white hover:brightness-110 cursor-pointer"
              >
                <FaPlus />
                Create First Tier for {effectiveCategory}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categoryTiers.map((tier) => {
                const tierPlayers = getPlayersInTier(tier);
                return (
                  <div
                    key={tier._id}
                    className="flex flex-col rounded-lg border border-white/15 bg-[#031827] shadow-md transition-all hover:border-white/25"
                  >
                    {/* TIER HEADER */}
                    <div className="border-b border-white/10 bg-[#02121f]/90 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              {tier.name}
                            </h4>
                            <span className="rounded bg-[#76511d] px-2 py-0.2 text-[10px] font-bold text-[#f2d590]">
                              {tierPlayers.length} Player(s)
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-xs text-[#8b979d]">
                            <span>
                              Base: <b className="text-[#d4a84f]">৳ {tier.basePrice?.toLocaleString() || 0}</b>
                            </span>
                            <span>• Order: #{tier.order || 1}</span>
                          </div>
                          {tier.description && (
                            <p className="mt-1 text-[11px] italic text-[#7c8790]">
                              &ldquo;{tier.description}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setTierToEdit(tier);
                              setIsTierModalOpen(true);
                            }}
                            className="rounded p-1.5 text-[#9faab2] hover:bg-white/10 hover:text-white cursor-pointer"
                            title="Edit Tier"
                          >
                            <FaPen className="text-xs" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(tier)}
                            className="rounded p-1.5 text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
                            title="Delete Tier"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>

                      {/* ADD PLAYERS QUICK BUTTON */}
                      <button
                        type="button"
                        onClick={() => setActiveTierForAdd(tier)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded border border-[#d4a84f]/40 bg-[#76511d]/20 py-1.5 text-xs font-bold text-[#f2d590] hover:bg-[#76511d]/40 transition-colors cursor-pointer"
                      >
                        <FaUserPlus />
                        Add Players to {tier.name}
                      </button>
                    </div>

                    {/* PLAYERS LIST IN TIER */}
                    <div className="flex-1 p-2 max-h-[360px] overflow-y-auto space-y-1.5">
                      {tierPlayers.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#7c8790]">
                          No players assigned yet.
                          <br />
                          Click &quot;+ Add Players&quot; to assign {effectiveCategory.toLowerCase()}s.
                        </div>
                      ) : (
                        tierPlayers.map((player) => (
                          <div
                            key={player._id}
                            className="flex items-center justify-between gap-2 rounded border border-white/5 bg-[#02121f]/60 p-2 hover:bg-white/5 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {player.photoUrl ? (
                                <img
                                  src={player.photoUrl}
                                  alt={player.fullName}
                                  className="size-7 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="grid size-7 place-items-center rounded-full bg-white/10 text-[9px] font-bold text-[#8b979d] shrink-0">
                                  {player.fullName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div className="truncate">
                                <p className="font-semibold text-white truncate">{player.fullName}</p>
                                <p className="text-[10px] text-[#8b979d]">
                                  ID: {player.playerId} • {player.session}
                                </p>
                              </div>
                            </div>

                            {/* ACTIONS: MOVE OR REMOVE */}
                            <div className="flex items-center gap-1 shrink-0">
                              <select
                                className="rounded border border-white/15 bg-[#031827] px-1.5 py-1 text-[10px] text-[#ccd4d8] outline-none"
                                value={tier._id}
                                onChange={(e) => handleQuickMove(player._id, e.target.value)}
                                title="Move to another tier"
                              >
                                <option value={tier._id} disabled>
                                  Move to...
                                </option>
                                {categoryTiers
                                  .filter((t) => t._id !== tier._id)
                                  .map((otherTier) => (
                                    <option key={otherTier._id} value={otherTier._id}>
                                      {otherTier.name}
                                    </option>
                                  ))}
                                <option value="__unassign">✕ Unassign</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => handleAssignPlayers(null, [player._id], "unassign")}
                                className="rounded p-1 text-red-400 hover:bg-red-950/40 hover:text-red-300 cursor-pointer"
                                title="Remove from this tier"
                              >
                                <FaUserMinus className="text-[11px]" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* UNASSIGNED PLAYERS SECTION FOR THIS CATEGORY */}
          <div className="mt-6 rounded-lg border border-white/15 bg-[#031827] p-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaUsers className="text-[#d4a84f]" />
                  Unassigned {effectiveCategory}s ({unassignedCategoryPlayers.length})
                </h4>
                <p className="text-xs text-[#8b979d]">
                  Players registered in this category who haven&apos;t been divided into any tier yet.
                </p>
              </div>

              {/* BATCH ASSIGN CONTROLS */}
              {categoryTiers.length > 0 && unassignedCategoryPlayers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllUnassigned}
                    className="text-xs text-[#d4a84f] hover:underline cursor-pointer mr-1"
                  >
                    {selectedUnassignedIds.length === unassignedCategoryPlayers.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  <select
                    className={selectClass}
                    value={batchTargetTierId}
                    onChange={(e) => setBatchTargetTierId(e.target.value)}
                  >
                    <option value="">-- Choose Tier --</option>
                    {categoryTiers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} (৳ {t.basePrice})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleBatchAssign}
                    disabled={!batchTargetTierId || selectedUnassignedIds.length === 0}
                    className="flex items-center gap-1.5 rounded bg-[#b8872f] px-3 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 cursor-pointer"
                  >
                    <FaCheck />
                    Assign Selected ({selectedUnassignedIds.length})
                  </button>
                </div>
              )}
            </div>

            {/* UNASSIGNED PLAYERS LIST / TABLE */}
            <div className="mt-3 overflow-x-auto">
              {unassignedCategoryPlayers.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#7c8790]">
                  All {effectiveCategory.toLowerCase()}s have been assigned to tiers!
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/10 text-[#8b979d]">
                    <tr>
                      <th className="w-8 px-2 py-2">
                        <input
                          type="checkbox"
                          checked={
                            selectedUnassignedIds.length > 0 &&
                            selectedUnassignedIds.length === unassignedCategoryPlayers.length
                          }
                          onChange={toggleSelectAllUnassigned}
                          className="size-3.5 accent-[#d4a84f] cursor-pointer"
                        />
                      </th>
                      <th className="px-2 py-2">Player</th>
                      <th className="px-2 py-2">Student ID</th>
                      <th className="px-2 py-2">Session</th>
                      <th className="px-2 py-2">Phone</th>
                      <th className="px-2 py-2">Status</th>
                      <th className="px-2 py-2 text-right">Assign to Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {unassignedCategoryPlayers.map((player) => (
                      <tr
                        key={player._id}
                        className={`hover:bg-white/5 ${
                          selectedUnassignedIds.includes(player._id) ? "bg-[#d4a84f]/10" : ""
                        }`}
                      >
                        <td className="px-2 py-2">
                          <input
                            type="checkbox"
                            checked={selectedUnassignedIds.includes(player._id)}
                            onChange={() => toggleSelectUnassigned(player._id)}
                            className="size-3.5 accent-[#d4a84f] cursor-pointer"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            {player.photoUrl ? (
                              <img
                                src={player.photoUrl}
                                alt={player.fullName}
                                className="size-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="grid size-6 place-items-center rounded-full bg-white/10 text-[9px] font-bold text-[#8b979d]">
                                {player.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium text-white">{player.fullName}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-[#8b979d]">{player.playerId}</td>
                        <td className="px-2 py-2 text-[#8b979d]">{player.session}</td>
                        <td className="px-2 py-2 text-[#8b979d]">{player.phone}</td>
                        <td className="px-2 py-2">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] capitalize ${
                              player.status === "approved"
                                ? "bg-[#76511d] text-[#f2d590]"
                                : "bg-[#856406] text-yellow-200"
                            }`}
                          >
                            {player.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-right">
                          <select
                            className="rounded border border-white/20 bg-[#02121f] px-2 py-1 text-xs text-white outline-none cursor-pointer"
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAssignPlayers(e.target.value, [player._id], "assign");
                              }
                            }}
                          >
                            <option value="" disabled>
                              Assign to Tier...
                            </option>
                            {categoryTiers.map((t) => (
                              <option key={t._id} value={t._id}>
                                {t.name} (৳ {t.basePrice})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ALL CATEGORIES BIRDS-EYE VIEW */
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {allCategories.map((cat) => {
              const catTiers = tiers.filter((t) => t.category === cat);
              const catPlayers = players.filter((p) => (p.categories || []).includes(cat));
              const assignedCount = catPlayers.filter((p) => p.auctionTier || p.tier).length;
              const unassignedCount = catPlayers.length - assignedCount;

              return (
                <div
                  key={cat}
                  className="rounded-lg border border-white/15 bg-[#031827] p-4 shadow transition-all hover:border-white/25"
                >
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="size-2 rounded-full bg-[#d4a84f]" />
                        {cat}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#8b979d]">
                        {catPlayers.length} registered • {assignedCount} tiered •{" "}
                        <span className="text-red-300">{unassignedCount} unassigned</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className="rounded bg-[#b8872f]/80 px-2.5 py-1 text-xs font-bold text-white hover:bg-[#b8872f] cursor-pointer"
                    >
                      Manage {cat}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b979d]">
                      Configured Tiers ({catTiers.length}):
                    </p>
                    {catTiers.length === 0 ? (
                      <p className="text-xs italic text-[#7c8790]">
                        No tiers created yet for this category.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {catTiers.map((tier) => {
                          const count = getPlayersInTier(tier).length;
                          return (
                            <div
                              key={tier._id}
                              className="rounded border border-white/10 bg-[#02121f] p-2"
                            >
                              <div className="flex items-center justify-between">
                                <b className="text-xs text-white">{tier.name}</b>
                                <span className="rounded bg-[#76511d] px-1.5 py-0.2 text-[10px] font-bold text-[#f2d590]">
                                  {count}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-[#d4a84f]">
                                Base: ৳ {tier.basePrice?.toLocaleString() || 0}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT TIER MODAL */}
      {isTierModalOpen && (
        <TierModalContent
          key={tierToEdit?._id || "new-tier"}
          onClose={() => {
            setIsTierModalOpen(false);
            setTierToEdit(null);
          }}
          onSave={handleSaveTier}
          tierToEdit={tierToEdit}
          currentCategory={effectiveCategory}
          allCategories={allCategories}
        />
      )}

      {/* ADD PLAYERS TO TIER MODAL */}
      {activeTierForAdd && (
        <AddPlayersModalContent
          key={activeTierForAdd._id}
          onClose={() => setActiveTierForAdd(null)}
          tier={activeTierForAdd}
          availablePlayers={players}
          onAssign={handleAssignPlayers}
        />
      )}
    </div>
  );
};

export default AdminAuctionTiersView;
