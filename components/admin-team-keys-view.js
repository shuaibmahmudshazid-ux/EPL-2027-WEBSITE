"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaCopy, FaKey, FaPlus } from "react-icons/fa6";

const AdminTeamKeysView = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const load = async () => {
    try {
      const response = await fetch("/api/admin/team-keys");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setKeys(result.teamKeys);
    } catch (err) {
      setMessage(err.message || "Unable to load keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { (async () => { await load(); })(); }, []);

  const generate = async () => {
    setGenerating(true); setMessage("");
    try {
      const response = await fetch("/api/admin/team-keys", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      await load();
    } catch (err) {
      setMessage(err.message || "Unable to generate key.");
    } finally {
      setGenerating(false);
    }
  };

  const freeCount = keys.filter((teamKey) => teamKey.status === "free").length;

  const copyKey = async (key) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((current) => current === key ? "" : current), 1500);
    } catch {
      setMessage("Unable to copy key. Copy it manually.");
    }
  };

  return <section className="mx-auto max-w-[720px] rounded-lg border border-[#b8a18055] bg-[#031827]/90 p-5 shadow-lg">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-sans font-bold text-sm tracking-wide"><i className="size-2 rounded-full bg-[#c7963b]" />TEAM REGISTRATION KEYS</h2>
      <button className="flex items-center gap-2 rounded bg-[#b8872f] px-4 py-2 text-xs font-bold disabled:opacity-60" type="button" onClick={generate} disabled={generating}><FaPlus />{generating ? "GENERATING..." : "GENERATE NEW KEY"}</button>
    </div>
    <p className="mb-4 text-xs text-[#9faab2]">Give one of these keys to each team. A key can be used only once during team registration.{!loading && ` ${freeCount} of ${keys.length} keys are still free.`}</p>
    {message && <p className="mb-3 text-xs text-red-300">{message}</p>}
    {loading ? <p className="text-xs text-[#d4a84f]">Loading keys...</p> : <div className="overflow-x-auto">
      <table className="w-full text-left text-[11px]">
        <thead className="border-y border-white/15 text-[#d4dde1]"><tr><th className="px-2 py-2">#</th><th className="px-2 py-2">Key</th><th className="px-2 py-2">Status</th><th className="px-2 py-2">Used By</th><th className="whitespace-nowrap px-2 py-2">Created</th><th className="px-2 py-2">Copy</th></tr></thead>
        <tbody>
          {keys.map((teamKey, index) => <tr className="border-b border-white/10" key={teamKey._id}>
            <td className="px-2 py-2">{index + 1}</td>
            <td className="whitespace-nowrap px-2 py-2 font-mono font-medium tracking-wide"><FaKey className="mr-1.5 inline text-[#d4a84f]" />{teamKey.key}</td>
            <td className="px-2 py-2"><b className={`rounded px-1.5 py-0.5 ${teamKey.status === "used" ? "bg-[#7a1f1f] text-[#ff9d9d]" : "bg-[#76511d] text-[#f2d590]"}`}>{teamKey.status === "used" ? "Used" : "Free"}</b></td>
            <td className="whitespace-nowrap px-2 py-2">{teamKey.team?.name || "—"}</td>
            <td className="whitespace-nowrap px-2 py-2">{new Date(teamKey.createdAt).toLocaleDateString()}</td>
            <td className="px-2 py-2"><button className="rounded p-1.5 text-[#9faab2] hover:text-white" type="button" onClick={() => copyKey(teamKey.key)} aria-label={`Copy key ${teamKey.key}`}>{copiedKey === teamKey.key ? <FaCheck className="text-[#d4a84f]" /> : <FaCopy />}</button></td>
          </tr>)}
          {!keys.length && <tr><td className="px-2 py-6 text-center text-[#8b979d]" colSpan={6}>No keys generated yet.</td></tr>}
        </tbody>
      </table>
    </div>}
  </section>;
};

export default AdminTeamKeysView;
