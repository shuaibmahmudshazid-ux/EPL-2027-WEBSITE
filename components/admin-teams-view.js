"use client";

import { useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaXmark } from "react-icons/fa6";

const statusBadge = { active: "bg-[#76511d] text-[#f2d590]", inactive: "bg-[#7a1f1f] text-[#ff9d9d]" };

const DetailRow = ({ label, value }) => <div className="border-b border-white/10 py-2"><p className="text-[10px] font-bold uppercase text-[#8b979d]">{label}</p><p className="mt-0.5 text-sm">{value || "—"}</p></div>;

const TeamDetailModal = ({ team, onClose }) => <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
  <div className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-lg border border-white/15 bg-[#031827] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {team.logoUrl ? <img className="size-16 rounded-full object-cover" src={team.logoUrl} alt={team.name} /> : <div className="grid size-16 place-items-center rounded-full bg-white/10 text-xs text-[#8b979d]">No Logo</div>}
        <div>
          <h2 className="text-lg font-bold">{team.name}</h2>
          <b className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] capitalize ${statusBadge[team.status]}`}>{team.status}</b>
        </div>
      </div>
      <button className="cursor-pointer rounded p-1.5 text-[#9faab2] hover:text-white" type="button" onClick={onClose} aria-label="Close"><FaXmark className="text-lg" /></button>
    </div>
    <DetailRow label="Unique Key" value={team.uniqueKey} />
    <DetailRow label="Registered On" value={new Date(team.createdAt).toLocaleString()} />
    <div className="border-b border-white/10 py-2">
      <p className="text-[10px] font-bold uppercase text-[#8b979d]">Managers</p>
      {team.managers.map((manager) => <p className="mt-1 text-sm" key={`${manager.email}-${manager.phone}`}>{manager.name} • {manager.phone} • {manager.email}</p>)}
    </div>
    <div className="py-2">
      <p className="text-[10px] font-bold uppercase text-[#8b979d]">Players ({team.players.length})</p>
      {team.players.length ? team.players.map((player) => <p className="mt-1 text-sm" key={player._id}>{player.fullName} — {player.playerId}</p>) : <p className="mt-1 text-sm">No players assigned yet.</p>}
    </div>
  </div>
</div>;

const AdminTeamsView = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/teams");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setTeams(result.teams);
      } catch (err) {
        setError(err.message || "Unable to load teams.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter((team) => [team.name, team.uniqueKey, ...team.managers.flatMap((manager) => [manager.name, manager.phone, manager.email])].some((v) => v?.toLowerCase().includes(q)));
  }, [teams, search]);

  return <section className="rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-4 shadow-lg">
    <h2 className="mb-4 flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />ALL TEAMS</h2>
    <div className="mb-4 flex min-w-[220px] items-center gap-2 rounded border border-white/25 bg-[#02121f] px-3 py-2 text-xs text-[#aeb9bf]">
      <FaMagnifyingGlass />
      <input className="w-full bg-transparent text-white outline-none placeholder:text-[#7c8790]" placeholder="Search by team name, key, manager name, phone or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
    </div>
    <p className="mb-2 text-xs text-[#d4a84f]">{loading ? "Loading teams..." : `Showing ${filtered.length} of ${teams.length} teams`}</p>
    {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-[11px]">
        <thead className="border-y border-white/15 text-[#d4dde1]"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Logo</th><th className="px-2 py-2">Team Name</th><th className="px-2 py-2">Unique Key</th><th className="px-2 py-2">Managers</th><th className="px-2 py-2">Players</th><th className="px-2 py-2">Status</th><th className="whitespace-nowrap px-2 py-2">Registered</th></tr></thead>
        <tbody>
          {filtered.map((team, index) => <tr className="cursor-pointer border-b border-white/10 hover:bg-white/10" key={team._id} onClick={() => setSelectedTeam(team)}>
            <td className="px-2 py-2">{index + 1}</td>
            <td className="px-2 py-2">{team.logoUrl ? <img className="size-8 rounded-full object-cover" src={team.logoUrl} alt={team.name} /> : "—"}</td>
            <td className="whitespace-nowrap px-2 py-2 font-medium">{team.name}</td>
            <td className="whitespace-nowrap px-2 py-2 font-mono">{team.uniqueKey}</td>
            <td className="px-2 py-2">{team.managers.map((manager) => <div className="whitespace-nowrap" key={`${manager.email}-${manager.phone}`}>{manager.name} • {manager.phone} • {manager.email}</div>)}</td>
            <td className="px-2 py-2">{team.players.length}</td>
            <td className="px-2 py-2"><b className={`rounded px-1.5 py-0.5 capitalize ${statusBadge[team.status]}`}>{team.status}</b></td>
            <td className="whitespace-nowrap px-2 py-2">{new Date(team.createdAt).toLocaleDateString()}</td>
          </tr>)}
          {!loading && !filtered.length && <tr><td className="px-2 py-6 text-center text-[#8b979d]" colSpan={8}>No teams match the search.</td></tr>}
        </tbody>
      </table>
    </div>
    {selectedTeam && <TeamDetailModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />}
  </section>;
};

export default AdminTeamsView;
