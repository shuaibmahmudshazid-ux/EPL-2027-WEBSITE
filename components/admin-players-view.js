"use client";

import { useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

const statusBadge = { pending: "bg-[#856406] text-yellow-200", approved: "bg-[#76511d] text-[#f2d590]", rejected: "bg-[#7a1f1f] text-[#ff9d9d]" };
const paymentDetailLabel = { bkash: "Transaction ID", nagad: "Transaction ID", rocket: "Transaction ID", cash: "Cash Given To", other: "Payment Details" };

const DetailRow = ({ label, value }) => <div className="border-b border-white/10 py-2"><p className="text-[10px] font-bold uppercase text-[#8b979d]">{label}</p><p className="mt-0.5 text-sm">{value || "—"}</p></div>;

const PlayerDetailModal = ({ player, onClose }) => <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
  <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {player.photoUrl ? <img className="size-16 rounded-full object-cover" src={player.photoUrl} alt={player.fullName} /> : <div className="grid size-16 place-items-center rounded-full bg-white/10 text-xs text-[#8b979d]">No Photo</div>}
        <div>
          <h2 className="text-lg font-bold">{player.fullName}</h2>
          <b className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] capitalize ${statusBadge[player.status]}`}>{player.status}</b>
        </div>
      </div>
      <button className="rounded p-1.5 text-[#9faab2] hover:text-white" type="button" onClick={onClose} aria-label="Close"><FaXmark className="text-lg" /></button>
    </div>
    <div className="grid gap-x-4 min-[520px]:grid-cols-2">
      <DetailRow label="Phone" value={player.phone} />
      <DetailRow label="Student ID" value={player.playerId} />
      <DetailRow label="Registration Number" value={player.registrationNumber} />
      <DetailRow label="Email" value={player.email} />
      <DetailRow label="Session" value={player.session} />
      <DetailRow label="Category" value={player.categories?.join(", ")} />
      <DetailRow label="Team" value={player.team?.name || "Unassigned"} />
      <DetailRow label="Registered On" value={new Date(player.createdAt).toLocaleString()} />
      <DetailRow label="Payment Method" value={player.paymentMethod ? paymentMethodLabels[player.paymentMethod] : null} />
      {player.paymentMethod && <DetailRow label={paymentDetailLabel[player.paymentMethod]} value={paymentDetail(player)} />}
    </div>
  </div>
</div>;
const statuses = ["pending", "approved", "rejected"];
const paymentMethodLabels = { bkash: "bKash", nagad: "Nagad", rocket: "Rocket", cash: "Cash", other: "Other" };
const paymentDetail = (p) => p.transactionId || p.cashReceivedBy || p.paymentNote || "—";
const selectClass = "rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-white";
const columns = ["#", "Photo", "Full Name", "Phone", "Student ID", "Reg. Number", "Email", "Session", "Category", "Status", "Team", "Payment", "Payment Info", "Registered", "Actions"];

const AdminPlayersView = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [session, setSession] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [team, setTeam] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/players");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setPlayers(result.players);
      } catch (err) {
        setError(err.message || "Unable to load players.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sessions = useMemo(() => [...new Set(players.map((p) => p.session))].sort(), [players]);
  const categoryOptions = useMemo(() => [...new Set(players.flatMap((p) => p.categories))].sort(), [players]);
  const teamOptions = useMemo(() => [...new Set(players.map((p) => p.team?.name).filter(Boolean))].sort(), [players]);
  const hasFilters = search || session || category || status || team || paymentMethod;

  const filtered = useMemo(() => players.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || [p.fullName, p.playerId, p.registrationNumber, p.phone, p.email, p.transactionId].some((v) => v?.toLowerCase().includes(q));
    const matchesSession = !session || p.session === session;
    const matchesCategory = !category || p.categories.includes(category);
    const matchesStatus = !status || p.status === status;
    const matchesTeam = !team || (team === "__unassigned" ? !p.team : p.team?.name === team);
    const matchesPayment = !paymentMethod || p.paymentMethod === paymentMethod;
    return matchesSearch && matchesSession && matchesCategory && matchesStatus && matchesTeam && matchesPayment;
  }), [players, search, session, category, status, team, paymentMethod]);

  const clearFilters = () => { setSearch(""); setSession(""); setCategory(""); setStatus(""); setTeam(""); setPaymentMethod(""); };

  const updatePlayerStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/players/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setPlayers((current) => current.map((player) => player._id === id ? result.player : player));
    } catch (err) {
      setError(err.message || "Unable to update player status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return <section className="rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-4 shadow-lg">
    <h2 className="mb-4 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />ALL PLAYERS</h2>
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-[#aeb9bf]">
        <FaMagnifyingGlass />
        <input className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]" placeholder="Search by name, student ID, reg. number, phone or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <select className={selectClass} value={session} onChange={(event) => setSession(event.target.value)}><option value="">All Sessions</option>{sessions.map((s) => <option key={s} value={s}>{s}</option>)}</select>
      <select className={selectClass} value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All Categories</option>{categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}</select>
      <select className={selectClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All Statuses</option>{statuses.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select>
      <select className={selectClass} value={team} onChange={(event) => setTeam(event.target.value)}><option value="">All Teams</option><option value="__unassigned">Unassigned</option>{teamOptions.map((t) => <option key={t} value={t}>{t}</option>)}</select>
      <select className={selectClass} value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="">All Payment Methods</option>{Object.entries(paymentMethodLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {hasFilters && <button className="rounded border border-white/25 px-3 py-2 text-xs" onClick={clearFilters} type="button">Clear Filters</button>}
    </div>
    <p className="mb-2 text-xs text-[#d4a84f]">{loading ? "Loading players..." : `Showing ${filtered.length} of ${players.length} players`}</p>
    {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px] text-left text-[11px]">
        <thead className="border-y border-white/15 text-[#d4dde1]"><tr>{columns.map((h) => <th className="whitespace-nowrap px-2 py-2" key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {filtered.map((p, i) => <tr className="cursor-pointer border-b border-white/10 hover:bg-white/10" key={p._id} onClick={() => setSelectedPlayer(p)}>
            <td className="px-2 py-2">{i + 1}</td>
            <td className="px-2 py-2">{p.photoUrl ? <img className="size-8 rounded-full object-cover" src={p.photoUrl} alt={p.fullName} /> : "—"}</td>
            <td className="whitespace-nowrap px-2 py-2 font-medium">{p.fullName}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.phone}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.playerId}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.registrationNumber || "—"}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.email || "—"}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.session}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.categories.join(", ")}</td>
            <td className="px-2 py-2"><b className={`rounded px-1.5 py-0.5 capitalize ${statusBadge[p.status]}`}>{p.status}</b></td>
            <td className="whitespace-nowrap px-2 py-2">{p.team?.name || "Unassigned"}</td>
            <td className="whitespace-nowrap px-2 py-2">{p.paymentMethod ? paymentMethodLabels[p.paymentMethod] : "—"}</td>
            <td className="max-w-[200px] truncate px-2 py-2" title={paymentDetail(p)}>{paymentDetail(p)}</td>
            <td className="whitespace-nowrap px-2 py-2">{new Date(p.createdAt).toLocaleDateString()}</td>
            <td className="whitespace-nowrap px-2 py-2">
              {p.status === "pending" && <button className="cursor-pointer rounded bg-[#76511d] px-2 py-1 text-[10px] font-bold text-[#f2d590] disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={(event) => { event.stopPropagation(); updatePlayerStatus(p._id, "approved"); }} disabled={updatingId === p._id}>{updatingId === p._id ? "..." : "Approve"}</button>}
              {p.status === "approved" && <button className="cursor-pointer rounded bg-[#7a1f1f] px-2 py-1 text-[10px] font-bold text-[#ff9d9d] disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={(event) => { event.stopPropagation(); updatePlayerStatus(p._id, "pending"); }} disabled={updatingId === p._id}>{updatingId === p._id ? "..." : "Cancel Approval"}</button>}
              {p.status === "rejected" && "—"}
            </td>
          </tr>)}
          {!loading && !filtered.length && <tr><td className="px-2 py-6 text-center text-[#8b979d]" colSpan={columns.length}>No players match the selected filters.</td></tr>}
        </tbody>
      </table>
    </div>
    {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
  </section>;
};

export default AdminPlayersView;
